import Image from "next/image";
import Link from "next/link";
import { BookOpen, Download, Play, MessageCircle, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function BibleStudyPage() {
  const studies = [
    {
      title: "The Book of John",
      description: "A 12-week journey through the Gospel of John, exploring the divinity of Christ.",
      type: "Current Study",
      format: "Video + PDF",
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80"
    },
    {
      title: "Psalms for Daily Life",
      description: "Finding comfort, strength, and joy in the songs of the Bible.",
      type: "Devotional",
      format: "Audio + Guide",
      image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&q=80"
    },
    {
      title: "Romans: The Gospel Explained",
      description: "Understanding the foundations of our faith through Paul's letter to the Romans.",
      type: "Theology",
      format: "Study Guide",
      image: "https://images.unsplash.com/photo-1457449940276-e8deed18bfff?w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="bg-blue-900 text-white py-16">
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-800 mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Bible Study</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            Deepen your understanding of Scripture with our curated resources.
          </p>
        </div>
      </div>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studies.map((study, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300">
                <div className="relative h-56">
                  <Image src={study.image} alt={study.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {study.type}
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{study.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{study.description}</p>

                  <div className="flex flex-wrap gap-4">
                    <button className="flex-1 py-3 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                      <Download className="w-4 h-4" />
                      Guide
                    </button>
                    <button className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                      <Play className="w-4 h-4" />
                      Watch
                    </button>
                  </div>
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
