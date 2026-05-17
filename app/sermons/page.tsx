import Sermons from "@/components/sections/Sermons";
import Image from "next/image";
import { PlayCircle, Mic2, FileText } from "lucide-react";

export default function SermonsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
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
              { title: "The Power of Prayer", count: "6 Parts", image: "https://images.unsplash.com/photo-1445633814773-e68785c19ce0?w=800&q=80" },
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
    </div>
  );
}
