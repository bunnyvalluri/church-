"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, ArrowRight, ChevronLeft, ShieldAlert, AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { mounted, status, user, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated and role is ADMIN, take to /admin
  useEffect(() => {
    if (mounted && status === "authenticated" && user) {
      if (user.role === "ADMIN") {
        router.replace("/admin");
      }
    }
  }, [mounted, status, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The AuthProvider will automatically trigger updates and redirect to /admin via useEffect if ADMIN.
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/invalid-credential": "Invalid email or password. Please try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/too-many-requests": "Too many login attempts. Please try again later.",
      };
      setError(messages[err.code] ?? "Sign-in failed. Please check your credentials.");
      setIsLoading(false);
    }
  };

  const handleDemoteSignout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setError("");
    } catch (err) {
      console.error("Sign out error", err);
    } finally {
      setIsLoading(false);
    }
  };

  // If authenticated but NOT an admin, show a beautiful Access Denied board
  const isNotAdmin = status === "authenticated" && user && user.role !== "ADMIN";

  return (
    <div className="min-h-[100dvh] flex bg-gradient-to-br from-red-950 via-gray-950 to-purple-950 text-white relative">
      {/* Absolute background stars/shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-purple-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* ── Left Decorative Shield Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-red-500/10 bg-black/40 backdrop-blur-sm">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <ChevronLeft className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            <span className="text-red-400/80 text-sm group-hover:text-red-300 transition-colors font-semibold">Back to Home</span>
          </Link>
        </div>

        <div className="relative z-10 text-left space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center border border-red-400/30 shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-red-500">KCM Console</h1>
              <p className="text-xs uppercase font-extrabold tracking-widest text-purple-300/80">Command Center</p>
            </div>
          </div>

          <h2 className="text-4xl font-extrabold leading-tight text-white tracking-tight">
            System Root Administration Portal
          </h2>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            Authorized administrative access only. Log in to monitor transaction ledgers, manage believer roles, publish global notices, and adjust ministry parameters.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-red-400/70 bg-red-950/30 border border-red-900/30 px-3.5 py-2.5 rounded-xl max-w-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
            <span>Secure TLS 1.3 Encryption Active</span>
          </div>
        </div>
      </div>

      {/* ── Right Login Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative z-10 bg-black/20 lg:bg-transparent">
        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Home</span>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center mb-3 shadow-md border border-red-400/20">
              <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-black uppercase text-red-500 tracking-wider">KCM Console</h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-purple-400/80">Command Center</p>
          </div>

          {isNotAdmin ? (
            /* ACCESS DENIED LAYOUT */
            <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md animate-scale-in text-center shadow-xl">
              <div className="w-16 h-16 bg-red-900/30 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-red-400">Access Denied</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your current account <span className="font-semibold text-white">({user?.email})</span> is not assigned to the <span className="text-red-400 font-bold">ADMIN</span> role. This console is strictly reserved for church administrators.
                </p>
              </div>
              
              <div className="pt-2 flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all text-center flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  Go to Believer Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={handleDemoteSignout}
                  className="w-full py-3 bg-red-950/40 border border-red-900/40 text-red-400 hover:bg-red-950/70 hover:text-red-300 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of {user?.name || "Account"}
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN FORM LAYOUT */
            <>
              <div className="mb-8 text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white animate-fade-in">
                  Administrator Sign In
                </h2>
                <p className="text-gray-400 text-sm">
                  Sign in with credentials to access administrative systems
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm flex items-start gap-3 shadow-md animate-fade-in">
                  <span className="text-red-400 text-lg mt-0.5">⚠</span>
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-red-900/20 bg-gray-950/60 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-600 text-sm outline-none shadow-inner"
                      placeholder="admin@kcmchurch.org"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      Security Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500/60" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-red-900/20 bg-gray-950/60 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-600 text-sm outline-none shadow-inner"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 text-white font-bold tracking-wide uppercase text-xs shadow-lg shadow-red-500/20 hover:shadow-red-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Authenticating Console...
                    </>
                  ) : (
                    <>
                      Log In To Command Center
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to Member Login Link */}
              <div className="mt-8 pt-6 border-t border-red-950/40 flex flex-col gap-4 text-center">
                <p className="text-xs text-gray-500">
                  Are you a church believer or shepherd?
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/login"
                    className="px-4 py-2 border border-purple-500/20 hover:border-purple-500/40 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 font-bold rounded-xl text-xs uppercase tracking-wide transition-all active:scale-[0.98]"
                  >
                    Member Login
                  </Link>
                  <Link
                    href="/admin/register"
                    className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 bg-red-950/20 hover:bg-red-950/40 text-red-300 font-bold rounded-xl text-xs uppercase tracking-wide transition-all active:scale-[0.98]"
                  >
                    Request Admin Account
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
