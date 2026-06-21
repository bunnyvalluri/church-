"use client";

import { Star, Quote } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { motion } from "framer-motion";

const testimonialImages = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
];

export default function Testimonials() {
  const { t } = useLanguage();

  const items = (t.testimonials.items || []).map((item: any, index: number) => ({
    ...item,
    image: testimonialImages[index] || testimonialImages[0],
    rating: 5,
  }));

  return (
    <section id="testimonials" className="py-28 relative overflow-hidden">
      {/* Gradient background — no blur layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary)/0.95)] via-[hsl(var(--primary-gradient-start)/0.9)] to-[hsl(var(--primary-gradient-end)/0.95)]" />

      {/* Dot grid — CSS only, no animation */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-yellow-200 mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-5 text-white tracking-tight">
            {t.testimonials.title}{" "}
            <span className="bg-gradient-to-r from-yellow-200 via-amber-200 to-pink-200 bg-clip-text text-transparent">
              {t.testimonials.titleHighlight}
            </span>
          </h2>
          <p className="text-lg text-white/80 leading-relaxed">
            {t.testimonials.subtitle}
          </p>
        </motion.div>

        {/* Testimonials Grid — CSS hover, no whileHover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((testimonial: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: index * 0.09, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="group relative bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/35 rounded-3xl p-7 transition-colors duration-300 overflow-hidden shadow-sm"
            >
              {/* Top sheen line */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              <div className="relative z-10">
                <Quote className="h-8 w-8 text-yellow-300/60 mb-4" />

                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-300 fill-yellow-300" />
                  ))}
                </div>

                <p className="text-white/90 mb-6 leading-relaxed text-sm">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-5" />

                <div className="flex items-center gap-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-md flex-shrink-0">
                    <Image
                      src={testimonial.image || testimonialImages[0]}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
                    <p className="text-xs text-white/60 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-lg text-white/80 mb-8">
            {t.testimonials.sharePrompt}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-[hsl(var(--primary))] rounded-2xl font-bold shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            {t.testimonials.shareBtn}
            <span>→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
