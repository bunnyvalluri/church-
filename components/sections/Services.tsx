"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Music, Users2, Heart, BookHeart, Mic2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export default function Services() {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTelugu = mounted && language === 'te';

  const services = [
    {
      icon: Users2,
      title: isTelugu ? "ఉదయం ఆరాధన (వాచ్ టవర్)" : "Worship (Watch Tower)",
      time: isTelugu ? "ఆదివారం ఉదయం 5:45" : "Sunday 5:45 AM",
      description: isTelugu ? "వాక్యం ద్వారా దేవుని తెలుసుకోవడానికి మా మొదటి ఆరాధనలో చేరండి." : "Join our early morning Watch Tower service to seek God.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Music,
      title: isTelugu ? "ఆరాధన (సండే సర్వీస్)" : "Worship (Sunday Service)",
      time: isTelugu ? "ఆదివారం ఉదయం 8:30" : "Sunday 8:30 AM",
      description: isTelugu ? "శక్తివంతమైన ఆరాధన మరియు దేవుని వాక్యాన్ని వినడానికి మాతో చేరండి." : "Join us for powerful worship and the word of God.",
      color: "from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))]",
    },
    {
      icon: BookHeart,
      title: isTelugu ? "యువజన ఆరాధన (యూత్ సర్వీస్)" : "Worship (Youth Service)",
      time: isTelugu ? "ఆదివారం ఉదయం 10:30" : "Sunday 10:30 AM",
      description: isTelugu ? "బిషప్ కుర్రా క్రీస్తు రాజు గారి ప్రత్యేక బైబిల్ ప్రవచనము మరియు సమావేశం." : "Special Sunday service and Bible message by Bishop Kurra Kristhu Raju.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Mic2,
      title: isTelugu ? "ఆరాధన (ప్రేయర్)" : "Worship (Prayer)",
      time: isTelugu ? "ఆదివారం ఉదయం 10:30" : "Wednesday 6:30 PM", // Keep it consistent with time translation structure safely
      description: isTelugu ? "మధ్యవార ప్రార్థన కూడిక." : "Mid-week evening prayer meeting.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      title: isTelugu ? "హీలింగ్ ఆరాధన" : "Healing Worship",
      time: isTelugu ? "ప్రతీ నెల 3వ శుక్రవారం సా. 4:00" : "3rd Friday 4:00 PM",
      description: isTelugu ? "దేవుని స్వస్థత శక్తిని అనుభవించండి." : "Experience the healing power of God in this special service.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Calendar,
      title: isTelugu ? "ఉపవాస ప్రార్థన" : "Fasting Prayer",
      time: isTelugu ? "ప్రతి గురువారం ఉదయం 7 & 10" : "Thursday 7:00 AM & 10:00 AM",
      description: isTelugu ? "ఉపవాస ప్రార్థన ద్వారా ఆత్మీయ బలం. (సంప్రదించండి: 91215 23544)" : "Spiritual strengthening through fasting prayer. (Contact: 91215 23544)",
      color: "from-[hsl(var(--primary-gradient-end))] to-[hsl(var(--primary))]",
    },
  ];

  return (
    <section id="services" className="py-24 bg-white dark:bg-transparent relative z-10 transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight">
            {t.services.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/70">
            {t.services.subtitle}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative bg-slate-50 dark:bg-white/[0.02] rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] dark:hover:shadow-2xl dark:hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 border border-slate-100 dark:border-white/[0.05] dark:backdrop-blur-3xl overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors">
                    {service.title}
                  </h3>

                  <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${service.color} text-white text-sm font-medium mb-4`}>
                    {service.time}
                  </div>

                  <p className="text-slate-600 dark:text-white/70 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-slate-600 dark:text-white/70 mb-8 max-w-2xl mx-auto">
            {t.services.ctaDesc}
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] dark:from-white/10 dark:to-white/5 dark:backdrop-blur-xl dark:border dark:border-white/10 dark:hover:bg-white/20 text-white rounded-2xl font-bold tracking-wide shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
          >
            {t.services.cta}
          </a>
        </div>
      </div>
    </section>
  );
}
