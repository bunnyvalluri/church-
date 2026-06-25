import Link from "next/link";
import Image from "next/image";
import { User, Calendar, Tag, ArrowRight, ChevronLeft } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function BlogPage() {
  const posts = [
    {
      title: "Finding Peace in Anxiety",
      excerpt: "Learn how to trust God even when life feels overwhelming and uncertain.",
      author: "Bishop Kurra Kristhu Raju",
      date: "Jan 24, 2026",
      category: "Faith",
      image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80",
      readTime: "5 min read"
    },
    {
      title: "The Importance of Community",
      excerpt: "Why we need each other to grow in our spiritual journey.",
      author: "Pastor Sarah Johnson",
      date: "Jan 18, 2026",
      category: "Community",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
      readTime: "4 min read"
    },
    {
      title: "Prayer: A Conversation with God",
      excerpt: "Understanding the true power and purpose of daily prayer.",
      author: "Pastor John David",
      date: "Jan 10, 2026",
      category: "Prayer",
      image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
      readTime: "6 min read"
    },
    {
      title: "Serving with Joy",
      excerpt: "Discovering your spiritual gifts and using them to serve others.",
      author: "Bishop Kurra Kristhu Raju",
      date: "Jan 5, 2026",
      category: "Service",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
      readTime: "5 min read"
    },
    {
      title: "Understanding Grace",
      excerpt: "A deep dive into what grace really means for a believer.",
      author: "Pastor Michael Brown",
      date: "Dec 30, 2025",
      category: "Theology",
      image: "https://images.unsplash.com/photo-1470790376751-8b998d3663aa?w=800&q=80",
      readTime: "7 min read"
    },
    {
      title: "Family Worship at Home",
      excerpt: "Practical tips for leading your family in spiritual growth.",
      author: "Pastor Sarah Johnson",
      date: "Dec 25, 2025",
      category: "Family",
      image: "https://images.unsplash.com/photo-1542036575-b6d47b645b2b?w=800&q=80",
      readTime: "4 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog & Articles</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights, devotionals, and updates from our ministry team.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 flex flex-col h-full"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-purple-600 transition-colors">
                    <Link href={`/blog/${index}`}>{post.title}</Link>
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-1">
                    {post.excerpt}
                  </p>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {post.author}
                        </span>
                      </div>
                      <Link
                        href={`/blog/${index}`}
                        className="text-purple-600 hover:text-purple-700 dark:text-purple-400 text-sm font-semibold flex items-center gap-1"
                      >
                        Read <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
