import MentorshipRequest from '../models/MentorshipRequest.js';

export const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'alumni') {
      query.alumniId = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const requests = await MentorshipRequest.find(query)
      .populate('studentId', 'fullName email avatarUrl department graduationYear')
      .populate('alumniId', 'fullName email avatarUrl company position department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id)
      .populate('studentId', 'fullName email avatarUrl department graduationYear')
      .populate('alumniId', 'fullName email avatarUrl company position department');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRequest = async (req, res) => {
  try {
    const { alumniId, message } = req.body;

    const existingRequest = await MentorshipRequest.findOne({
      studentId: req.user._id,
      alumniId,
      status: { $in: ['pending', 'accepted'] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have an active request with this alumni',
      });
    }

    const request = await MentorshipRequest.create({
      studentId: req.user._id,
      alumniId,
      message,
    });

    const populatedRequest = await MentorshipRequest.findById(request._id)
      .populate('studentId', 'fullName email avatarUrl department graduationYear')
      .populate('alumniId', 'fullName email avatarUrl company position department');

    res.status(201).json({
      success: true,
      data: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.alumniId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    request.status = status;
    await request.save();

    const updatedRequest = await MentorshipRequest.findById(request._id)
      .populate('studentId', 'fullName email avatarUrl department graduationYear')
      .populate('alumniId', 'fullName email avatarUrl company position department');

    res.json({
      success: true,
      data: updatedRequest,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
