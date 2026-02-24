import User from '../models/User.js';

// @desc   Get logged-in user profile
// @route  GET /api/profile/me
// @access Private
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update profile
// @route  PUT /api/profile/me
// @access Private
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    const allowedFields = [
      'fullName',
      'phone',
      'company',
      'position',
      'industry',
      'experience',
      'skills',
      'linkedinUrl',
      'portfolioUrl',
      'location',
      'bio',
      'department',
      'graduationYear'
    ];

    const filteredUpdates = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      filteredUpdates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc Upload avatar
export const uploadAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl: `/uploads/avatars/${req.file.filename}` },
      { new: true }
    );

    res.json({ url: user.avatarUrl });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Upload resume
export const uploadResume = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resumeUrl: `/uploads/resumes/${req.file.filename}` },
      { new: true }
    );

    res.json({ url: user.resumeUrl });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};