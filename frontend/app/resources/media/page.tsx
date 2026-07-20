import Link from "next/link";
import { PlayCircle, Mic, Music, Image as ImageIcon, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MediaLibraryPage() {
  const categories = [
    { title: "Sermon Videos", count: "120+ Videos", icon: PlayCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { title: "Audio Messages", count: "300+ Episodes", icon: Mic, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Worship Music", count: "50+ Songs", icon: Music, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { title: "Photo Gallery", count: "15 Albums", icon: ImageIcon, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="bg-pink-900 text-white pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white transition-all text-sm font-medium hover:-translate-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </a>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Media Library</h1>
          <p className="text-xl text-pink-200 max-w-2xl mx-auto">
            Explore our vast collection of digital resources.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:-translate-y-2 transition-transform cursor-pointer">
                <div className={`w-14 h-14 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-6`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{cat.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium">{cat.count}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center text-gray-500 dark:text-gray-400">
            <p>Select a category above to browse content.</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
