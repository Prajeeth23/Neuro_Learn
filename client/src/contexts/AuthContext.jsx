import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await fetchUserRole(session.user.id);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        fetchUserRole(session.user.id).then(() => {
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    isAdmin,
    signOut: () => supabase.auth.signOut(),
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
