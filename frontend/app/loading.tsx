export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#05050A] select-none">
      {/* Spectacular Glowing Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[140px] animate-pulse duration-5000" />
        <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse delay-2000" style={{ animationDuration: '7000ms' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-amber-500/5 rounded-full blur-[160px] animate-pulse delay-4000" style={{ animationDuration: '9000ms' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Divine Concentric Spinner Logo */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer glowing purple-to-indigo ring rotating clockwise */}
          <div className="absolute inset-0 rounded-full border-[3px] border-t-[hsl(var(--primary))] border-r-transparent border-b-transparent border-l-[hsl(var(--primary-gradient-end))] animate-spin duration-1500 opacity-80" />
          
          {/* Inner gold ring rotating counter-clockwise */}
          <div className="absolute w-20 h-20 rounded-full border-2 border-r-amber-400 border-b-transparent border-t-amber-400 border-l-transparent animate-spin-reverse duration-1000 opacity-90" />
          
          {/* Inner sacred cross pulsing gold */}
          <div className="relative w-8 h-8 flex items-center justify-center animate-pulse duration-1000">
            {/* Vertical Beam */}
            <div className="absolute w-1.5 h-7 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-full shadow-[0_0_15px_#fbbf24]" />
            {/* Horizontal Beam */}
            <div className="absolute w-5 h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-full shadow-[0_0_15px_#fbbf24] -translate-y-1" />
          </div>
        </div>

        {/* Shimmering Church Branding */}
        <div className="text-center space-y-1">
          <p className="text-white font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-gray-150 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
            Kingdom of Christ
          </p>
          <p className="text-amber-400/90 text-xs font-black tracking-[0.4em] uppercase bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Ministries
          </p>
        </div>

        {/* Elegant Minimal Glow Loading Line */}
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden relative border border-white/5 shadow-inner">
          <div
            className="absolute h-full w-24 bg-gradient-to-r from-[hsl(var(--primary))] via-amber-400 to-[hsl(var(--primary-gradient-end))] rounded-full shadow-[0_0_8px_#a855f7]"
            style={{ animation: "loading-bar-slider 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite" }}
          />
        </div>
      </div>

      {/* Global Embedded Animations */}
      <style>{`
        @keyframes loading-bar-slider {
          0% { left: -50%; }
          100% { left: 110%; }
        }
        .animate-spin-reverse {
          animation: spin-reverse 1.2s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-shimmer {
          animation: text-shimmer 2.5s linear infinite;
        }
        @keyframes text-shimmer {
          0% { bg-position: 0% center; }
          100% { bg-position: -200% center; }
        }
      `}</style>
    </div>
  );
}
