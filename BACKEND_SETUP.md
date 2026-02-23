# Backend Setup Guide

## Overview

The backend is organized as a Node.js Express microservices architecture with separate folders for each functionality.

## Directory Structure

```
backend/
├── auth/
│   └── src/
│       ├── index.js      (Auth service app)
│       └── routes.js     (Auth endpoints)
├── messaging/
│   └── src/
│       ├── index.js      (Messaging service app)
│       └── routes.js     (Messaging endpoints)
├── users/
│   └── src/
│       ├── index.js      (Users service app)
│       └── routes.js     (Users endpoints)
├── common/
│   └── src/
│       ├── config.js     (Configuration)
│       ├── supabaseClient.js (Supabase setup)
│       └── middleware.js  (Auth & error handling)
├── index.js            (Main server)
├── package.json        (Dependencies)
├── .env                (Environment variables)
├── .env.example        (Example env template)
└── README.md          (Backend documentation)
```

## Microservices

### 1. Authentication Service (`/api/auth`)
Handles user authentication, registration, and session management.

**Endpoints:**
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/refresh` - Refresh authentication token

### 2. Messaging Service (`/api/messages`)
Manages conversations and messages between users.

**Endpoints:**
- `GET /api/messages/conversations` - List user conversations
- `POST /api/messages/conversations` - Create/get conversation
- `GET /api/messages/messages/:conversationId` - Get messages in conversation
- `POST /api/messages/messages/:conversationId` - Send message
- `PUT /api/messages/read/:conversationId` - Mark conversation as read

### 3. Users Service (`/api/users`)
Manages user profiles and information.

**Endpoints:**
- `GET /api/users` - List users (supports `?role=alumni` filter)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile

## Running the Backend

### Installation

```bash
cd backend
npm install
```

### Configuration

Create a `.env` file in the backend folder with Supabase credentials:

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
PORT=5000
NODE_ENV=development
```

### Start Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## Architecture Benefits

1. **Separation of Concerns** - Each microservice handles one domain
2. **Easy to Scale** - Each service can be deployed independently
3. **Code Reusability** - Common utilities shared across services
4. **Maintainability** - Clear file organization and responsibility
5. **Testing** - Each service can be tested independently

## Common Utilities

Located in `backend/common/src/`:

- **config.js** - Centralized configuration management
- **supabaseClient.js** - Singleton Supabase client instance
- **middleware.js** - Authentication and error handling middleware

## Database

Uses Supabase PostgreSQL with the following tables:

- `profiles` - User profiles (auth.users linked)
- `conversations` - Conversations between users
- `messages` - Individual messages
- `read_receipts` - Unread message tracking

All tables have Row Level Security (RLS) enabled for data protection.

## API Response Format

Success response:
```json
{
  "data": {...}
}
```

Error response:
```json
{
  "error": "Error message"
}
```

## Frontend Integration

Frontend calls backend via fetch with JWT tokens:

```javascript
const response = await fetch('http://localhost:5000/api/messages/conversations', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Environment Variables

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

1. **Connection errors** - Check Supabase credentials in .env
2. **Auth fails** - Ensure JWT tokens are valid and include Authorization header
3. **Port already in use** - Change PORT in .env or kill the process using it

## Next Steps

1. Install backend dependencies: `cd backend && npm install`
2. Configure .env with Supabase credentials
3. Start backend server: `npm run dev`
4. Update frontend API endpoints to use `http://localhost:5000`
