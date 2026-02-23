# Quick Start Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (already configured)

## Setup (5 minutes)

### Step 1: Frontend Setup
```bash
# From project root
npm install
npm run dev
```
Frontend opens at: `http://localhost:5173`

### Step 2: Backend Setup
```bash
# From project root
cd backend
npm install
npm run dev
```
Backend runs at: `http://localhost:5000`

### Step 3: Access Application
1. Open `http://localhost:5173` in browser
2. Login with test credentials
3. Navigate to Messages section
4. Start chatting!

## Project Structure at a Glance

```
project/
├── src/                 # Frontend React app
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   └── context/        # Auth context
├── backend/            # Node.js Express server
│   ├── auth/           # Auth microservice
│   ├── messaging/      # Messaging microservice
│   ├── users/          # Users microservice
│   └── common/         # Shared utilities
├── supabase/          # Database migrations
└── dist/              # Production build
```

## Available Scripts

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run linter
```

### Backend
```bash
npm run dev      # Start with auto-reload
npm start        # Start production server
```

## Test the Messaging Feature

1. Open two browser windows
2. Login as different users (student and alumni)
3. Navigate to Messages in both
4. Click + button to start new conversation
5. Select the other user
6. Send messages and see real-time updates

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Supabase Connection Error
- Verify `.env` has correct credentials
- Check `VITE_SUPABASE_URL` and keys are valid
- For backend, ensure `SUPABASE_SERVICE_ROLE_KEY` is set

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Environment Variables

### Frontend (`.env`)
```
VITE_SUPABASE_URL=https://gjxvcpclzmdpuzeehvyc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GEMINI_API_KEY=  # Optional, for AI features
```

### Backend (`backend/.env`)
```
VITE_SUPABASE_URL=https://gjxvcpclzmdpuzeehvyc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=5000
NODE_ENV=development
```

## Features to Try

- ✅ Login/Signup with different roles
- ✅ Real-time messaging
- ✅ Conversation search
- ✅ User profiles
- ✅ Admin dashboard
- ✅ Analytics
- ✅ Games (Sudoku, 8 Queens)

## Useful Links

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Supabase Dashboard: `https://app.supabase.com`
- API Documentation: See `BACKEND_SETUP.md`

## Next Steps

1. Test all features locally
2. Customize branding and content
3. Deploy frontend to Vercel/Netlify
4. Deploy backend to Railway/Render
5. Set up custom domain

## Support

For detailed documentation:
- Backend setup: See `BACKEND_SETUP.md`
- Project overview: See `PROJECT_OVERVIEW.md`
- Features: See `FEATURES.md`
