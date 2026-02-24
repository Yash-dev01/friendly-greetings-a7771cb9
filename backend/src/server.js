import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';
import profileRoutes from './routes/profileRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import mentorshipRoutes from './routes/mentorshipRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import feedRoutes from './routes/feedRoutes.js';
import galleryRoutes from './routes/galleryRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import archiveRoutes from './routes/archiveRoutes.js';

dotenv.config();
const app = express();
const httpServer = createServer(app);
app.set("trust proxy", 1);

// 📌 DB
connectDB();

// 📌 CORS origins


// 📌 Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://alumnni-connect.netlify.app",
  "https://friendly-greetings-a7771cb9.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// 📌 Rate limiter 
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: 'Too many requests from this IP, please try again later.',
// });
// app.use('/api/', limiter);

// 💚 Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// 🔥 ROUTES

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/archives', archiveRoutes);


app.use('/api/profile', profileRoutes);


app.use('/uploads', express.static('uploads'));

// ❗404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// 🔌 Socket.io for real-time mentorship chat
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Track online users: userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User registers their userId on connect
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} registered with socket ${socket.id}`);
  });

  // Join a mentorship chat room (conversationId)
  socket.on('join_chat', (conversationId) => {
    socket.join(conversationId);
    console.log(`📥 Socket ${socket.id} joined chat ${conversationId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (conversationId) => {
    socket.leave(conversationId);
  });

  // Send a message in real-time
  socket.on('send_message', (data) => {
    // data: { conversationId, senderId, content, createdAt }
    // Broadcast to everyone in the room except sender
    socket.to(data.conversationId).emit('receive_message', data);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    // data: { conversationId, userId, fullName }
    socket.to(data.conversationId).emit('user_typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.conversationId).emit('user_stop_typing', data);
  });

  socket.on('disconnect', () => {
    // Remove from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

// 🚀 Server start
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
