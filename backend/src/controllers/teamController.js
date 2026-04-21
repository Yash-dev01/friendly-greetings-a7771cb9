import crypto from 'crypto';
import Team from '../models/Team.js';
import TeamWorkspace from '../models/TeamWorkspace.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';
import { teamInviteCredentialsTemplate } from '../utils/emailTemplates/teamInviteCredentialsTemplate.js';

const generateTempPassword = () =>
  crypto.randomBytes(6).toString('base64').replace(/[/+=]/g, '').slice(0, 10) + '!1';

// 🟡 Alumni: create a team request
export const createTeamRequest = async (req, res) => {
  try {
    const { name, purpose, memberEmails = [], permissions } = req.body;
    if (!name || !memberEmails.length) {
      return res
        .status(400)
        .json({ success: false, message: 'Name and at least one member email are required' });
    }

    const members = memberEmails
      .map((e) => String(e).toLowerCase().trim())
      .filter(Boolean)
      .map((email) => ({ email }));

    const team = await Team.create({
      name,
      purpose,
      requestedBy: req.user._id,
      members,
      permissions: permissions?.length ? permissions : undefined,
      status: 'pending',
    });

    res.status(201).json({ success: true, data: team });
  } catch (err) {
    console.error('createTeamRequest error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟡 Alumni: my own team requests
export const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({ requestedBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('members.userId', 'fullName email avatarUrl role');
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔴 Admin: list all team requests
export const getAllTeamRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const teams = await Team.find(filter)
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'fullName email role avatarUrl company')
      .populate('members.userId', 'fullName email avatarUrl role');
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔴 Admin: approve request — set duration, generate creds for student members
export const approveTeamRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { durationDays = 14 } = req.body;
    const days = Math.max(10, Math.min(30, Number(durationDays) || 14));

    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    if (team.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Team already approved' });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // For each member email — find or create student user with temp password & team role
    for (const member of team.members) {
      let user = await User.findOne({ email: member.email });
      const tempPassword = generateTempPassword();

      if (!user) {
        user = await User.create({
          email: member.email,
          password: tempPassword,
          fullName: member.email.split('@')[0],
          role: 'student',
        });
      } else {
        user.password = tempPassword; // pre-save hook will hash
        await user.save();
      }

      member.userId = user._id;
      member.fullName = user.fullName;
      member.tempPassword = tempPassword;
      member.invited = true;

      // Send credentials email (best-effort)
      try {
        await sendEmail(
          member.email,
          `You're invited to the ${team.name} team on Alumni Connect`,
          teamInviteCredentialsTemplate({
            fullName: user.fullName,
            email: member.email,
            tempPassword,
            teamName: team.name,
            durationDays: days,
            expiresAt,
          })
        );
      } catch (mailErr) {
        console.error('Email send failed for', member.email, mailErr.message);
      }
    }

    team.status = 'approved';
    team.durationDays = days;
    team.startsAt = now;
    team.expiresAt = expiresAt;
    team.approvedBy = req.user._id;
    team.approvedAt = now;
    await team.save();

    // Initialize workspace
    await TeamWorkspace.findOneAndUpdate(
      { teamId: team._id },
      { $setOnInsert: { teamId: team._id } },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: team });
  } catch (err) {
    console.error('approveTeamRequest error', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔴 Admin: reject
export const rejectTeamRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const team = await Team.findByIdAndUpdate(
      id,
      { status: 'rejected', rejectionReason: reason },
      { new: true }
    );
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Member or alumni or admin: list teams I belong to (active)
export const getMyMemberTeams = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const teams = await Team.find({
      status: 'approved',
      expiresAt: { $gt: now },
      $or: [{ requestedBy: userId }, { 'members.userId': userId }],
    })
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'fullName email avatarUrl')
      .populate('members.userId', 'fullName email avatarUrl');
    res.json({ success: true, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🟢 Get single team detail (must be member)
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('requestedBy', 'fullName email avatarUrl role')
      .populate('members.userId', 'fullName email avatarUrl role');
    if (!team) return res.status(404).json({ success: false, message: 'Not found' });

    const userId = String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const isMember =
      String(team.requestedBy?._id || team.requestedBy) === userId ||
      team.members.some((m) => String(m.userId?._id || m.userId) === userId);
    if (!isAdmin && !isMember) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
