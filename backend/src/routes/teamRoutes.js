import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createTeamRequest,
  getMyTeams,
  getAllTeamRequests,
  approveTeamRequest,
  rejectTeamRequest,
  getMyMemberTeams,
  getTeamById,
} from '../controllers/teamController.js';
import {
  getWorkspace,
  addTask,
  updateTask,
  deleteTask,
  addNote,
  deleteNote,
  sendMessage,
  addRoadmapItem,
  updateRoadmapItem,
  deleteRoadmapItem,
  addWhiteboardStroke,
  clearWhiteboard,
} from '../controllers/teamWorkspaceController.js';

const router = express.Router();

// Alumni
router.post('/request', protect, authorize('alumni', 'admin'), createTeamRequest);
router.get('/mine', protect, getMyTeams);
router.get('/active', protect, getMyMemberTeams);

// Admin
router.get('/requests', protect, authorize('admin'), getAllTeamRequests);
router.put('/:id/approve', protect, authorize('admin'), approveTeamRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectTeamRequest);

// Single team
router.get('/:id', protect, getTeamById);

// Workspace
router.get('/:teamId/workspace', protect, getWorkspace);
router.post('/:teamId/tasks', protect, addTask);
router.put('/:teamId/tasks/:taskId', protect, updateTask);
router.delete('/:teamId/tasks/:taskId', protect, deleteTask);

router.post('/:teamId/notes', protect, addNote);
router.delete('/:teamId/notes/:noteId', protect, deleteNote);

router.post('/:teamId/messages', protect, sendMessage);

router.post('/:teamId/roadmap', protect, addRoadmapItem);
router.put('/:teamId/roadmap/:itemId', protect, updateRoadmapItem);
router.delete('/:teamId/roadmap/:itemId', protect, deleteRoadmapItem);

router.post('/:teamId/whiteboard', protect, addWhiteboardStroke);
router.delete('/:teamId/whiteboard', protect, clearWhiteboard);

export default router;
