import Job from '../models/Job.js';

export const getAllJobs = async (req, res) => {
  try {
    const { location, role, company, isActive = 'true' } = req.query;
    let query = { isActive: isActive === 'true' };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (role) {
      query.role = { $regex: role, $options: 'i' };
    }

    if (company) {
      query.company = { $regex: company, $options: 'i' };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'fullName email company position avatarUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'fullName email company position avatarUrl')
      .populate('applications.userId', 'fullName email avatarUrl');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// export const createJob = async (req, res) => {
//   try {
//     const job = await Job.create({
//       ...req.body,
//       postedBy: req.user._id,
//     });

//     const populatedJob = await Job.findById(job._id)
//       .populate('postedBy', 'fullName email company position avatarUrl');

//     res.status(201).json({
//       success: true,
//       data: populatedJob,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const createJob = async (req, res) => {
  try {
    const { applyLink } = req.body;

    if (!applyLink) {
      return res.status(400).json({ message: "Apply link is required" });
    }

    const job = await Job.create({
      ...req.body,
      postedBy: req.user._id,
      applyLink,
    });

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'fullName email company position avatarUrl');

    res.status(201).json({
      success: true,
      data: populatedJob,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// export const updateJob = async (req, res) => {
//   try {
//     let job = await Job.findById(req.params.id);

//     if (!job) {
//       return res.status(404).json({ message: 'Job not found' });
//     }

//     if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
//       return res.status(403).json({ message: 'Not authorized to update this job' });
//     }

//     job = await Job.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     }).populate('postedBy', 'fullName email company position avatarUrl');

//     res.json({
//       success: true,
//       data: job,
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // allow updating applyLink as well
    job = await Job.findByIdAndUpdate(
      req.params.id,
      { ...req.body },   // contains applyLink if sent
      { new: true, runValidators: true }
    ).populate('postedBy', 'fullName email company position avatarUrl');

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await job.deleteOne();

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = job.applications.some(
      (app) => app.userId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    job.applications.push({
      userId: req.user._id,
    });

    await job.save();

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: job,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
