# Alumni Connect - Alumni Engagement Platform

A comprehensive full-stack React application for connecting alumni, students, and administrators within a unified digital space.

## Features

### 🎯 Role-Based Dashboards

#### Admin Dashboard
- User management with search and filtering
- **Events Management**: Create, edit, and delete events with full CRUD operations
- **Advanced Analytics**: Deep insights with multiple chart types (pie, bar, line, area charts)
- Comprehensive platform oversight with real-time metrics

#### Alumni Dashboard
- Share posts and updates with the community
- Post job opportunities for students
- Access newsletters, gallery, and archives
- Play interactive games (8 Queens Puzzle & Mini Sudoku)
- AI-powered helper for quick assistance

#### Student Dashboard
- **Mentorship Program**: Request mentorship from alumni with detailed profiles
- Browse job opportunities with advanced filtering
- View community posts and updates
- Access newsletters, gallery, and archives
- Play interactive games and compete on leaderboards

### 🎮 Interactive Games
- **8 Queens Puzzle**: Place 8 queens on a chessboard with no conflicts
- **Mini Sudoku**: 4×4 grid puzzle with timer and scoring
- Leaderboards for competitive gameplay
- Score tracking with time-based achievements
- Available for both Alumni and Students

### 🤖 AI Helper Sidebar
- Floating assistant accessible from bottom-right corner
- Job suggestions based on profile
- Newsletter summaries
- FAQ answering
- Chat history stored persistently

### 📚 Additional Features
- **Home Page**: Beautiful landing page showcasing platform features
- **Events Management**: Full CRUD operations for institutional events
- **Newsletter Page**: Browse institutional updates and announcements
- **Gallery**: Photo and video collection with lightbox view
- **Archives**: Institutional achievements and milestones
- **Jobs Board**: Alumni-posted opportunities with advanced filtering
- **Mentorship System**: Comprehensive program connecting students with alumni mentors
- **Advanced Analytics**: Multiple chart types showing user distribution, engagement trends, and performance metrics

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Authentication**: JWT-based with bcrypt
- **Data Storage**: LocalStorage (mock data layer ready for database integration)

## Demo Credentials

### Admin Account
- **Email**: `admin@Alumni Connect.com`
- **Password**: `password123`

### Alumni Account
- **Email**: `alumni@Alumni Connect.com`
- **Password**: `password123`

### Student Account
- **Email**: `student@Alumni Connect.com`
- **Password**: `password123`

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Card, Input, Modal)
│   ├── games/          # Game components (8Queens, Sudoku, Leaderboard)
│   ├── Layout.tsx      # Main layout with sidebar navigation
│   └── AIHelper.tsx    # AI assistant sidebar
├── pages/              # Page components
│   ├── admin/          # Admin-specific pages
│   │   ├── AdminDashboard.tsx
│   │   ├── UsersManagement.tsx
│   │   ├── EventsManagement.tsx
│   │   └── Analytics.tsx
│   ├── alumni/         # Alumni-specific pages
│   │   └── AlumniDashboard.tsx
│   ├── Home.tsx        # Public landing page
│   ├── Login.tsx       # Authentication page
│   ├── StudentDashboard.tsx
│   ├── Mentorship.tsx  # Student mentorship program
│   ├── Games.tsx       # Games hub
│   ├── Jobs.tsx        # Job board
│   ├── Newsletters.tsx
│   ├── Gallery.tsx
│   └── Archives.tsx
├── context/            # React context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/                # Utilities and helpers
│   ├── mockData.ts     # Demo data
│   └── storage.ts      # LocalStorage abstraction layer
├── types/              # TypeScript type definitions
│   └── index.ts
└── App.tsx             # Main application component
```

## Completed Modules

### ✅ Admin Modules
- **Dashboard**: Real-time statistics, user distribution charts, and engagement trends
- **User Management**: Full CRUD operations with search and filtering
- **Events Management**: Create, edit, and delete events with date/time management
- **Advanced Analytics**: Multiple chart types including pie, bar, line, and area charts showing detailed insights

### ✅ Alumni Modules
- **Dashboard**: Personal stats, community posts, job listings, and upcoming events
- **Job Board**: Post and browse opportunities with filtering
- **Games Section**: 8 Queens Puzzle and Mini Sudoku with leaderboards
- **All Shared Pages**: Access to newsletters, gallery, and archives

### ✅ Student Modules
- **Dashboard**: Mentorship stats, alumni connections, and job opportunities
- **Mentorship Program**: Browse alumni mentors, send requests, track status
- **Games Section**: Full access to interactive games and leaderboards
- **All Shared Pages**: Job board, newsletters, gallery, and archives

### ✅ Shared Features
- **Home Page**: Beautiful landing page with feature showcase and statistics
- **AI Helper**: Floating sidebar assistant for all authenticated users
- **Responsive Design**: Mobile-first approach with collapsible navigation
- **Authentication**: Secure JWT-based login with role-based access control

## Key Features Implementation

### Authentication System
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Admin, Alumni, Student)
- Protected routes based on user role
- Persistent sessions using LocalStorage

### Data Management
- Mock data layer with LocalStorage persistence
- Ready for database integration (structured for Supabase)
- Type-safe operations with TypeScript

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile devices
- Optimized layouts for all screen sizes
- Touch-friendly interactions

### UI/UX Excellence
- Smooth animations with Framer Motion
- Clean, professional design with TailwindCSS
- Intuitive navigation and user flows
- Accessible components following best practices

## Future Enhancements

- Real-time notifications
- Email integration for newsletters
- Advanced search and filtering
- Social features (comments, reactions)
- Video conferencing for mentorship
- Mobile app version
- Database integration with Supabase

## License

MIT License - feel free to use this project for learning or production purposes.

## Support

For issues or questions, please open an issue in the repository.

---

Built with ❤️ using React, TypeScript, and TailwindCSS
