import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import * as xlsx from 'xlsx';
import { welcomeEmailTemplate } from "../utils/emailTemplates/welcomeTemplate.js";
import { randomBytes } from "crypto";

export const getAllUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;

    let query = { isActive: true };

    if (role) {
      query.role = role;
    }

    if (department) {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const bulkUploadUsers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Parse workbook
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert to JSON — treat first row as headers
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Spreadsheet is empty' });
    }

    const errors = [];
    let imported = 0;
    const createdUsers = [];

    // Helper to generate random password
   const generatePassword = (len = 10) =>
  randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);

    // Process rows sequentially (safe, easier to handle emails). Can be parallelized later.
    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // +2 because row 1 is header in Excel
      const raw = rows[i];

      // Normalize header names: accept either fullName OR firstName+lastName
      // Expected columns in Excel (case-insensitive): firstName, lastName, email, password, role, graduationYear, department, company, position
      const firstName = (raw.firstName || raw.FirstName || raw['First Name'] || '').toString().trim();
      const lastName = (raw.lastName || raw.LastName || raw['Last Name'] || '').toString().trim();
      const email = (raw.email || raw.Email || '').toString().trim().toLowerCase();
      const passwordRaw = (raw.password || raw.Password || '').toString();
      const roleRaw = (raw.role || raw.Role || '').toString().trim().toLowerCase();
      const graduationYear = raw.graduationYear || raw.GraduationYear || raw['Graduation Year'] || undefined;
      const department = (raw.department || raw.Department || '').toString().trim();
      const company = (raw.company || raw.Company || '').toString().trim();
      const position = (raw.position || raw.Position || '').toString().trim();

      // Basic validations
      if (!email) {
        errors.push({ row: rowNumber, message: 'Email is required', data: raw });
        continue;
      }

      // Validate email format quick check
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        errors.push({ row: rowNumber, message: 'Invalid email format', data: raw });
        continue;
      }

      // Name handling: if first/last missing, you may accept fullName column
      let fullName = (raw.fullName || raw['Full Name'] || '').toString().trim();
      if (!fullName) {
        if (firstName && lastName) fullName = `${firstName} ${lastName}`.trim();
        else if (firstName && !lastName) fullName = firstName;
        else if (!firstName && lastName) fullName = lastName;
      }

      if (!fullName) {
        errors.push({ row: rowNumber, message: 'Full name (firstName/lastName) is required', data: raw });
        continue;
      }

      // Role normalization
      let role = ['admin', 'alumni', 'student'].includes(roleRaw) ? roleRaw : 'student';

      // Check existing
      const exists = await User.findOne({ email }).lean();
      if (exists) {
        errors.push({ row: rowNumber, message: 'Email already exists', data: raw });
        continue;
      }

      // Password handling: if blank -> auto generate
      const password = passwordRaw && passwordRaw.length >= 6 ? passwordRaw : generatePassword(10);

      // Build user object
      const userObj = {
        email,
        password, // will be hashed by pre-save middleware
        fullName,
        role,
        graduationYear: graduationYear ? Number(graduationYear) : undefined,
        department: department || undefined,
        company: company || undefined,
        position: position || undefined,
      };

      try {
        const newUser = await User.create(userObj); // triggers pre('save') to hash password
        imported++;
        createdUsers.push({ user: newUser, plainPassword: password }); // plainPassword used to email user

        // Send email with credentials (async, but we await to avoid spamming)
        try {
          const subject = 'Welcome to Alumni Connect — Your account details';
          const html = `
            <p>Hi ${newUser.fullName.split(' ')[0] || newUser.fullName},</p>
            <p>Your account has been created on <strong>Alumni Connect</strong>.</p>
            <p><strong>Email:</strong> ${newUser.email}</p>
            <p><strong>Password:</strong> ${password}</p>
            <p>Please login at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Login</a> and change your password.</p>
            <p>— Team</p>
          `;
        const firstName = newUser.fullName?.split(" ")[0] || newUser.fullName;

await sendEmail(
  newUser.email,
  "Welcome to Alumni Connect!",
  welcomeEmailTemplate(firstName)
);

        } catch (mailErr) {
          // Don't mark as failure if email failed — but include in errors array
          errors.push({ row: rowNumber, message: `Imported but email failed: ${mailErr.message}`, data: raw });
        }
      } catch (dbErr) {
        errors.push({ row: rowNumber, message: `DB error: ${dbErr.message}`, data: raw });
      }
    } // end rows loop

    return res.status(200).json({
      success: true,
      imported,
      failed: errors.length,
      errors,
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};