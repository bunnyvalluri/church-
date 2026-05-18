"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  status: "loading",
  logout: async () => {},
});

async function syncUserToDatabase(firebaseUser: FirebaseUser) {
  try {
    const response = await fetch("/api/auth/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        phoneNumber: firebaseUser.phoneNumber,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      console.warn("[AUTH] Server sync failed:", result.error);
    } else {
      console.log("[AUTH] Server sync succeeded:", result);
    }
  } catch (error) {
    console.error("[AUTH] Server sync network error:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const mappedUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "Member",
          image: firebaseUser.photoURL || null,
        };
        setUser(mappedUser);
        setLoading(false);

        // Run user sync in the background so it doesn't block the UI
        syncUserToDatabase(firebaseUser);
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
    <AuthContext.Provider value={{ user, loading, status, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
