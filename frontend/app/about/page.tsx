import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Church, Users, Book, Target, Heart, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Kingdom of Christ Ministries",
  description: "Learn about Kingdom of Christ Ministries - our story, leadership, beliefs, and mission",
};

export default function AboutPage() {
  const sections = [
    {
      title: "Our Story",
      description: "Discover how God built Kingdom of Christ Ministries from a small prayer group to a thriving community",
      href: "/about/story",
      icon: Church,
      color: "purple",
    },
    {
      title: "Leadership",
      description: "Meet Bishop Kurra Kristhu Raju Garu and our ministry leaders serving God's people",
      href: "/about/leadership",
      icon: Users,
      color: "indigo",
    },
    {
      title: "Our Beliefs",
      description: "Explore the core doctrines and values that guide our faith and ministry",
      href: "/about/beliefs",
      icon: Book,
      color: "blue",
    },
    {
      title: "Ministries",
      description: "Find your place to serve in worship, youth, children's, and outreach ministries",
      href: "/about/ministries",
      icon: Heart,
      color: "pink",
    },
    {
      title: "Mission & Vision",
      description: "Learn about our mission to know Christ and make Him known in Hyderabad and beyond",
      href: "/about/mission",
      icon: Target,
      color: "green",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Church className="h-4 w-4" />
              <span>Get to Know Us</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              About Us
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200 max-w-2xl mx-auto">
              Welcome to Kingdom of Christ Ministries - a vibrant community of believers
              serving God across Hyderabad
            </p>
          </div>
        </div>
      </section>

      {/* Quick Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Who We Are
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
              Kingdom of Christ Ministries is a multi-location church in Hyderabad, led by
              <strong className="text-purple-600 dark:text-purple-400"> Bishop Kurra Kristhu Raju Garu</strong>.
              We are a family of 1000+ believers worshiping at three locations: Shapur, Subhash Nagar,
              and Bahadurpally.
            </p>
            <div className="grid md:grid-cols-3 gap-6 stagger-children">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">1000+</div>
                <div className="text-gray-600 dark:text-gray-400">Active Members</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">3</div>
                <div className="text-gray-600 dark:text-gray-400">Locations</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover-lift">
                <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">50+</div>
                <div className="text-gray-600 dark:text-gray-400">Events Yearly</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Sections */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-12 text-center">
              Learn More About Us
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {sections.map((section, index) => (
                <Link
                  key={index}
                  href={section.href}
                  className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift card-flip transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <section.icon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {section.description}
                  </p>
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-4 transition-all">
                    Learn More
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Statement */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl p-12 text-center shadow-xl animate-scale-in">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
                <Heart className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-6">
                "To know Christ and make Him known"
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                We exist to worship God, grow disciples, serve our community, and reach the lost
                with the transforming power of the Gospel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
              Join Our Family
            </h2>
            <p className="text-xl text-purple-100 mb-8 animate-fade-in-up animate-delay-100">
              Experience the love of Christ in a welcoming community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/membership"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Become a Member
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover-lift"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
