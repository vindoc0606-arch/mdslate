/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (profile: UserProfile, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        localStorage.clear(); // Clear all, including auth tokens
        supabase.auth.signOut();
        setUser(null);
      } else if (session) {
        fetchProfile(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (['TOKEN_REFRESHED', 'SIGNED_IN', 'INITIAL_SESSION'].includes(event) && session) {
        fetchProfile(session.user);
      } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (supabaseUser: User) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();
    
    if (data) {
      setUser(data);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signup = async (profile: UserProfile, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: profile.email,
      password: password,
      options: {
        data: {
          name: profile.name,
          mobile: profile.mobile,
          college: profile.college,
          state: profile.state,
        }
      }
    });
    
    if (data.user && !error) {
       // Profile created via trigger in Postgres usually, 
       // but we could also manually insert here if needed for simplicity
    }
    return { error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
