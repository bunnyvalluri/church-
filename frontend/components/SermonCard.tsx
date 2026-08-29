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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group bg-slate-50 dark:bg-white/[0.02] rounded-3xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-shadow duration-300 border border-slate-100 dark:border-white/[0.05] contain-paint"
    >
      {/* Thumbnail */}
      <div
        className="relative h-52 overflow-hidden cursor-pointer bg-slate-950"
        onClick={() => handlePlaySermon(sermon)}
      >
        <Image
          src={sermon.thumbnail || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=600&q=80"}
          alt={sermon.title}
          fill
          loading="lazy"
          decoding="async"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-all duration-300">
          <div className="relative flex items-center justify-center">
            {/* Ambient Pulse Ring on Hover */}
            <span className="absolute w-16 h-16 rounded-full bg-purple-500/30 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
            
            {/* Liquid Glass Play Button */}
            <div className="relative w-14 h-14 rounded-full bg-white/95 dark:bg-slate-900/90 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xl shadow-black/40 border border-white/60 dark:border-white/20 group-hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md">
              <Play className="h-6 w-6 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/75 backdrop-blur-md text-white text-xs font-mono font-bold rounded-lg border border-white/10">
          {sermon.duration}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-xs font-extrabold rounded-full border border-purple-400/30 shadow-md">
          {sermon.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 text-left space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2 min-h-[3.5rem]">
          {sermon.title}
        </h3>

        {/* Meta Info */}
        <div className="space-y-2.5 text-sm text-slate-600 dark:text-white/70 font-medium pt-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold">{sermon.pastor}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{sermon.date}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>{sermon.views} {t.sermons.views}</span>
            </div>
          </div>
        </div>

        {/* Watch Button */}
        <button
          onClick={() => handlePlaySermon(sermon)}
          className="mt-4 w-full py-3.5 px-5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-md hover:shadow-xl hover:shadow-purple-600/25 transition-all duration-300 flex items-center justify-center gap-2.5 transform active:scale-95"
        >
          <Play className="h-4 w-4 fill-current" />
          <span>{t.sermons.watch}</span>
        </button>
      </div>
    </motion.div>
  );
});

SermonCard.displayName = 'SermonCard';

export default SermonCard;
