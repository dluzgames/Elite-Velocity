import { useState, useEffect } from 'react';
import { User } from '@/types';

const STORAGE_KEY = 'elite_velocity_user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(STORAGE_KEY);
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (e) {
          console.error("Error parsing saved user", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simple mock login: any email/password works for now, or we could check against a "users" list in localStorage
    const users = JSON.parse(localStorage.getItem('elite_velocity_all_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email };
      setUser(userData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    }
    
    return { success: false, error: 'Email ou senha inválidos.' };
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = JSON.parse(localStorage.getItem('elite_velocity_all_users') || '[]');
    
    if (users.some((u: any) => u.email === email)) {
      return { success: false, error: 'Este email já está cadastrado.' };
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 15),
      name,
      email,
      password
    };

    users.push(newUser);
    localStorage.setItem('elite_velocity_all_users', JSON.stringify(users));

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { user, loading, login, signup, logout };
};
