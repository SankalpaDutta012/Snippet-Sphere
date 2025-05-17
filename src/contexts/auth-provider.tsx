
"use client";

import type { User } from "@/types";
import { useRouter, usePathname } from "next/navigation"; // Added usePathname
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  currentUser: User | null;
  login: (username: string) => void;
  signup: (username: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Get current path

  useEffect(() => {
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
    const mockUser: User = { id: username, username }; 
    localStorage.setItem("snippetSphereUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    router.push("/dashboard"); // Redirect to dashboard after login
  };

  const signup = (username: string) => {
    const mockUser: User = { id: username, username };
    localStorage.setItem("snippetSphereUser", JSON.stringify(mockUser));
    setCurrentUser(mockUser);
    router.push("/dashboard"); // Redirect to dashboard after signup
  };

  const logout = () => {
    localStorage.removeItem("snippetSphereUser");
    setCurrentUser(null);
    // If logging out from dashboard, redirect to landing page. Otherwise, stay or go to landing.
    if (pathname.startsWith("/dashboard")) {
      router.push("/"); 
    } else {
      router.push("/"); // Default to landing page
    }
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
