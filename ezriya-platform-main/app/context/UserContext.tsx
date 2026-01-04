// app/context/UserContext.tsx
// User context for role, state, and verification status
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentUser } from '../../services/userService';
import type { User, Role } from '../../src/types/types';

type UserContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (!authUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      // Suppress network errors to prevent console spam
      if (error?.message?.includes('Network request failed') || error?.message?.includes('Failed to fetch')) {
        // Silently handle network errors
      } else {
        console.warn('Failed to load user:', error?.message || error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [authUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

