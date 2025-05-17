
"use client";

import type { User } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string) => void; // Simplified mock login
  signup: (username: string) => void; // Simplified mock signup
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage for a saved user session
    const storedUser = localStorage.getItem("snippetSphereUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem("snippetSphereUser");
      }
    }
    setLoading(false);
  }, []);

  const login = (username: string) => {
    // In a real app, this would involve an API call
    const mockUser: User = { id: username, username }; // Use username as ID for mock
    localStorage.setItem("snippetSphereUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    router.push("/"); // Redirect to home after login
  };

  const signup = (username: string) => {
    // In a real app, this would involve an API call
    const mockUser: User = { id: username, username };
    localStorage.setItem("snippetSphereUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    router.push("/"); // Redirect to home after signup
  };

  const logout = () => {
    localStorage.removeItem("snippetSphereUser");
    setCurrentUser(null);
    router.push("/"); // Redirect to home or login page after logout
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
