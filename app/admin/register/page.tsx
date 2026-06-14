"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ChevronLeft, ShieldAlert, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["bg-gray-200", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

export default function AdminRegisterPage() {
  const router = useRouter();
  const { mounted, status, user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect authenticated users to their authorized portal
  useEffect(() => {
    if (mounted && status === "authenticated" && user) {
      if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
        router.replace("/admin");
      } else if (user.role === "PASTOR") {
        router.replace("/pastor");
      } else {
        router.replace("/member");
      }
    }
  }, [mounted, status, user, router]);

  // Removed to prevent hydration mismatch



  const pwScore = passwordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        });
        setSuccess(true);
      }
    } catch (err: any) {
      const messages: Record<string, string> = {
        "auth/email-already-in-use": "This email is already registered. Try signing in.",
        "auth/weak-password": "Password is too weak. Please choose a stronger one.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(messages[err.code] ?? "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3 bg-[#0E0F1E]/60 border border-white/[0.08] rounded-xl text-white placeholder-gray-600 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-white/[0.15] transition-all duration-300";

  return (
    <div className="min-h-[100dvh] flex bg-[#0B0C16] text-white relative overflow-hidden font-sans antialiased">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* ── Left Branding Panel (Glassmorphism & Live Mockup) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-white/[0.05] bg-gradient-to-b from-[#0F1021]/60 to-[#0B0C16]/60 backdrop-blur-md select-none">
        {/* Glow behind logo */}
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-indigo-300 hover:text-white hover:bg-white/[0.06] transition-all duration-300 group">
            <ChevronLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Home</span>
          </Link>
        </div>

        {/* Live CSS Dashboard Mock Preview */}
        <div className="relative z-10 w-full aspect-[4/3] rounded-2xl border border-white/[0.08] bg-[#0E0F1E]/80 overflow-hidden shadow-2xl p-5 space-y-4 backdrop-blur-md group hover:border-indigo-500/30 transition-all duration-500">
          {/* Inner shadow/ambient light */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
          
          {/* Mini Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-[10px] font-bold">
                ✝
              </div>
              <span className="text-[11px] font-black tracking-wider text-white">KCM LIVE DASHBOARD</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase text-emerald-400">Live Sync</span>
            </div>
          </div>

          {/* Mini Metrics Row */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Active Members", val: "2,481", change: "+12.4%", color: "text-emerald-400" },
              { label: "Total Tithes", val: "₹184K", change: "+8.2%", color: "text-emerald-400" },
              { label: "Pending Prayers", val: "14", change: "Active", color: "text-indigo-400" },
            ].map((stat, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider block">{stat.label}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-black text-white">{stat.val}</span>
                  <span className={`text-[8px] font-bold ${stat.color}`}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Chart & Activity Split */}
          <div className="grid grid-cols-2 gap-3 h-28">
            {/* Mock Chart */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 flex flex-col justify-between">
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Attendance Flow</span>
              {/* Mini SVG Graph */}
              <div className="h-14 flex items-end gap-1 pt-2">
                {[40, 60, 45, 80, 55, 90, 75].map((height, i) => (
                  <div key={i} className="flex-1 bg-gradient-to-t from-indigo-500/10 to-indigo-500 rounded-sm hover:from-purple-500 hover:to-purple-400 transition-all duration-300" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>

            {/* Mock Logs */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 flex flex-col justify-between">
              <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Security Logs</span>
              <div className="space-y-1.5 overflow-hidden">
                {[
                  { user: "Bishop Raju", action: "Updated sermon library", time: "2m ago" },
                  { user: "SysAdmin", action: "Promoted Member #242", time: "10m ago" },
                ].map((log, i) => (
                  <div key={i} className="flex flex-col text-[8px] border-b border-white/[0.03] pb-1 last:border-0 last:pb-0">
                    <div className="flex justify-between font-bold text-gray-300">
                      <span>{log.user}</span>
                      <span className="text-gray-500">{log.time}</span>
                    </div>
                    <span className="text-gray-500 font-medium truncate">{log.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-left space-y-4 max-w-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-lg shadow-lg border border-white/10">
              ✝
            </div>
            <div>
              <h1 className="text-base font-black tracking-wider uppercase text-white">KCM Console</h1>
              <p className="text-[9px] uppercase font-black tracking-widest text-indigo-400">Command Center</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <h2 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
              Register Credentials Request
            </h2>
            <p className="text-gray-400 text-xs leading-relaxed">
              Create an administrative pending profile in the system database. Newly registered accounts require role elevation authorization before workspace dashboards unlock.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-[9px]">Secure Platform Database Syncing</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel (Glassmorphism card) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-12 relative z-10 bg-black/10 lg:bg-transparent overflow-y-auto">
        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Home</span>
          </Link>
        </div>

        <div className="w-full max-w-2xl mt-8 lg:mt-0 pb-6 lg:pb-0">
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20 border border-white/10">
              <span className="text-white text-2xl font-bold">✝</span>
            </div>
            <h1 className="text-xl font-black uppercase text-white tracking-wider">KCM Console</h1>
            <p className="text-[10px] uppercase font-black tracking-widest text-indigo-400">Command Center</p>
          </div>

          {success ? (
            /* REGISTRATION SUCCESS STATE */
            <div className="bg-[#10192A]/50 border border-indigo-500/10 rounded-3xl p-8 space-y-6 backdrop-blur-xl text-center shadow-2xl shadow-black/50 animate-scale-in max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white tracking-tight">Account Created Successfully!</h3>
                <p className="text-gray-400 text-xs font-medium">
                  Credentials registered in Auth System.
                </p>
                <div className="text-xs text-gray-400 bg-indigo-950/20 border border-indigo-900/30 p-4 rounded-2xl space-y-2 text-left leading-relaxed shadow-inner">
                  <p className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                    Console Promotion Pending
                  </p>
                  <p className="text-gray-400 text-[11px]">
                    All new administrator accounts are registered as standard users by default. To unlock the command board, a master chief administrator must manually promote your account role to <span className="font-bold text-white">"ADMIN"</span> from the user manager console.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="w-full py-3.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053EC] hover:to-[#7C4DFA] text-white rounded-xl font-bold uppercase text-[11px] tracking-wider shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  Return to Admin Sign In
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTER FORM LAYOUT */
            <div className="bg-[#16172B]/40 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/50 rounded-3xl p-8 sm:p-10 space-y-6">
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Request Admin Access
                </h2>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Register admin-pending credentials in the platform system.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5 shadow-inner animate-fade-in">
                  <span className="text-red-400 text-sm mt-0.5">⚠️</span>
                  <p className="leading-relaxed font-medium">{error}</p>
                </div>
              )}

              {/* Information Notice */}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 text-[11px] text-gray-400 rounded-xl leading-relaxed space-y-1.5 shadow-inner">
                <p className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  Role Promotion Notice
                </p>
                <p>
                  Registering a profile here writes credentials to Firebase. Newly created accounts require manual promotion to the <span className="font-bold text-white">ADMIN</span> role via the platform console before KCM Console is unlocked.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      First Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="John"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Last Name
                    </label>
                    <div className="relative group">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Console Email Address
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Console Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className={`${inputClass} pr-12`}
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {/* Password Strength Meter */}
                    {formData.password && (
                      <div className="pt-1.5 space-y-1.5">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                i <= pwScore ? strengthColor[pwScore] : "bg-white/[0.04]"
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${pwScore <= 1 ? "text-rose-400" : pwScore <= 2 ? "text-amber-400" : pwScore <= 3 ? "text-indigo-300" : "text-emerald-400"}`}>
                          Security level: {strengthLabel[pwScore]}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        className={`${inputClass} pr-12 ${
                          formData.confirmPassword && formData.password !== formData.confirmPassword
                            ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                            : formData.confirmPassword && formData.password === formData.confirmPassword
                            ? "border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500"
                            : ""
                        }`}
                        placeholder="Repeat your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-400 transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Passwords do not match</p>
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5053EC] hover:to-[#7C4DFA] text-white font-bold tracking-wider uppercase text-[11px] rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:-translate-y-[1px] active:translate-y-[1px] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating Administrator Record...
                    </>
                  ) : (
                    <>
                      Submit Admin Registration
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-xs text-gray-400 font-medium leading-relaxed">
                Already requested access?{" "}
                <Link href="/admin/login" className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline">
                  Sign in here
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
