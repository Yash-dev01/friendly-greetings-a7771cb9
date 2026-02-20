# Alumni Connect - Project Overview

## Project Structure

### Frontend (`/src`)
React + TypeScript + Tailwind CSS application with the following sections:

**Pages:**
- `Home.tsx` - Landing page
- `StudentDashboard.tsx` - Student dashboard
- `AlumniDashboard.tsx` - Alumni dashboard
- `Messages.tsx` - Messaging system (NEW)
- `Jobs.tsx` - Job listings
- `Mentorship.tsx` - Mentorship programs
- `Newsletters.tsx` - Newsletter content
- `Gallery.tsx` - Photo gallery
- `Archives.tsx` - Past events
- `Games.tsx` - Interactive games
- `Login.tsx` - Authentication

**Admin Pages:**
- `AdminDashboard.tsx` - Admin overview
- `UsersManagement.tsx` - User management
- `EventsManagement.tsx` - Event management
- `Analytics.tsx` - Analytics dashboard

**Components:**
- `Layout.tsx` - Main layout with sidebar
- `ChatBox.tsx` - Chat messaging (NEW)
- `AIHelper.tsx` - AI assistance
- `UI Components` - Reusable UI elements

### Backend (`/backend`) - NEW
Node.js Express microservices architecture:

**Services:**
1. **Auth Service** (`/api/auth`)
   - User registration and login
   - Session management
   - Token refresh

2. **Messaging Service** (`/api/messages`)
   - Conversations management
   - Message sending/receiving
   - Read receipts

3. **Users Service** (`/api/users`)
   - User profile management
   - User filtering and search

**Common Utilities:**
- Supabase client configuration
- Authentication middleware
- Error handling
- Configuration management

### Database (Supabase PostgreSQL)

**Tables:**
- `auth.users` - Authentication users
- `profiles` - User profiles
- `conversations` - Message conversations
- `messages` - Messages
- `read_receipts` - Unread tracking

All tables have Row Level Security (RLS) enabled.

## Getting Started

### Frontend

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Add Supabase credentials to .env
npm run dev
```

Backend runs on `http://localhost:5000`

## Key Features

✅ User authentication (Student, Alumni, Admin)
✅ Real-time messaging between users
✅ User profiles and filtering
✅ Job listings
✅ Mentorship programs
✅ Photo gallery
✅ Interactive games (Sudoku, 8 Queens)
✅ Admin dashboard with analytics
✅ Role-based access control
✅ Responsive design

## Technology Stack

**Frontend:**
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icons)
- Recharts (data visualization)

**Backend:**
- Node.js
- Express
- Supabase (PostgreSQL + Auth)
- CORS enabled

**Database:**
- Supabase PostgreSQL
- Row Level Security (RLS)
- JWT authentication

## Environment Variables

### Frontend (`.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GEMINI_API_KEY=
```

### Backend (`backend/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORT=5000
NODE_ENV=development
```

## API Endpoints

All endpoints require JWT token in Authorization header.

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/refresh`

### Messaging
- `GET /api/messages/conversations`
- `POST /api/messages/conversations`
- `GET /api/messages/messages/:conversationId`
- `POST /api/messages/messages/:conversationId`
- `PUT /api/messages/read/:conversationId`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `PUT /api/users/:id`

## Deployment

### Frontend
- Built with Vite
- Production build: `npm run build`
- Deploy to Vercel, Netlify, or any static host

### Backend
- Node.js application
- Can be deployed to Heroku, Railway, Render, or any Node hosting

## Database Migrations

Schema is managed through Supabase migrations:
- Location: `supabase/migrations/`
- Applied via Supabase dashboard or CLI

## Code Organization

**Frontend:**
- Clear separation of pages, components, and utilities
- Shared UI components in `/components/ui`
- Context for authentication state
- TypeScript for type safety

**Backend:**
- Microservices architecture
- Each service handles one domain
- Shared middleware and utilities
- Consistent error handling

## Next Steps

1. ✅ Setup frontend and backend
2. ✅ Configure Supabase
3. ✅ Run frontend: `npm run dev`
4. ✅ Run backend: `cd backend && npm run dev`
5. Test messaging feature
6. Deploy to production

## Documentation

- `BACKEND_SETUP.md` - Detailed backend setup guide
- `FEATURES.md` - Feature documentation
- `NAVIGATION_GUIDE.md` - User navigation guide
