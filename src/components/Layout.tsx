import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  X,
  GraduationCap,
  LogOut,
  Home,
  Calendar,
  Briefcase,
  Newspaper,
  Image,
  Archive,
  Gamepad2,
  Users,
  Mail,
  FileText,
  Rss,
  UserCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getNavigationItems = () => {
    if (user?.role === 'admin') {
      return [
        { id: 'feed', label: 'Home', icon: Rss },
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'events', label: 'Events', icon: Calendar },
        { id: 'analytics', label: 'Analytics', icon: Briefcase },
        { id: 'admingallery', label: 'Gallery', icon: Image},
        { id: 'adminjob', label: 'Jobs', icon: Briefcase},
        { id: 'adminnews', label: 'News', icon: Mail},
        { id: 'adminpost', label: 'Post', icon: FileText},
      ];
    }

    if (user?.role === 'alumni') {
      return [
        { id: 'feed', label: 'Home', icon: Rss },
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'jobs', label: 'Jobs', icon: Briefcase },
        { id: 'mentorship', label: 'Mentorship', icon: Users },
        { id: 'newsletters', label: 'Newsletters', icon: Newspaper },
        { id: 'gallery', label: 'Gallery', icon: Image },
        { id: 'archives', label: 'Archives', icon: Archive },
        { id: 'games', label: 'Games', icon: Gamepad2 },
        { id: 'profile', label: 'Profile', icon: UserCircle },
      ];
    }

    return [
      { id: 'feed', label: 'Home', icon: Rss },
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'jobs', label: 'Jobs', icon: Briefcase },
      { id: 'mentorship', label: 'Mentorship', icon: Users },
      { id: 'newsletters', label: 'Newsletters', icon: Newspaper },
      { id: 'gallery', label: 'Gallery', icon: Image },
      { id: 'archives', label: 'Archives', icon: Archive },
      { id: 'games', label: 'Games', icon: Gamepad2 },
      { id: 'profile', label: 'Profile', icon: UserCircle },
    ];
  };

  const navItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? <X /> : <Menu />}
              </button>
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">IdeaBind</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              {user?.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <AnimatePresence>
          {(isSidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              className="fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-lg z-20 overflow-y-auto"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
