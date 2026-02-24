import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { upload } from '../middleware/upload.js';

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, graduationYear, department, company, position } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const fullName = `${firstName} ${lastName}`;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      email, password, fullName,
      role: role || 'student',
      graduationYear, department, company, position,
    });

    res.status(201).json({
      _id: user._id, email: user.email, fullName: user.fullName, role: user.role,
      graduationYear: user.graduationYear, department: user.department,
      company: user.company, position: user.position, avatarUrl: user.avatarUrl,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isActive) return res.status(401).json({ message: 'Account is deactivated' });

    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(201).json({
      user: {
        _id: user._id, id: user._id, email: user.email, fullName: user.fullName,
        role: user.role, graduationYear: user.graduationYear, department: user.department,
        company: user.company, position: user.position, avatarUrl: user.avatarUrl,
        phone: user.phone, industry: user.industry, experience: user.experience,
        skills: user.skills, linkedinUrl: user.linkedinUrl, portfolioUrl: user.portfolioUrl,
        location: user.location, bio: user.bio, resumeUrl: user.resumeUrl,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      _id: user._id, id: user._id, email: user.email, fullName: user.fullName,
      role: user.role, graduationYear: user.graduationYear, department: user.department,
      company: user.company, position: user.position, avatarUrl: user.avatarUrl,
      phone: user.phone, industry: user.industry, experience: user.experience,
      skills: user.skills, linkedinUrl: user.linkedinUrl, portfolioUrl: user.portfolioUrl,
      location: user.location, bio: user.bio, resumeUrl: user.resumeUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedFields = [
      'fullName', 'department', 'company', 'position', 'avatarUrl',
      'graduationYear', 'phone', 'industry', 'experience', 'skills',
      'linkedinUrl', 'portfolioUrl', 'location', 'bio', 'resumeUrl',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.body.password) user.password = req.body.password;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id, id: updatedUser._id, email: updatedUser.email,
      fullName: updatedUser.fullName, role: updatedUser.role,
      graduationYear: updatedUser.graduationYear, department: updatedUser.department,
      company: updatedUser.company, position: updatedUser.position,
      avatarUrl: updatedUser.avatarUrl, phone: updatedUser.phone,
      industry: updatedUser.industry, experience: updatedUser.experience,
      skills: updatedUser.skills, linkedinUrl: updatedUser.linkedinUrl,
      portfolioUrl: updatedUser.portfolioUrl, location: updatedUser.location,
      bio: updatedUser.bio, resumeUrl: updatedUser.resumeUrl,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.avatarUrl = url;
    await user.save();

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const url = `/uploads/resumes/${req.file.filename}`;
    const user = await User.findById(req.user._id);
    user.resumeUrl = url;
    await user.save();

    res.json({ url });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
