"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSessionUser } from "../backend/actions/user";

const AuthContext = createContext({
  user: null,
  isLoaded: false,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const refreshUser = async () => {
    const sessionUser = await getSessionUser();
    setUser(sessionUser);
    setIsLoaded(true);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoaded, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
