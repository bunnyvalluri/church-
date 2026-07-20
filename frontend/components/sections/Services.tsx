"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  Music, Users2, Heart, BookHeart, Mic2, Calendar,
  MapPin, Clock, Flame, Star, Loader2, RefreshCw,
  Sparkles, ChevronRight, Globe, Shield,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Icon registry — maps icon name string from DB to Lucide component ─────────────
const ICON_MAP: Record<string, React.ElementType> = {
  Music,
  Users2,
  Heart,
  BookHeart,
  Mic2,
  Calendar,
  MapPin,
  Clock,
  Flame,
  Star,
  Globe,
  Shield,
  Sparkles,
};

function getIcon(name: string): React.ElementType {
  return ICON_MAP[name] || Heart;
}

// ── Fallback gradient map if cardColor is a Tailwind class ────────────────────────
const GRADIENT_FALLBACKS: Record<string, string> = {
  "from-blue-500 to-cyan-500": "linear-gradient(135deg, #3b82f6, #06b6d4)",
  "from-violet-500 to-purple-600": "linear-gradient(135deg, #8b5cf6, #9333ea)",
  "from-green-500 to-emerald-500": "linear-gradient(135deg, #22c55e, #10b981)",
  "from-yellow-500 to-orange-500": "linear-gradient(135deg, #eab308, #f97316)",
  "from-pink-500 to-rose-500": "linear-gradient(135deg, #ec4899, #f43f5e)",
  "from-purple-600 to-violet-500": "linear-gradient(135deg, #9333ea, #8b5cf6)",
};

function resolveGradient(cardColor: string): { gradient: string; topBorder: string } {
  // If it's a CSS gradient value directly
  if (cardColor.startsWith("linear-gradient") || cardColor.startsWith("radial-gradient")) {
    return { gradient: cardColor, topBorder: cardColor };
  }
  // Lookup Tailwind class → CSS gradient
  const resolved = GRADIENT_FALLBACKS[cardColor];
  if (resolved) return { gradient: resolved, topBorder: resolved };
  // Default fallback
  return {
    gradient: "linear-gradient(135deg, #8b5cf6, #9333ea)",
    topBorder: "linear-gradient(135deg, #8b5cf6, #9333ea)",
  };
}

// ── Format time "08:30" → "8:30 AM" ─────────────────────────────────────────────
function formatTime(t: string | null | undefined): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function buildScheduleLabel(service: any): string {
  const parts: string[] = [];
  if (service.occurrence) {
    parts.push(service.occurrence);
  } else if (service.serviceDay) {
    parts.push(service.serviceDay);
  }
  if (service.startTime) {
    const start = formatTime(service.startTime);
    const end = service.endTime ? ` – ${formatTime(service.endTime)}` : "";
    parts.push(`${start}${end}`);
  }
  return parts.join(" · ") || "See schedule";
}

// ── Service type definition ───────────────────────────────────────────────────────
interface ChurchService {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  description?: string;
  icon: string;
  iconColor: string;
  cardColor: string;
  badgeColor: string;
  serviceType: string;
  serviceDay?: string;
  occurrence?: string;
  startTime?: string;
  endTime?: string;
  frequency: string;
  location?: string;
  featured: boolean;
  status: string;
  displayOrder: number;
  branch?: { id: string; name: string };
  tags: string[];
}

