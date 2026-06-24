"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { Music, Users2, Heart, BookHeart, Mic2, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
      topLine: "bg-gradient-to-r from-blue-500 to-cyan-500",
    },
    {
      icon: Music,
      title: isTelugu ? "ఆరాధన (సండే సర్వీస్)" : "Worship (Sunday Service)",
      time: isTelugu ? "ఆదివారం ఉదయం 8:30" : "Sunday 8:30 AM",
      description: isTelugu ? "శక్తివంతమైన ఆరాధన మరియు దేవుని వాక్యాన్ని వినడానికి మాతో చేరండి." : "Join us for powerful worship and the word of God.",
      color: "from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))]",
      topLine: "bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))]",
    },
    {
      icon: BookHeart,
      title: isTelugu ? "యువజన ఆరాధన (యూత్ సర్వీస్)" : "Worship (Youth Service)",
      time: isTelugu ? "ప్రతీ నెల 4వ ఆదివారం సా. 6:30 - 8:30" : "Every 4th Sunday 6:30 PM - 8:30 PM",
      description: isTelugu ? "యువత మరియు యవ్వనస్తుల కోసం ప్రతి నెల జరిగే ప్రత్యేక ఆరాధన, ఇందులో ఆత్మీయ ఆరాధన మరియు బిషప్ కుర్రా క్రీస్తు రాజు గారిచే శక్తివంతమైన దైవ సందేశం అందించబడుతుంది." : "A dedicated monthly service for youth and young adults, featuring dynamic worship and an empowering Bible message by Bishop Kurra Kristhu Raju.",
      color: "from-green-500 to-emerald-500",
      topLine: "bg-gradient-to-r from-green-500 to-emerald-500",
    },
    {
      icon: Mic2,
      title: isTelugu ? "ఆరాధన (ప్రేయర్)" : "Worship (Prayer)",
      time: isTelugu ? "బుధవారం సాయంత్రం 6:30" : "Wednesday 6:30 PM",
      description: isTelugu ? "మధ్యవార ప్రార్థన కూడిక." : "Mid-week evening prayer meeting.",
      color: "from-yellow-500 to-orange-500",
      topLine: "bg-gradient-to-r from-yellow-500 to-orange-500",
    },
    {
      icon: Heart,
      title: isTelugu ? "హీలింగ్ అభిషేకం (ఆయిల్ తో)" : "Healing Anointing with Oil",
      time: isTelugu ? "ప్రతి గురువారం సా. 6:30 - 8:30" : "Every Thursday 6:30 PM – 8:30 PM",
      description: isTelugu ? "దేవుని స్వస్థత శక్తిని అనుభవించండి — ప్రతి గురువారం నూనెతో అభిషేకం మరియు ప్రత్యేక ప్రార్థనతో." : "Experience God's healing power every Thursday through anointing with oil and special intercessory prayer.",
      color: "from-pink-500 to-rose-500",
      topLine: "bg-gradient-to-r from-pink-500 to-rose-500",
    },
    {
      icon: Calendar,
      title: isTelugu ? "ఉపవాస ప్రార్థన" : "Fasting Prayer",
      time: isTelugu ? "ప్రతి గురువారం ఉదయం 7 & 10" : "Thursday 7:00 AM & 10:00 AM",
      description: isTelugu ? "ఉపవాస ప్రార్థన ద్వారా ఆత్మీయ బలం. (సంప్రదించండి: 91215 23544)" : "Spiritual strengthening through fasting prayer. (Contact: 91215 23544)",
      color: "from-[hsl(var(--primary-gradient-end))] to-[hsl(var(--primary))]",
      topLine: "bg-gradient-to-r from-[hsl(var(--primary-gradient-end))] to-[hsl(var(--primary))]",
    },
  ];

  return (
    <section id="services" className="py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 relative z-10">

        {/* Section Header — single whileInView, no state */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))] mb-4 px-4 py-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]">
            Our Services
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-5 text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.services.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
              {t.services.title.split(" ").slice(-1)[0]}
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-white/60 leading-relaxed">
            {t.services.subtitle}
          </p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
            <div className="w-8 h-[2px] bg-gradient-to-r from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary)/0.4)]" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-[hsl(var(--primary)/0.3)] to-[hsl(var(--primary))]" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--primary)/0.3)]" />
          </div>
        </motion.div>

        {/* Services Grid — CSS hover only, no framer whileHover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="services-card group relative bg-white dark:bg-white/[0.02] rounded-3xl p-8 border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden"
              >
                {/* Top border glow — CSS only */}
                <div className={`absolute top-0 inset-x-0 h-[2px] ${service.topLine} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl`} />

                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-lg services-icon`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${service.color} text-white text-xs font-semibold mb-4`}>
                    <span>🕐</span>
                    {service.time}
                  </div>
                  <p className="text-slate-600 dark:text-white/60 leading-relaxed text-sm">
                    {service.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-lg text-slate-600 dark:text-white/60 mb-8 max-w-2xl mx-auto">
            {t.services.ctaDesc}
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300 hover:scale-105 active:scale-95"
          >
            {t.services.cta}
            <span className="text-white/70">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
