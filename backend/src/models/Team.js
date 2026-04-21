import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, trim: true },
    tempPassword: { type: String }, // stored temporarily so admin can resend
    invited: { type: Boolean, default: false },
    joinedAt: { type: Date },
  },
  { _id: false }
);

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    purpose: { type: String, trim: true },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    permissions: {
      type: [String],
      enum: [
        'manage_events',
        'moderate_posts',
        'manage_mentorship',
        'verify_data',
        'manage_gallery',
        'event_participation',
        'whiteboard',
        'roadmap',
        'pipelining',
      ],
      default: [
        'manage_events',
        'moderate_posts',
        'manage_mentorship',
        'verify_data',
        'whiteboard',
        'roadmap',
        'pipelining',
      ],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired'],
      default: 'pending',
    },
    durationDays: { type: Number, min: 10, max: 30 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

teamSchema.index({ status: 1, expiresAt: 1 });
teamSchema.index({ 'members.userId': 1 });

const Team = mongoose.model('Team', teamSchema);
export default Team;
