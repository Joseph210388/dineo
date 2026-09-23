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
    try {
      const sessionUser = await getSessionUser();
      setUser(sessionUser);
    } catch (error) {
      // Fallos de red/DB en Vercel no deben tumbar toda la app (Connection closed)
      console.error("No se pudo cargar la sesion:", error);
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
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
