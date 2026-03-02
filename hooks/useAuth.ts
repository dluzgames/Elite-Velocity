import { useState, useEffect } from 'react';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('elite_tracker_current_user');
    if (storedUser) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const users: User[] = JSON.parse(localStorage.getItem('elite_tracker_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    
    if (found) {
      const userWithoutPassword = { id: found.id, name: found.name, email: found.email };
      setUser(userWithoutPassword);
      localStorage.setItem('elite_tracker_current_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    }
    
    return { success: false, error: 'Email ou senha inválidos.' };
  };

  const signup = (name: string, email: string, password: string): { success: boolean; error?: string } => {
    const users: User[] = JSON.parse(localStorage.getItem('elite_tracker_users') || '[]');
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Este email já está cadastrado.' };
    }
    
    const newUser: User = { 
      id: Date.now().toString(), 
      name, 
      email, 
      password 
    };
    
    users.push(newUser);
    localStorage.setItem('elite_tracker_users', JSON.stringify(users));
    
    const userWithoutPassword = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userWithoutPassword);
    localStorage.setItem('elite_tracker_current_user', JSON.stringify(userWithoutPassword));
    
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('elite_tracker_current_user');
  };

  return { user, loading, login, signup, logout };
};
