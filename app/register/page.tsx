"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import LanguageToggle from "@/components/LanguageToggle";

const passwordStrength = (pw: string) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
};

const strengthColor = ["bg-gray-200", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

export default function RegisterPage() {
  const router = useRouter();
  const { mounted, status } = useAuth();
  const { t } = useLanguage();
  const registerT = t.pages.register;
  const loginT = t.pages.login;

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
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (mounted && status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [mounted, status, router]);

  const pwScore = passwordStrength(formData.password);

  const getStrengthLabel = (score: number) => {
    const labels = [
      registerT.tooShort,
      registerT.weak,
      registerT.fair,
      registerT.good,
      registerT.strong
    ];
    return labels[score] || "";
  };

  // Resolve localized error dynamically so it changes instantly when language toggles
  const getLocalizedError = (errStr: string) => {
    if (!errStr) return "";
    
    // Map of raw codes or exact English strings to their translated keys
    const errorMap: Record<string, string> = {
      "passwords-mismatch": registerT.errors.mismatch,
      "password-too-short": registerT.errors.tooShort,
      "auth/email-already-in-use": registerT.errors.emailInUse,
      "auth/weak-password": registerT.errors.weakPassword,
      "auth/invalid-email": registerT.errors.invalidEmail,
      "registration-failed": registerT.errors.genericFailed,
    };

    if (errorMap[errStr]) return errorMap[errStr];
    
    const msgMap: Record<string, string> = {
      "Passwords do not match.": registerT.errors.mismatch,
      "Password must be at least 8 characters.": registerT.errors.tooShort,
      "This email is already registered. Try signing in.": registerT.errors.emailInUse,
      "Password is too weak. Please choose a stronger one.": registerT.errors.weakPassword,
      "Please enter a valid email address.": registerT.errors.invalidEmail,
      "Registration failed. Please try again.": registerT.errors.genericFailed,
    };

    if (msgMap[errStr]) return msgMap[errStr];

    return errStr;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("passwords-mismatch");
      return;
    }
    if (formData.password.length < 8) {
      setError("password-too-short");
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        });
      }
    } catch (err: any) {
      setError(err.code || "registration-failed");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-600 text-sm";

  return (
    <div className="min-h-[100dvh] flex">
      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
          <span className="text-white font-bold" style={{ fontSize: "40rem", lineHeight: 1 }}>✝</span>
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            <span className="text-white/60 text-sm group-hover:text-white transition-colors">{registerT.backToHome}</span>
          </Link>
        </div>

        <div className="relative z-10 text-white">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
              <span className="text-2xl">✝</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{loginT.churchName}</h1>
              <p className="text-purple-200 text-sm">{loginT.ministries}</p>
            </div>
          </div>

          <h2 className="text-3xl font-light leading-relaxed text-white/90 mb-8">
            {registerT.quote}
          </h2>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              registerT.benefit1,
              registerT.benefit2,
              registerT.benefit3,
              registerT.benefit4,
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-white/80 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/60 text-sm">{registerT.footerTicker}</span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-10 sm:px-12 bg-white dark:bg-gray-950 overflow-y-auto relative">
        {/* Language Selection */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageToggle />
        </div>

        {/* Mobile Header / Back Button */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{registerT.backToHome}</span>
          </Link>
        </div>

        <div className="w-full max-w-lg mt-12 lg:mt-0 pb-10 lg:pb-0">
          {/* Mobile Branding (Visible only on smaller screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50 flex items-center justify-center mb-3 shadow-sm">
              <span className="text-2xl text-purple-600 dark:text-purple-400">✝</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              {loginT.churchName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{loginT.ministries}</p>
          </div>

          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {registerT.title}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {registerT.subtitle}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <span className="text-red-500 text-lg mt-0.5">⚠</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{getLocalizedError(error)}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {registerT.firstName}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {registerT.lastName}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {registerT.email}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={inputClass}
                  placeholder={registerT.emailPlaceholder}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {registerT.phone}
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {registerT.password}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={`${inputClass} pr-12`}
                  placeholder={registerT.passwordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
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
                          i <= pwScore ? strengthColor[pwScore] : "bg-gray-200 dark:bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${pwScore <= 1 ? "text-red-500" : pwScore <= 2 ? "text-orange-500" : pwScore <= 3 ? "text-yellow-600" : "text-green-600"}`}>
                    {registerT.strengthLabel} {getStrengthLabel(pwScore)}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {registerT.confirmPassword}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                      ? "border-red-400 focus:ring-red-400"
                      : formData.confirmPassword && formData.password === formData.confirmPassword
                      ? "border-green-400 focus:ring-green-400"
                      : ""
                  }`}
                  placeholder={registerT.confirmPasswordPlaceholder}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-500">{registerT.mismatch}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 py-1">
              <input
                id="terms"
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 accent-purple-600 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {registerT.agreeTo}{" "}
                <Link href="/terms" className="text-purple-600 hover:underline font-medium">{registerT.terms}</Link>
                {" "}{registerT.and}{" "}
                <Link href="/privacy" className="text-purple-600 hover:underline font-medium">{registerT.privacy}</Link>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {registerT.creating}
                </>
              ) : (
                <>{registerT.createBtn} <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
            {registerT.alreadyHaveAccount}{" "}
            <Link href="/login" className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
              {registerT.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
