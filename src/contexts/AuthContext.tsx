import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  role: 'client';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('cgpl_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('cgpl_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);
        
        if (user) {
          const userData: User = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            whatsapp: user.whatsapp,
            role: 'client'
          };
          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('cgpl_user', JSON.stringify(userData));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const register = async (userData: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('cgpl_users') || '[]');
        const existingUser = users.find((u: any) => u.email === userData.email);
        
        if (existingUser) {
          console.log('Este email já está cadastrado!');
          resolve(false);
          return;
        }

        const newUser = {
          id: `user-${Date.now()}`,
          ...userData,
          role: 'client',
          createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('cgpl_users', JSON.stringify(users));
        resolve(true);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('cgpl_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
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