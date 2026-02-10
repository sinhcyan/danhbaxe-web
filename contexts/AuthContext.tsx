import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  role: string | null;
  userId: string | null;
  login: (username: string, role: string, userId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('auth_role');
    const storedUserId = sessionStorage.getItem('auth_user_id');
    if (storedRole && storedUserId) {
      setRole(storedRole);
      setUserId(storedUserId);
    }
  }, []);

  const login = (username: string, role: string, userId: string) => {
    sessionStorage.setItem('auth_role', role);
    sessionStorage.setItem('auth_user_id', userId);
    setRole(role);
    setUserId(userId);
  };

  const logout = () => {
    sessionStorage.clear();
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};