"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Check } from "lucide-react";
import SermonInlineForm from "@/components/SermonInlineForm";

export default function PastorSermons() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setLocalMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  const handleSuccess = (title: string) => {
    setSuccessMsg(`Sermon "${title}" published successfully! Redirecting to dashboard...`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      router.push("/pastor");
    }, 2500);
  };

  if (!localMounted) {
    return null;
  }

  if (status === "loading" || (user && user.role !== "PASTOR" && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/pastor"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all group"
        >
          <ArrowLeft className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
          Back to Pastor Dashboard
        </Link>

        {/* Sermon Uploader Form Container */}
        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-8 md:p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Upload new Sermon</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publish multimedia bible studies and sermon recordings</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-500/30 text-green-700 dark:text-green-300 text-sm rounded-xl flex items-center gap-2 animate-scale-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          <SermonInlineForm
            onClose={() => router.push("/pastor")}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}
