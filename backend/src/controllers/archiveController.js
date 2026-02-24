import Archive from '../models/Archive.js';

export const getAllArchives = async (req, res) => {
  try {
    const { category, year } = req.query;
    let query = {};

    if (category) query.category = category;
    if (year) query.year = Number(year);

    const archives = await Archive.find(query).sort({ year: -1, createdAt: -1 });

    res.json({
      success: true,
      count: archives.length,
      data: archives,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArchiveById = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ message: 'Archive not found' });

    res.json({ success: true, data: archive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createArchive = async (req, res) => {
  try {
    const archive = await Archive.create(req.body);
    res.status(201).json({ success: true, data: archive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateArchive = async (req, res) => {
  try {
    const archive = await Archive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!archive) return res.status(404).json({ message: 'Archive not found' });

    res.json({ success: true, data: archive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteArchive = async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ message: 'Archive not found' });

    await archive.deleteOne();
    res.json({ success: true, message: 'Archive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
