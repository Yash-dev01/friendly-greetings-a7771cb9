import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Layout } from './components/Layout';
import { AIHelper } from './components/AIHelper';
import { Feed } from './pages/Feed';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import { EventsManagement } from './pages/admin/EventsManagement';
import { Analytics } from './pages/admin/Analytics';
import { GalleryManagement } from './pages/admin/GalleryManagement';
import { JobsManagement } from './pages/admin/JobsManagement';
import { NewsLetterManagement } from './pages/admin/NewsLetterManagement';
import { PostManagement } from './pages/admin/PostManagement';
import { AlumniDashboard } from './pages/alumni/AlumniDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { Games } from './pages/Games';
import { Jobs } from './pages/Jobs';
import { Newsletters } from './pages/Newsletters';
import { Gallery } from './pages/Gallery';
import { Archives } from './pages/Archives';
import { Mentorship } from './pages/Mentorship';
import { HomeDashboard }   from './pages/HomeDashboard';
import { Posts } from './pages/Posts';

import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Wrap Home to inject navigation
function HomeWrapper() {
  const navigate = useNavigate();
  return <Home onGetStarted={() => navigate('/login')} />;
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && currentPage === 'home' && !showLogin) {
    return (
      <Home
        onGetStarted={() => {
          setShowLogin(true);
          setCurrentPage('login');
        }}
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (currentPage === 'home') {
    setCurrentPage('feed');
  }
  const renderPage = () => {
    if (currentPage === 'feed') {
      return <Feed />;
    }

    if (user.role === 'admin') {
      switch (currentPage) {
        case 'homedashboard':
          return <HomeDashboard />;
        case 'dashboard':
          return <AdminDashboard />;
        case 'users':
          return <UsersManagement />;
        case 'events':
          return <EventsManagement />;
        case 'analytics':
          return <Analytics />;
        case 'admingallery':
          return <GalleryManagement />;
        case 'adminjob':
          return <JobsManagement />;
        case 'adminnews':
          return <NewsLetterManagement />;
        case 'adminpost':
          return <PostManagement />;
        default:
          return <AdminDashboard />;
      }
    }

    if (user.role === 'alumni') {
      switch (currentPage) {
        case 'homedashboard':
          return <HomeDashboard />;
        case 'dashboard':
          return <AlumniDashboard />;
        case 'jobs':
          return <Jobs />;
        case 'newsletters':
          return <Newsletters />;
        case 'gallery':
          return <Gallery />;
        case 'archives':
          return <Archives />;
        case 'games':
          return <Games />;
        case 'posts':
          return <Posts />;
        default:
          return <AlumniDashboard />;
      }
    }

    // student
    switch (currentPage) {
      case 'homedashboard':
          return <HomeDashboard />;
      case 'dashboard':
        return <StudentDashboard />;
      case 'jobs':
        return <Jobs />;
      case 'mentorship':
        return <Mentorship />;
      case 'newsletters':
        return <Newsletters />;
      case 'gallery':
        return <Gallery />;
      case 'games':
        return <Games />;
      case 'posts':
        return <Posts />;
      default:
        return <StudentDashboard />;
    }
  };

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
      <AIHelper />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      
        <Routes>
          <Route path="/" element={<HomeWrapper />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* All protected dashboard routes */}
          <Route path="/*" element={<AppContent />} />
        </Routes>

    </AuthProvider>
  );
}


export default App;

// import { useState } from 'react';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import { Home } from './pages/Home';
// import { Login } from './pages/Login';
// import { Layout } from './components/Layout';
// import { AIHelper } from './components/AIHelper';
// import { Feed } from './pages/Feed';

// import { AdminDashboard } from './pages/admin/AdminDashboard';
// import { UsersManagement } from './pages/admin/UsersManagement';
// import { EventsManagement } from './pages/admin/EventsManagement';
// import { Analytics } from './pages/admin/Analytics';
// import { AlumniDashboard } from './pages/alumni/AlumniDashboard';
// import { StudentDashboard } from './pages/StudentDashboard';
// import { Games } from './pages/Games';
// import { Jobs } from './pages/Jobs';
// import { Newsletters } from './pages/Newsletters';
// import { Gallery } from './pages/Gallery';
// import { Archives } from './pages/Archives';
// import { Mentorship } from './pages/Mentorship';

// function AppContent() {
//   const { user, isLoading } = useAuth();
//   const [currentPage, setCurrentPage] = useState('home');
//   const [showLogin, setShowLogin] = useState(false);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
//           <p className="text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user && currentPage === 'home' && !showLogin) {
//     return (
//       <Home
//         onGetStarted={() => {
//           setShowLogin(true);
//           setCurrentPage('login');
//         }}
//       />
//     );
//   }

//   if (!user) {
//     return <Login />;
//   }

//   if (currentPage === 'home') {
//     setCurrentPage('feed');
//   }

//   const renderPage = () => {
//     if (currentPage === 'feed') {
//       return <Feed />;
//     }

//     if (user.role === 'admin') {
//       switch (currentPage) {
//         case 'dashboard':
//           return <AdminDashboard />;
//         case 'users':
//           return <UsersManagement />;
//         case 'events':
//           return <EventsManagement />;
//         case 'analytics':
//           return <Analytics />;
//         default:
//           return <AdminDashboard />;
//       }
//     }

//     if (user.role === 'alumni') {
//       switch (currentPage) {
//         case 'dashboard':
//           return <AlumniDashboard />;
//         case 'jobs':
//           return <Jobs />;
//         case 'newsletters':
//           return <Newsletters />;
//         case 'gallery':
//           return <Gallery />;
//         case 'archives':
//           return <Archives />;
//         case 'games':
//           return <Games />;
//         default:
//           return <AlumniDashboard />;
//       }
//     }

//     switch (currentPage) {
//       case 'dashboard':
//         return <StudentDashboard />;
//       case 'jobs':
//         return <Jobs />;
//       case 'mentorship':
//         return <Mentorship />;
//       case 'newsletters':
//         return <Newsletters />;
//       case 'gallery':
//         return <Gallery />;
//       case 'games':
//         return <Games />;
//       default:
//         return <StudentDashboard />;
//     }
//   };

//   return (
//     <>
//       <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
//         {renderPage()}
//       </Layout>
//       <AIHelper />
//     </>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;
