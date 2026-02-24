import GalleryItem from '../models/GalleryItem.js';

export const getAllGalleryItems = async (req, res) => {
  try {
    const items = await GalleryItem.find()
      .populate('uploadedBy', 'fullName email avatarUrl')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGalleryItemById = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id)
      .populate('uploadedBy', 'fullName email avatarUrl');

    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    let mediaUrl = req.body.mediaUrl;

    // If file was uploaded via multer
    if (req.file) {
      mediaUrl = `/uploads/gallery/${req.file.filename}`;
    }

    if (!mediaUrl) {
      return res.status(400).json({ message: 'Media URL or file is required' });
    }

    const item = await GalleryItem.create({
      title: req.body.title,
      description: req.body.description,
      mediaUrl,
      mediaType: req.body.mediaType || 'photo',
      uploadedBy: req.user._id,
    });

    const populated = await GalleryItem.findById(item._id)
      .populate('uploadedBy', 'fullName email avatarUrl');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    let item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    item = await GalleryItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('uploadedBy', 'fullName email avatarUrl');

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Gallery item not found' });

    await item.deleteOne();
    res.json({ success: true, message: 'Gallery item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
