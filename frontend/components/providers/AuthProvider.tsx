"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: "MEMBER" | "PASTOR" | "ADMIN" | "SUPER_ADMIN" | "EVENT_MANAGER" | "FIELD_VOLUNTEER" | "NGO_ADMIN";
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  mounted: boolean;
  status: "loading" | "authenticated" | "unauthenticated";
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updatedFields: Partial<AuthUser>) => void;
  /** Returns a fresh Firebase ID token for authenticated API calls, or null in dev-bypass / unauthenticated state. */
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  mounted: false,
  status: "loading",
  logout: async () => {},
  refreshUser: async () => {},
  updateUser: () => {},
  getIdToken: async () => null,
});

// ── Session Cookie Cleaners ──────────────────────────────────────────────────
function setSessionCookies(_uid: string, _role: string) {
  // Authoritative session cookie (kcm_session) is HttpOnly and managed by the server.
  // We ensure legacy plain cookies are cleared.
  clearSessionCookies();
}

function clearSessionCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "__kcm_session_uid=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "__kcm_session_role=; path=/; max-age=0; SameSite=Lax";
}

async function syncUserToDatabase(firebaseUser: any): Promise<any | null> {
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
  const [mounted, setMounted] = useState(false);

  const updateUser = (updatedFields: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  /**
   * Returns a fresh Firebase ID token for use in Authorization: Bearer headers.
   * Returns null in dev-bypass mode or if the user is unauthenticated.
   */
  const getIdToken = async (): Promise<string | null> => {
    try {
      if (auth?.currentUser) {
        return await auth.currentUser.getIdToken(/* forceRefresh */ false);
      }
    } catch (err) {
      console.error("[AUTH] getIdToken error:", err);
    }
    return null;
  };

  const refreshUser = async () => {
    try {
      if (auth && auth.currentUser) {
        const dbUser = await syncUserToDatabase(auth.currentUser);
        if (dbUser) {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  name: dbUser.name || prev.name,
                  image: dbUser.image !== undefined ? dbUser.image : prev.image,
                  role: dbUser.role || prev.role,
                }
              : null
          );
        }
      }
    } catch (err) {
      console.error("[AUTH] refreshUser error:", err);
    }
  };

  useEffect(() => {
    setMounted(true);

    // 1. Initial verification against server session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setUser({
            uid: data.user.uid,
            email: data.user.email || '',
            name: data.user.name || 'Member',
            image: data.user.image || null,
            role: data.user.role || 'MEMBER',
          });
          setLoading(false);
        }
      })
      .catch(() => {});

    let unsubscribe: (() => void) | undefined;

    if (!auth || typeof onAuthStateChanged !== 'function') {
      console.warn('[AUTH] Firebase Auth not available. Running in offline fallback mode.');
      setLoading(false);
    } else {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const dbUser = await syncUserToDatabase(firebaseUser);
            if (dbUser) {
              const syncedRole = dbUser.role || 'MEMBER';
              const updatedUser: AuthUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: dbUser.name || firebaseUser.displayName || 'Member',
                image: dbUser.image || firebaseUser.photoURL || null,
                role: syncedRole,
              };
              setUser(updatedUser);
              setLoading(false);
            } else {
              setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                name: firebaseUser.displayName || 'Member',
                image: firebaseUser.photoURL || null,
                role: 'MEMBER',
              });
              setLoading(false);
            }
          } catch (syncErr) {
            console.warn('[AUTH] Database role sync error:', syncErr);
            setLoading(false);
          }
        } else {
          // Verify with server session before clearing user
          fetch('/api/auth/session')
            .then((res) => res.json())
            .then((data) => {
              if (data?.authenticated && data?.user) {
                setUser({
                  uid: data.user.uid,
                  email: data.user.email || '',
                  name: data.user.name || 'Member',
                  image: data.user.image || null,
                  role: data.user.role || 'MEMBER',
                });
              } else {
                clearSessionCookies();
                setUser(null);
              }
              setLoading(false);
            })
            .catch(() => {
              clearSessionCookies();
              setUser(null);
              setLoading(false);
            });
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [pendingLogoutResolve, setPendingLogoutResolve] = useState<((confirmed: boolean) => void) | null>(null);

  const logout = async () => {
    // Suspend execution until the user clicks OK or Cancel
    const confirmed = await new Promise<boolean>((resolve) => {
      setPendingLogoutResolve(() => resolve);
      setShowLogoutAlert(true);
    });

    if (!confirmed) {
      throw new Error("CANCELLED_BY_USER");
    }

    try {
      // Call server logout to revoke database session and clear HttpOnly cookie
      await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {});

      if (auth && typeof signOut === "function") {
        await signOut(auth);
      }
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id?.disableAutoSelect) {
        (window as any).google.accounts.id.disableAutoSelect();
      }
      clearSessionCookies();
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    } catch (err) {
      console.error("[AUTH] Sign out error:", err);
      clearSessionCookies();
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.replace("/login");
      }
    }
  };

  const handleConfirmLogoutAlert = () => {
    setShowLogoutAlert(false);
    if (pendingLogoutResolve) {
      pendingLogoutResolve(true);
      setPendingLogoutResolve(null);
    }
  };

  const handleCancelLogoutAlert = () => {
    setShowLogoutAlert(false);
    if (pendingLogoutResolve) {
      pendingLogoutResolve(false);
      setPendingLogoutResolve(null);
    }
  };

  // Keyboard handler for logout confirmation dialog (Enter key to confirm, Escape key to cancel)
  useEffect(() => {
    if (!showLogoutAlert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        setShowLogoutAlert(false);
        if (pendingLogoutResolve) {
          pendingLogoutResolve(true);
          setPendingLogoutResolve(null);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowLogoutAlert(false);
        if (pendingLogoutResolve) {
          pendingLogoutResolve(false);
          setPendingLogoutResolve(null);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLogoutAlert, pendingLogoutResolve]);

  const status = loading ? "loading" : user ? "authenticated" : "unauthenticated";

  return (
    <AuthContext.Provider value={{ user, loading, mounted, status, logout, refreshUser, updateUser, getIdToken }}>
      {children}
      {showLogoutAlert && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 p-4 transition-opacity duration-300"
          style={{ WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)" }}
        >
          <div className="bg-[#201a18] border border-[#362b28] rounded-[24px] w-full max-w-[340px] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.7)] text-left transform scale-100 transition-all duration-300">
            <h3 className="text-white font-bold text-[15px] tracking-wide mb-1.5">
              www.kcmchurch.in says
            </h3>
            <p className="text-stone-300 text-[13px] mb-6 leading-normal font-normal">
              Logging out...
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelLogoutAlert}
                className="px-6 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-[13px] border border-white/20 hover:border-white/40 active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                autoFocus
                onClick={handleConfirmLogoutAlert}
                className="px-6 py-1.5 rounded-full bg-[#fca595] hover:bg-[#fdbeb2] text-black font-semibold text-[13px] border-[1.5px] border-black outline outline-[1.5px] outline-[#fca595] outline-offset-[1.5px] hover:outline-[#fdbeb2] active:scale-95 transition-all shadow-sm focus:ring-2 focus:ring-[#fca595]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
