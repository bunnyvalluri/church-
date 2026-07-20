import Sermons from "@/components/sections/Sermons";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Mic2, FileText, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SermonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sermon Library</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Browse our collection of life-changing messages. Watch, listen, or read sermon notes.
          </p>
        </div>
      </div>

      {/* Main Sermons List (Reusing our powerful component) */}
      <Sermons />

      {/* Categories/Series */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Browse by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Series</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Faith in Action", count: "4 Parts", image: "https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=800&q=80" },
              { title: "The Power of Prayer", count: "6 Parts", image: "https://images.unsplash.com/photo-1544764200-d834fd210a23?w=800&q=80" },
              { title: "Living in Victory", count: "8 Parts", image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80" },
            ].map((series, i) => (
              <div key={i} className="group relative rounded-2xl overflow-hidden cursor-pointer">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all z-10" />
                <div className="relative w-full h-64">
                  <Image
                    src={series.image}
                    alt={series.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="absolute bottom-0 left-0 p-6 z-20 text-white">
                  <div className="text-sm font-medium bg-purple-600 px-3 py-1 rounded-full inline-block mb-2">
                    {series.count}
                  </div>
                  <h3 className="text-2xl font-bold group-hover:text-purple-300 transition-colors">
                    {series.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
