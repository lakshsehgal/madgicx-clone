"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_KEY = "neuroid_auth";

// Hardcoded credentials for MVP
const VALID_USERS = [
  { username: "admin", password: "neuroid2024" },
  { username: "laksh", password: "neuroid2024" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setLoaded(true);
  }, []);

  const login = (username: string, password: string): boolean => {
    const valid = VALID_USERS.some(
      (u) => u.username === username && u.password === password
    );
    if (valid) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, "true");
      return true;
    }
    return false;
  };

  const logout = () => {
    // Only clear auth state - workspace data is preserved separately
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
    // Explicitly do NOT touch workspace keys:
    // neuroid_client_spaces and neuroid_active_client_space stay intact
  };

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
