import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../services/authService';
import { authService, RegisterData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: User) => void; // ✅ important
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();

    if (token) {
      authService.getCurrentUser()
        .then((u) => {
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
        })
        .catch(() => {
          authService.removeToken();
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user } = await authService.login({ email, password });

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'alumni') navigate('/dashboard/alumni');
      else navigate('/dashboard/student');

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      const { user } = await authService.register(data);

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === 'admin') navigate('/dashboard/admin');
      else if (user.role === 'alumni') navigate('/dashboard/alumni');
      else navigate('/dashboard/student');

      return true;
    } catch (error) {
      console.error('Register failed:', error);
      return false;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem("user");
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}