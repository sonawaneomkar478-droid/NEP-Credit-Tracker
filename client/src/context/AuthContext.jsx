import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nep_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [student, setStudent] = useState(() => {
    const savedStudent = localStorage.getItem('nep_student');
    return savedStudent ? JSON.parse(savedStudent) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nep_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on app launch
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('nep_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            setStudent(res.data.student);
            localStorage.setItem('nep_user', JSON.stringify(res.data.user));
            if (res.data.student) {
              localStorage.setItem('nep_student', JSON.stringify(res.data.student));
            }
          }
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser, student: receivedStudent } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      setStudent(receivedStudent);

      localStorage.setItem('nep_token', receivedToken);
      localStorage.setItem('nep_user', JSON.stringify(receivedUser));
      if (receivedStudent) {
        localStorage.setItem('nep_student', JSON.stringify(receivedStudent));
      }
      return { user: receivedUser, student: receivedStudent };
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    if (res.data.success) {
      const { token: receivedToken, user: receivedUser, student: receivedStudent } = res.data;
      setToken(receivedToken);
      setUser(receivedUser);
      setStudent(receivedStudent);

      localStorage.setItem('nep_token', receivedToken);
      localStorage.setItem('nep_user', JSON.stringify(receivedUser));
      if (receivedStudent) {
        localStorage.setItem('nep_student', JSON.stringify(receivedStudent));
      }
      return { user: receivedUser, student: receivedStudent };
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStudent(null);
    localStorage.removeItem('nep_token');
    localStorage.removeItem('nep_user');
    localStorage.removeItem('nep_student');
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res.data.success) {
        setUser(res.data.user);
        setStudent(res.data.student);
        localStorage.setItem('nep_user', JSON.stringify(res.data.user));
        if (res.data.student) {
          localStorage.setItem('nep_student', JSON.stringify(res.data.student));
        }
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
