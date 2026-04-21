import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

const noteSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const activitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const roadmapItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    stage: {
      type: String,
      enum: ['planned', 'in_progress', 'completed'],
      default: 'planned',
    },
    targetDate: { type: Date },
  },
  { timestamps: true }
);

const whiteboardStrokeSchema = new mongoose.Schema(
  {
    color: { type: String, default: '#000000' },
    width: { type: Number, default: 2 },
    points: { type: [[Number]], default: [] }, // [[x,y], ...]
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const workspaceSchema = new mongoose.Schema(
  {
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
      unique: true,
    },
    tasks: [taskSchema],
    notes: [noteSchema],
    messages: [messageSchema],
    activity: [activitySchema],
    roadmap: [roadmapItemSchema],
    whiteboard: [whiteboardStrokeSchema],
  },
  { timestamps: true }
);

const TeamWorkspace = mongoose.model('TeamWorkspace', workspaceSchema);
export default TeamWorkspace;
