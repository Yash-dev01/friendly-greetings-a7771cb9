import Team from '../models/Team.js';
import TeamWorkspace from '../models/TeamWorkspace.js';

// Helper: ensure user is part of the team & team is active
const ensureMember = async (teamId, user) => {
  const team = await Team.findById(teamId);
  if (!team) return { error: { status: 404, message: 'Team not found' } };
  if (team.status !== 'approved' || (team.expiresAt && team.expiresAt < new Date())) {
    return { error: { status: 403, message: 'Team not active' } };
  }
  const userId = String(user._id);
  const isMember =
    String(team.requestedBy) === userId ||
    team.members.some((m) => String(m.userId) === userId);
  if (!isMember && user.role !== 'admin') {
    return { error: { status: 403, message: 'Not a team member' } };
  }
  return { team };
};

const getOrCreateWorkspace = async (teamId) => {
  let ws = await TeamWorkspace.findOne({ teamId });
  if (!ws) ws = await TeamWorkspace.create({ teamId });
  return ws;
};

const logActivity = (ws, userId, action, meta) => {
  ws.activity.push({ userId, action, meta });
  if (ws.activity.length > 200) ws.activity = ws.activity.slice(-200);
};

export const getWorkspace = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    const populated = await TeamWorkspace.findById(ws._id)
      .populate('tasks.assignedTo', 'fullName email avatarUrl')
      .populate('tasks.createdBy', 'fullName email avatarUrl')
      .populate('notes.authorId', 'fullName email avatarUrl')
      .populate('messages.senderId', 'fullName email avatarUrl')
      .populate('activity.userId', 'fullName email avatarUrl');
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tasks
export const addTask = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.tasks.push({ ...req.body, createdBy: req.user._id });
    logActivity(ws, req.user._id, 'task_created', { title: req.body.title });
    await ws.save();
    res.status(201).json({ success: true, data: ws.tasks[ws.tasks.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    const task = ws.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    Object.assign(task, req.body);
    logActivity(ws, req.user._id, 'task_updated', { title: task.title, status: task.status });
    await ws.save();
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.tasks = ws.tasks.filter((t) => String(t._id) !== req.params.taskId);
    logActivity(ws, req.user._id, 'task_deleted', { taskId: req.params.taskId });
    await ws.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Notes
export const addNote = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.notes.push({ ...req.body, authorId: req.user._id });
    logActivity(ws, req.user._id, 'note_added', { title: req.body.title });
    await ws.save();
    res.status(201).json({ success: true, data: ws.notes[ws.notes.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.notes = ws.notes.filter((n) => String(n._id) !== req.params.noteId);
    logActivity(ws, req.user._id, 'note_deleted', { noteId: req.params.noteId });
    await ws.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Messages (also broadcast via socket from server.js)
export const sendMessage = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.messages.push({ senderId: req.user._id, content: req.body.content });
    if (ws.messages.length > 500) ws.messages = ws.messages.slice(-500);
    await ws.save();
    const msg = ws.messages[ws.messages.length - 1];
    res.status(201).json({ success: true, data: { ...msg.toObject(), sender: { _id: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl } } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Roadmap
export const addRoadmapItem = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.roadmap.push(req.body);
    logActivity(ws, req.user._id, 'roadmap_added', { title: req.body.title });
    await ws.save();
    res.status(201).json({ success: true, data: ws.roadmap[ws.roadmap.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRoadmapItem = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    const item = ws.roadmap.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    Object.assign(item, req.body);
    logActivity(ws, req.user._id, 'roadmap_updated', { title: item.title, stage: item.stage });
    await ws.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteRoadmapItem = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.roadmap = ws.roadmap.filter((i) => String(i._id) !== req.params.itemId);
    await ws.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Whiteboard - persist a stroke
export const addWhiteboardStroke = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.whiteboard.push({ ...req.body, authorId: req.user._id });
    if (ws.whiteboard.length > 2000) ws.whiteboard = ws.whiteboard.slice(-2000);
    await ws.save();
    res.status(201).json({ success: true, data: ws.whiteboard[ws.whiteboard.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const clearWhiteboard = async (req, res) => {
  try {
    const check = await ensureMember(req.params.teamId, req.user);
    if (check.error) return res.status(check.error.status).json({ success: false, message: check.error.message });
    const ws = await getOrCreateWorkspace(req.params.teamId);
    ws.whiteboard = [];
    logActivity(ws, req.user._id, 'whiteboard_cleared');
    await ws.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
