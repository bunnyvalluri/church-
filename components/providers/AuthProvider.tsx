"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: "MEMBER" | "PASTOR" | "ADMIN";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  mounted: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  mounted: false,
  status: "loading",
  logout: async () => {},
  refreshUser: async () => {},
});

async function syncUserToDatabase(firebaseUser: FirebaseUser): Promise<any | null> {
  try {
    const response = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
      }),
    });
    const result = await response.json();
    if (response.ok && result.success) {
      return result.user;
    } else {
      console.warn("[AUTH] Server sync failed:", result.error);
    }
  } catch (error) {
    console.error("[AUTH] Server sync network error:", error);
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  // mounted=true only after first client render — prevents hydration mismatch
  const [mounted, setMounted] = useState(false);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const dbUser = await syncUserToDatabase(auth.currentUser);
      if (dbUser) {
        setUser((prev) => prev ? {
          ...prev,
          name: dbUser.name || prev.name,
          image: dbUser.image !== undefined ? dbUser.image : prev.image,
          role: dbUser.role || prev.role,
        } : null);
      }
    }
  };

  useEffect(() => {
    setMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        const dbUser = await syncUserToDatabase(firebaseUser);
        
        const mappedUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: dbUser?.name || firebaseUser.displayName || "Member",
          image: dbUser?.image || firebaseUser.photoURL || null,
          role: dbUser?.role || "MEMBER",
        };
        
        setUser(mappedUser);
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("[AUTH] Sign out error:", err);
    }
  };

  const status = loading ? "loading" : user ? "authenticated" : "unauthenticated";

  return (
    <AuthContext.Provider value={{ user, loading, mounted, status, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
