"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ChevronLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
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
  const { mounted, status } = useAuth();
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

  // Redirect if already logged in and ADMIN
  useEffect(() => {
    if (mounted && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [mounted, status, router]);

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
    "w-full pl-11 pr-4 py-3 rounded-xl border border-red-900/20 bg-gray-950/60 text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder-gray-600 text-sm outline-none shadow-inner";

  return (
    <div className="min-h-[100dvh] flex bg-gradient-to-br from-red-950 via-gray-950 to-purple-950 text-white relative">
      {/* Absolute background stars/shimmer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/10 via-purple-900/10 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden border-r border-red-500/10 bg-black/40 backdrop-blur-sm">
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <ChevronLeft className="w-5 h-5 text-red-400 group-hover:text-red-300 transition-colors" />
            <span className="text-red-400/80 text-sm group-hover:text-red-300 transition-colors font-semibold">Back to Home</span>
          </Link>
        </div>

        <div className="relative z-10 text-white space-y-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center border border-red-400/30 shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase tracking-wider text-red-500">KCM Console</h1>
              <p className="text-xs uppercase font-extrabold tracking-widest text-purple-300/80">Command Center</p>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight">
            Administrator Registration Request
          </h2>

          <div className="space-y-4 pt-2">
            {[
              "Audit dynamic Razorpay donations ledgers",
              "Instantly promote believers and pastoral staff",
              "Update supporting variables & global variables",
              "Toggles public registration & maintenance modes",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs text-red-400/70 bg-red-950/30 border border-red-900/30 px-3.5 py-2.5 rounded-xl max-w-sm">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
            <span>Secure Platform Database Syncing</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-12 bg-black/20 lg:bg-transparent overflow-y-auto relative z-10">
        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-semibold">Home</span>
          </Link>
        </div>

        <div className="w-full max-w-lg mt-12 lg:mt-0 pb-10 lg:pb-0">
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-purple-600 flex items-center justify-center mb-3 shadow-md border border-red-400/20">
              <ShieldAlert className="w-8 h-8 text-white animate-pulse" />
            </div>
            <h1 className="text-2xl font-black uppercase text-red-500 tracking-wider">KCM Console</h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-purple-400/80">Command Center</p>
          </div>

          {success ? (
            /* REGISTRATION SUCCESS STATE */
            <div className="bg-red-950/20 border border-red-900/40 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-md animate-scale-in text-center shadow-xl">
              <div className="w-16 h-16 bg-red-900/30 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-red-400">Account Created Successfully!</h3>
                <p className="text-gray-300 text-sm font-semibold">
                  Credentials registered in Auth System.
                </p>
                <div className="text-xs text-gray-400 bg-red-950/40 border border-red-900/50 p-4 rounded-xl space-y-2 text-left leading-relaxed">
                  <p className="font-bold text-red-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    ADMIN Promotion Status: PENDING
                  </p>
                  <p>
                    All new administrator accounts are registered as standard users by default. To unlock the command board, a master chief administrator must manually promote your account role to <span className="font-bold text-white">"ADMIN"</span> from the user manager console.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/admin/login"
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold uppercase text-xs tracking-wider shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  Return to Admin Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* REGISTER FORM LAYOUT */
            <>
              <div className="mb-8 text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white animate-fade-in">
                  Request Admin Access 🙏
                </h2>
                <p className="text-gray-400 text-sm">
                  Register admin-pending credentials in the platform system.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-900/20 border border-red-800 text-red-300 text-sm flex items-start gap-3 shadow-md animate-fade-in">
                  <span className="text-red-400 text-lg mt-0.5">⚠</span>
                  <p className="leading-relaxed">{error}</p>
                </div>
              )}

              {/* Information Notice */}
              <div className="mb-6 p-4 bg-red-950/20 border border-red-900/40 text-xs text-red-300/80 rounded-xl leading-relaxed space-y-1">
                <p className="font-bold text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Role Promotion Notice
                </p>
                <p>
                  Registering a profile here writes credentials to Firebase. Newly created accounts require manual promotion to the <span className="font-bold text-white">ADMIN</span> role via the platform console before KCM Console is unlocked.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-medium text-gray-300">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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
                    <label htmlFor="lastName" className="text-sm font-medium text-gray-300">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    Administrator Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-gray-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Console Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="pt-1 space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= pwScore ? strengthColor[pwScore] : "bg-gray-800"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${pwScore <= 1 ? "text-red-500" : pwScore <= 2 ? "text-orange-500" : pwScore <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                        Password strength: {strengthLabel[pwScore]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-red-500/60" />
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
                          ? "border-red-500 focus:ring-red-500"
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                      }`}
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-400 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
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
                      Creating Administrator Record...
                    </>
                  ) : (
                    <>
                      Submit Admin Registration
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-center mt-6 text-sm text-gray-500">
                Already requested access?{" "}
                <Link href="/admin/login" className="text-red-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
