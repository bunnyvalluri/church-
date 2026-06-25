"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Heart, Quote, ArrowLeft, Calendar, Award, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PastorMessagePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 60, damping: 14 },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05050a] transition-colors duration-300">
      <Navbar />

      {/* Hero Header */}
      <section className="relative py-24 bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all text-xs font-semibold hover:-translate-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight font-outfit">
            Pastor's Message
          </h1>
          <p className="text-lg md:text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
            A spiritual message and word of encouragement from Bishop Kurra Kristhu Raju.
          </p>
        </div>
      </section>

      {/* Message Content & Sidebar */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Main Message Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md relative"
            >
              {/* Quotation Mark Glow */}
              <Quote className="absolute top-6 right-8 w-20 h-20 text-purple-500/10 pointer-events-none" />

              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-snug">
                Welcome to Kingdom of Christ Ministries
              </h2>

              <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                <p>
                  Dear Brothers and Sisters,
                </p>
                <p>
                  I greet you all in the precious name of our Lord and Savior Jesus Christ. It is a joy and privilege to welcome you to our church family. At Kingdom of Christ Ministries, we believe that every individual is created with a divine purpose and is deeply loved by God.
                </p>
                <p>
                  Our journey began with a simple vision: to create a tabernacle where people could experience the raw power, love, and presence of God. Over the years, we have seen the Lord perform countless miracles, restore broken families, heal the sick, and guide young lives into paths of righteousness.
                </p>
                <p>
                  We are not just a congregation; we are a family of believers working together to know Christ and make Him known in Hyderabad and beyond. Whether you are seeking answers, looking for spiritual fellowship, or needing a place of refuge, we invite you to join us. There is a place for you here.
                </p>
                <p className="pt-4 border-t border-gray-100 dark:border-white/5">
                  May the grace of our Lord Jesus Christ, the love of God, and the fellowship of the Holy Spirit be with you all.
                </p>
              </div>

              {/* Sign-off */}
              <div className="mt-8 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  ✝
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                    Bishop Kurra Kristhu Raju
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 font-semibold">
                    Senior Pastor & Founder
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Spiritual Message of the Month */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden"
            >
              {/* Ambient Glows */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-white/10 blur-[80px]" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
                <div className="p-3 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-md flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-purple-200" />
                    <span className="text-xs uppercase font-bold tracking-wider text-purple-200">Word of the Month</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight leading-tight">
                    Walking in Victory Through Faith
                  </h3>
                  <p className="text-purple-100 leading-relaxed font-medium mb-6">
                    "For everyone born of God overcomes the world. This is the victory that has overcome the world, even our faith." — 1 John 5:4. Remember, no matter the giants you face today, the Greater One lives inside you. Keep your eyes on the promise, not the problem!
                  </p>
                  <Link
                    href="/sermons"
                    className="inline-flex items-center gap-2 bg-yellow-400 text-gray-950 font-bold px-6 py-3 rounded-xl hover:scale-105 active:scale-95 transition-all text-sm shadow-md"
                  >
                    Listen to Latest Sermons
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-8">
            {/* Profile Photo & Bio Card */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md flex flex-col items-center text-center"
            >
              <div className="relative w-40 h-40 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800 mb-6 overflow-hidden">
                <User className="h-20 w-20 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                Bishop Kurra Kristhu Raju
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-widest mt-1 mb-4">
                Founder & Overseer
              </p>
              
              <div className="h-[1px] w-full bg-gray-100 dark:bg-white/5 mb-4" />

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 font-medium">
                Called to ministry at an early age, Bishop Raju has spent over 25 years establishing churches, preaching the gospel, and counseling leaders throughout the state of Telangana.
              </p>

              <div className="w-full space-y-3.5 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>25+ Years of Pastoral Service</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-purple-600" />
                  <span>Passionate about Community Outreach</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Contacts / Worship Info */}
            <motion.div
              variants={itemVariants}
              className="bg-white dark:bg-white/[0.02] border border-gray-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                Join Us This Sunday
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Experience powerful, life-transforming messages and fellowship in person.
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    Subhash Nagar Main Tabernacle
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                    Sunday Services: 5:45 AM | 8:30 AM
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5">
                  <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    Bahadurpally Service
                  </h4>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                    Sunday Service: 11:00 AM
                  </p>
                </div>
              </div>

              <Link
                href="/contact"
                className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl text-center text-sm shadow-md block hover:scale-105 active:scale-95 transition-transform"
              >
                Plan Your Visit
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