// ── Memoized Service Card Component ───────────────────────────────────────────
const ServiceCard = memo(function ServiceCard({
  service,
  index,
  isExpanded,
  onToggleExpand,
}: {
  service: ChurchService;
  index: number;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}) {
  const Icon = getIcon(service.icon);
  const { gradient } = resolveGradient(service.cardColor);
  const scheduleLabel = buildScheduleLabel(service);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.21, 0.47, 0.32, 0.98] }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`${service.title} service details`}
      className="services-card group relative bg-white dark:bg-white/[0.02] rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-white/[0.06] shadow-sm overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      onClick={() => onToggleExpand(service.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand(service.id);
        }
      }}
    >
      {/* Featured ribbon */}
      {service.featured && (
        <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 dark:bg-amber-400/10 dark:text-amber-300 border border-amber-200 dark:border-amber-400/20">
          <Star className="w-3 h-3 fill-current" /> Featured
        </div>
      )}

      {/* Top border glow on hover */}
      <div
        className="absolute top-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-3xl"
        style={{ background: gradient }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg services-icon"
          style={{ background: gradient }}
        >
          <Icon className="h-8 w-8" style={{ color: service.iconColor || "#ffffff" }} />
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
          {service.title}
        </h3>

        {/* Schedule badge */}
        {scheduleLabel && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-semibold mb-4"
            style={{ background: gradient }}
          >
            <span>🕐</span>
            {scheduleLabel}
          </div>
        )}

        {/* Description */}
        <p className="text-slate-600 dark:text-white/60 leading-relaxed text-sm">
          {service.shortDescription || service.description || ""}
        </p>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                {service.description && service.shortDescription && (
                  <p className="text-slate-500 dark:text-white/50 text-xs leading-relaxed">
                    {service.description}
                  </p>
                )}
                {service.location && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{service.location}</span>
                  </div>
                )}
                {service.branch && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                    <Globe className="w-3 h-3 shrink-0" />
                    <span>{service.branch.name} Branch</span>
                  </div>
                )}
                {service.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-500 dark:text-white/40 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expand hint */}
        <div className="flex items-center gap-1 mt-3 text-xs text-[hsl(var(--primary)/0.7)] font-medium">
          <ChevronRight
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
          />
          <span>{isExpanded ? "Less" : "More info"}</span>
        </div>
      </div>
    </motion.div>
  );
});

export default function Services({ initialServices = [] }: { initialServices?: ChurchService[] }) {
  const { t } = useLanguage();
  const [services, setServices] = useState<ChurchService[]>(initialServices);
  const [loading, setLoading] = useState(initialServices.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const socketRef = useRef<any>(null);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  // ── Fetch published services ────────────────────────────────────────────────────
  const fetchServices = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/services?status=PUBLISHED", {
        cache: "no-store",
        next: { tags: ["services"] },
      } as any);
      if (!res.ok) throw new Error("Failed to load services");
      const data = await res.json();
      setServices(data.services || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialServices.length === 0) {
      fetchServices();
    }
  }, [fetchServices, initialServices]);

  // ── Socket.IO — real-time updates from admin ──────────────────────────────────
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    let socket: any = null;

    const connectSocket = async () => {
      try {
        const { io } = await import("socket.io-client");
        socket = io(socketUrl, { transports: ["websocket", "polling"] });

        socket.on("service.created", () => fetchServices());
        socket.on("service.updated", () => fetchServices());
        socket.on("service.deleted", () => fetchServices());
        socket.on("service.restored", () => fetchServices());
        socket.on("service.archived", () => fetchServices());
        socket.on("service.reordered", () => fetchServices());

        socketRef.current = socket;
      } catch {
        /* Socket.IO not available — polling fallback */
        const interval = setInterval(fetchServices, 30000);
        return () => clearInterval(interval);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchServices]);

  return (
    <section
      id="services"
      className="py-14 sm:py-20 md:py-28 bg-white dark:bg-transparent relative z-10 overflow-hidden transition-colors duration-300"
    >
      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[hsl(var(--primary))] mb-3 px-3 py-1.5 rounded-full bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.15)]">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight leading-tight">
            {t.services.title.split(" ").slice(0, -1).join(" ")}{" "}
            <span className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] bg-clip-text text-transparent">
              {t.services.title.split(" ").slice(-1)[0]}
            </span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-white/60 leading-relaxed px-2">
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

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--primary))]" />
            <p className="text-slate-500 dark:text-white/50 text-sm">Loading services…</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <p className="text-rose-500 text-sm">{error}</p>
            <button
              onClick={fetchServices}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {/* Services Grid */}
        {!loading && !error && (
          <>
            {services.length === 0 ? (
              <div className="text-center py-20 text-slate-400 dark:text-white/30 text-sm">
                No services published yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {services.map((service, index) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      index={index}
                      isExpanded={expandedId === service.id}
                      onToggleExpand={handleToggleExpand}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}


        {/* CTA */}
        {!loading && (
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
        )}
      </div>
    </section>
  );
}
