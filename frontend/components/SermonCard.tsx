import React from 'react';
import Image from 'next/image';
import { Play, Calendar, User, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface SermonCardProps {
  sermon: any;
  index: number;
  handlePlaySermon: (sermon: any) => void;
  t: any;
}

const SermonCard = React.memo(({ sermon, index, handlePlaySermon, t }: SermonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 border border-slate-100 dark:border-white/[0.05]"
    >
      {/* Thumbnail */}
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => handlePlaySermon(sermon)}
      >
        <Image
          src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80"}
          alt={sermon.title}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-8 w-8 text-[hsl(var(--primary))] ml-1" fill="currentColor" />
          </div>
        </div>
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs font-semibold rounded">
          {sermon.duration}
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-[hsl(var(--primary))] text-white text-xs font-semibold rounded-full animate-pulse">
          {sermon.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 text-left">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white tracking-tight group-hover:text-[hsl(var(--primary))] dark:group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2 min-h-[3.5rem]">
          {sermon.title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-3 text-sm text-slate-600 dark:text-white/70 font-medium">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>{sermon.pastor}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span>{sermon.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-[hsl(var(--primary))]" />
              <span>{sermon.views} {t.sermons.views}</span>
            </div>
          </div>
        </div>

        {/* Watch Button */}
        <button
          onClick={() => handlePlaySermon(sermon)}
          className="mt-5 w-full py-3 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-gradient-end))] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
        >
          <Play className="h-5 w-5" fill="currentColor" />
          {t.sermons.watch}
        </button>
      </div>
    </motion.div>
  );
});

SermonCard.displayName = 'SermonCard';

export default SermonCard;
