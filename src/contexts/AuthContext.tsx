import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  whatsapp?: string;
  whatsappLast4?: string;
  email?: string;
  role: 'client' | 'planner';
}

interface AuthContextType {
  user: User | null;
  login: (firstName: string, whatsappLast4?: string, plannerPassword?: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se usuário está logado
    const savedUser = localStorage.getItem('cgpl_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (firstName: string, whatsappLast4?: string, plannerPassword?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Login do planejador
        if (plannerPassword === '123456') {
          const plannerUser: User = {
            id: 'planner-1',
            firstName: firstName,
            role: 'planner'
          };
          setUser(plannerUser);
          setIsAuthenticated(true);
          localStorage.setItem('cgpl_user', JSON.stringify(plannerUser));
          resolve(true);
          return;
        }

        // Login do cliente (simulação - depois integra com Supabase)
        if (whatsappLast4) {
          const clientUser: User = {
            id: `client-${Date.now()}`,
            firstName: firstName,
            whatsappLast4: whatsappLast4,
            role: 'client'
          };
          setUser(clientUser);
          setIsAuthenticated(true);
          localStorage.setItem('cgpl_user', JSON.stringify(clientUser));
          resolve(true);
          return;
        }

        resolve(false);
      }, 1000);
    });
  };

  const register = async (userData: any): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulação de cadastro - depois integra com Supabase
        console.log('Cadastrando usuário:', userData);
        
        // Salva no localStorage para simular cadastro
        const users = JSON.parse(localStorage.getItem('cgpl_users') || '[]');
        const newUser = {
          id: `user-${Date.now()}`,
          ...userData,
          role: 'client'
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