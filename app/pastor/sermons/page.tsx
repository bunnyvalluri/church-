"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft, Check, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

export default function PastorSermons() {
  const { user, status, mounted } = useAuth();
  const router = useRouter();
  const [localMounted, setLocalMounted] = useState(false);

  useEffect(() => {
    setLocalMounted(true);
  }, []);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pastorName, setPastorName] = useState("");
  const [category, setCategory] = useState("SPECIAL");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [tagsStr, setTagsStr] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!mounted) return;
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated" && user && user.role !== "PASTOR" && user.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [mounted, status, user, router]);

  useEffect(() => {
    if (user) {
      setPastorName(user.name || "Bishop Kurra Kristhu Raju");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch("/api/pastor/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          pastor: pastorName,
          videoUrl,
          audioUrl,
          category,
          tags,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.warning ? `Sermon published! (${data.warning})` : "Sermon published successfully!");
        setTitle("");
        setDescription("");
        setVideoUrl("");
        setAudioUrl("");
        setTagsStr("");
      } else {
        throw new Error(data.error || "Failed to publish sermon");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 text-gray-800 dark:text-gray-200 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          href="/pastor"
          className="inline-flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold hover:underline transition-all"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          Back to Pastor Dashboard
        </Link>

        {/* Sermon Uploader Form */}
        <div className="bg-white dark:bg-gray-800/40 rounded-3xl border border-gray-150 dark:border-white/5 shadow-xl p-8 md:p-10 backdrop-blur-xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-950 dark:text-white tracking-tight">Upload new Sermon</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Publish multimedia biblestudies and message links</p>
            </div>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 text-sm rounded-lg flex items-center gap-2 animate-scale-in">
              <Check className="w-4 h-4 flex-shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 text-sm rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Sermon Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Living in Victory through Faith"
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Preacher / Pastor Name *
                </label>
                <input
                  type="text"
                  value={pastorName}
                  onChange={(e) => setPastorName(e.target.value)}
                  required
                  placeholder="Pastor's name"
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                >
                  <option value="WORSHIP">Sunday Worship Sermon</option>
                  <option value="PRAYER">Prayer Meeting Message</option>
                  <option value="YOUTH">Youth Session Message</option>
                  <option value="HEALING">Healing & Deliverance</option>
                  <option value="SPECIAL">Special Event Message</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Video YouTube Link (Optional)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Audio Stream Link (Optional)
                </label>
                <input
                  type="url"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Sermon Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="faith, grace, proverbs, bible"
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description / Message Outline *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Brief summary or bullet-point scriptures referenced..."
                rows={5}
                className="w-full py-3.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all resize-none text-sm leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl transition-all active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing Message...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Publish Sermon
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
