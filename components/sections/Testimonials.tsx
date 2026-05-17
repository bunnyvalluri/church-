"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "Priya Sharma",
    role: "Member since 2020",
    content: "This church has transformed my life. The community is so welcoming and the teachings have helped me grow spiritually. I'm grateful to be part of this family!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  },
  {
    name: "Rajesh Kumar",
    role: "Youth Leader",
    content: "The youth ministry here is incredible! It's a place where young people can grow in faith, build friendships, and discover their purpose in Christ.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
  {
    name: "Sunita Reddy",
    role: "Volunteer",
    content: "I love serving in this ministry. The pastors are genuine and caring, and there are so many opportunities to use your gifts to serve others.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  },
  {
    name: "David Johnson",
    role: "Member since 2018",
    content: "The worship experience here is powerful. Every service leaves me feeling refreshed and closer to God. Highly recommend visiting!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  },
  {
    name: "Lakshmi Devi",
    role: "Prayer Team",
    content: "The prayer support in this church is amazing. Whenever I've needed prayer, the team has been there for me. God has answered so many prayers!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  },
  {
    name: "Samuel Thomas",
    role: "New Member",
    content: "As a new member, I was welcomed with open arms. The small groups helped me connect quickly, and I already feel like I belong here.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            What People Are{" "}
            <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              Saying
            </span>
          </h2>
          <p className="text-lg text-purple-100">
            Hear from our community members about their experiences and how God is
            working in their lives.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <Quote className="h-10 w-10 text-purple-300 mb-4" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-white mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-purple-200">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-purple-100 mb-6">
            Want to share your testimony?
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-white text-purple-900 rounded-lg font-semibold hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-105"
          >
            Share Your Story
          </a>
        </div>
      </div>
    </section>
  );
}
