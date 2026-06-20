import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, HandHeart, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Involved | Kingdom of Christ Ministries",
  description: "Find your place to serve, grow, and connect at Kingdom of Christ Ministries.",
};

export default function GetInvolvedPage() {
  const opportunities = [
    {
      title: "Small Groups",
      description: "Join a community to grow in faith and build lasting friendships.",
      icon: Users,
      link: "/get-involved/small-groups",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Volunteer",
      description: "Sign up to join one of our many ministry teams.",
      icon: HandHeart,
      link: "/get-involved/volunteer",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "Serve",
      description: "Discover where your gifts fit in the body of Christ.",
      icon: Heart,
      link: "/get-involved/serve",
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Get Involved
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              There is a place for you here
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Connect & Serve
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              We believe every person has a unique role to play in God's Kingdom. Whether you want to join a community group, volunteer on Sunday mornings, or serve our local community, there are many ways to get involved.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {opportunities.map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift border border-gray-100 dark:border-gray-700 block"
              >
                <div className={`w-16 h-16 ${item.color} dark:bg-opacity-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {item.description}
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-2 transition-all">
                  Learn More <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Not sure where to start?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Our team would love to help you find the perfect place to get connected.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            Contact Us
            <ArrowRight className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </section>
    </div>
  );
}
