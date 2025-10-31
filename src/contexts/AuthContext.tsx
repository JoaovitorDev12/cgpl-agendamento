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

      // Check for client login
      if (whatsappLast4) {
        const registeredUser = registeredUsers.find(
          u => u.firstName.toLowerCase() === firstName.toLowerCase() && 
               u.whatsappLast4 === whatsappLast4
        );

        if (registeredUser) {
          // Create a temporary email for Supabase auth
          const tempEmail = `${registeredUser.whatsapp}@cgpl.temp`;
          const tempPassword = `${registeredUser.whatsapp}_${registeredUser.whatsappLast4}`;
          
          // Try to sign in or sign up with Supabase
          let { error } = await supabase.auth.signInWithPassword({
            email: tempEmail,
            password: tempPassword,
          });

          // If user doesn't exist in auth, create them
          if (error?.message?.includes('Invalid login credentials')) {
            const { error: signUpError } = await supabase.auth.signUp({
              email: tempEmail,
              password: tempPassword,
              options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: {
                  first_name: registeredUser.firstName,
                  last_name: registeredUser.lastName
                }
              }
            });
            
            if (signUpError) {
              console.error('Sign up error:', signUpError);
              return false;
            }
            
            // Try signing in again
            ({ error } = await supabase.auth.signInWithPassword({
              email: tempEmail,
              password: tempPassword,
            }));
          }

          return !error;
        }
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Omit<RegisteredUser, 'id' | 'registeredAt'>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if user already exists in Supabase
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('whatsapp, first_name, whatsapp_last4')
        .or(`whatsapp.eq.${userData.whatsapp},and(first_name.ilike.${userData.firstName},whatsapp_last4.eq.${userData.whatsappLast4})`)
        .single();

      if (existingProfile) {
        return false;
      }

      // Create temp email and password for Supabase auth
      const tempEmail = `${userData.whatsapp}@cgpl.temp`;
      const tempPassword = `${userData.whatsapp}_${userData.whatsappLast4}`;

      // Sign up with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Auth signup error:', authError);
        return false;
      }

      // Insert profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          whatsapp: userData.whatsapp,
          whatsapp_last4: userData.whatsappLast4,
          email: userData.email
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return false;
      }

      // Reload registered users
      await loadRegisteredUsers();
      
      return true;
    } finally {
      setIsLoading(false);
    }
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