import mongoose from 'mongoose';

const archiveSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 1900,
      max: 2100,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Awards', 'Research', 'Infrastructure', 'Other'],
    },
  },
  {
    timestamps: true,
  }
);

const Archive = mongoose.model('Archive', archiveSchema);

export default Archive;
