import Newsletter from '../models/Newsletter.js';

export const getAllNewsletters = async (req, res) => {
  try {
    const { published } = req.query;
    let query = {};

    if (published === 'true') {
      query.isPublished = true;
    }

    const newsletters = await Newsletter.find(query)
      .populate('createdBy', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: newsletters.length, data: newsletters });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getNewsletterById = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id)
      .populate('createdBy', 'fullName email avatarUrl');

    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.create({
      ...req.body,
      createdBy: req.user._id,
    });

    const populated = await Newsletter.findById(newsletter._id)
      .populate('createdBy', 'fullName email avatarUrl');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateNewsletter = async (req, res) => {
  try {
    let newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    newsletter = await Newsletter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'fullName email avatarUrl');

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    await newsletter.deleteOne();
    res.json({ success: true, message: 'Newsletter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const publishNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    newsletter.isPublished = true;
    newsletter.publishedDate = new Date();
    await newsletter.save();

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const unpublishNewsletter = async (req, res) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) return res.status(404).json({ message: 'Newsletter not found' });

    newsletter.isPublished = false;
    await newsletter.save();

    res.json({ success: true, data: newsletter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
