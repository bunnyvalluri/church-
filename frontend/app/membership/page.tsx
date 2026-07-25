"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Users,
  Heart,
  Shield,
  Award,
  ChevronRight,
  Crown,
  BookOpen,
  FileCheck,
  UserCheck,
  Sparkles,
  X,
  Send,
  MessageSquare,
  Calendar,
  Check
} from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import BackToHome from "@/components/ui/BackToHome";

export default function MembershipPage() {
  const { t } = useLanguage();
  const m = t?.pages?.membership || {};

  // Modal State for Class Registration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredBranch: "Shapur Main Branch",
    preferredDate: "Next Available Sunday (11:30 AM)"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setRegForm({
        name: "",
        email: "",
        phone: "",
        preferredBranch: "Shapur Main Branch",
        preferredDate: "Next Available Sunday (11:30 AM)"
      });
    }, 3000);
  };

  const benefits = [
    {
      title: m.belongingTitle || "Spiritual Belonging",
      desc: m.belongingDesc || "Be part of a caring, authentic spiritual family where you are known, loved, and supported.",
      icon: Users,
      colorBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
    {
      title: m.growthTitle || "Discipleship & Growth",
      desc: m.growthDesc || "Access deeper leadership training, ministry mentorship, and structured spiritual growth classes.",
      icon: Award,
      colorBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
    {
      title: m.serviceTitle || "Kingdom Service",
      desc: m.serviceDesc || "Discover your spiritual gifts and play a vital role in leading teams and blessing the community.",
      icon: Heart,
      colorBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20",
    },
    {
      title: m.coveringTitle || "Pastoral Covering",
      desc: m.coveringDesc || "Receive dedicated pastoral care, prayer intercession, home visits, and spiritual guidance.",
      icon: Shield,
      colorBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
  ];

  const steps = [
    {
      step: 1,
      title: m.step1Title || "Attend the Membership Class",
      desc: m.step1Desc || "Join our interactive 'Discover Kingdom' class to learn our church history, core beliefs, vision, and values.",
      icon: BookOpen,
      duration: "1 Hour Session",
    },
    {
      step: 2,
      title: m.step2Title || "Sign the Membership Covenant",
      desc: m.step2Desc || "Commit to the biblical responsibilities of church membership and protecting church unity.",
      icon: FileCheck,
      duration: "5 Min Commitment",
    },
    {
      step: 3,
      title: m.step3Title || "Pastoral Conversation",
      desc: m.step3Desc || "Meet briefly with one of our pastors to share your faith journey and ask any questions.",
      icon: UserCheck,
      duration: "15 Min Meeting",
    },
    {
      step: 4,
      title: m.step4Title || "Welcome to the Family!",
      desc: m.step4Desc || "Be officially recognized and prayed over during a joyful Sunday worship service.",
      icon: Sparkles,
      duration: "Sunday Celebration",
    },
  ];

  const covenantItems = [
    m.covenant1 || "I will protect the unity of my church by acting in love and respecting leaders.",
    m.covenant2 || "I will share the responsibility of my church by praying and inviting the unchurched.",
    m.covenant3 || "I will serve the ministry of my church by discovering my gifts and serving faithfuly.",
    m.covenant4 || "I will support the testimony of my church by living a godly life and tithing faithfully.",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-purple-500 selection:text-white">
      {/* 🧭 Global Navigation Bar */}
      <Navbar />

      {/* 🌌 Hero Section - Deep Slate with Ambient Glows */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-slate-950 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Back to Home Button */}
            <div className="mb-6 flex justify-center">
              <BackToHome label={t?.nav?.home || "Home"} />
            </div>

            {/* Pill Header */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-xs sm:text-sm mb-6 shadow-md">
              <Crown className="w-4 h-4 text-amber-300" />
              <span>Join Our Church Family • Become a Member</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 font-serif text-white">
              {m.title || "Become a Member"}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {m.subtitle || "Church membership is about committing to a spiritual family where you can be known, cared for, and encouraged in Christ."}
            </p>

            {/* Stats Highlights Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">1,200+</div>
                <div className="text-xs text-slate-400">Active Members</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">3</div>
                <div className="text-xs text-slate-400">Church Hubs</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">4 Steps</div>
                <div className="text-xs text-slate-400">Simple Pathway</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 backdrop-blur-sm border border-slate-800">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-400">Belonging</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 💡 Why Membership Matters Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {m.whyTitle || "Why Membership Matters"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed font-light">
              {m.whyDesc || "Membership is more than having your name on a list. It is a vital commitment to grow, serve, and flourish together as one body in Christ."}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${item.colorBg}`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-serif">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 👣 4-Step Membership Pathway */}
      <section className="py-16 md:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 font-serif">
              {m.stepsTitle || "Steps to Membership"}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Our simple four-step process guides you seamlessly into church membership.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {steps.map((item) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex items-start gap-5"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-purple-600/20">
                    {item.step}
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">
                        {item.title}
                      </h3>
                    </div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-semibold mb-3">
                      {item.duration}
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 📜 Membership Covenant & Class Sign Up CTA */}
      <section className="py-20 relative z-10 bg-slate-950 text-white border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center mx-auto mb-6">
              <FileCheck className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 font-serif text-white">
              {m.covenantTitle || "Our Membership Covenant"}
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 font-light leading-relaxed">
              By joining Kingdom of Christ Ministries, members partner together under four core biblical commitments:
            </p>

            {/* Checklist */}
            <div className="max-w-xl mx-auto space-y-3 text-left mb-10 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              {covenantItems.map((text, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{text}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm sm:text-base rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/25 hover:shadow-purple-600/40 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{m.signup || "Sign Up for Next Class"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="/login"
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span>Already a Member? Log In</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 📥 Interactive Class Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 bg-slate-950 text-white relative border-b border-slate-800">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs uppercase font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-2 inline-block">
                Class Registration
              </span>
              <h3 className="text-2xl font-bold font-serif text-white">Discover Kingdom Class</h3>
              <p className="text-xs text-slate-400 mt-1">Register for our upcoming Sunday membership orientation session.</p>
            </div>

            <div className="p-6 text-slate-900 dark:text-slate-100">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-serif">Registration Successful!</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Thank you, <strong>{regForm.name || "friend"}</strong>! We look forward to seeing you at <strong>{regForm.preferredBranch}</strong> for the Discover Kingdom class.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Raju"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="david@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Location / Branch *
                    </label>
                    <select
                      value={regForm.preferredBranch}
                      onChange={(e) => setRegForm({ ...regForm, preferredBranch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
                    >
                      <option value="Shapur Main Branch">Shapur Main Branch</option>
                      <option value="Subhash Nagar Branch">Subhash Nagar Branch</option>
                      <option value="Bahadurpally Branch">Bahadurpally Branch</option>
                      <option value="Online Zoom Class">Online Zoom Class</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-4 active:scale-98 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Complete Class Registration</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🦶 Global Footer */}
      <Footer />
    </div>
  );
}