export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-[#fafafc] dark:bg-[#070814] animate-pulse">
      {/* Top Hero Banner Skeleton */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-b from-orange-100/40 via-slate-100/50 to-[#fafafc] dark:from-[#060710]/95 dark:via-[#0a0c1e]/95 dark:to-[#070814] border-b border-slate-200/60 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Action pills skeleton */}
          <div className="flex gap-3 mb-6">
            <div className="h-8 w-32 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-8 w-36 rounded-full bg-slate-200 dark:bg-white/10" />
            <div className="h-8 w-44 rounded-full bg-slate-200 dark:bg-white/10" />
          </div>

          {/* Heading skeleton */}
          <div className="h-12 sm:h-14 w-80 sm:w-96 rounded-2xl bg-slate-300 dark:bg-white/15 mb-4" />
          <div className="h-4 w-full max-w-xl rounded-lg bg-slate-200 dark:bg-white/10 mb-2" />
          <div className="h-4 w-3/4 max-w-md rounded-lg bg-slate-200 dark:bg-white/10" />
        </div>
      </section>

      {/* Floating Feature Cards Skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-30">
        <div className="bg-white/90 dark:bg-[#0c0e22]/90 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-white/10" />
              <div className="h-5 w-36 rounded-lg bg-slate-200 dark:bg-white/15" />
              <div className="h-4 w-48 rounded-lg bg-slate-100 dark:bg-white/10" />
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-white/10" />
              <div className="h-5 w-36 rounded-lg bg-slate-200 dark:bg-white/15" />
              <div className="h-4 w-48 rounded-lg bg-slate-100 dark:bg-white/10" />
            </div>
            <div className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-orange-100 dark:bg-white/10" />
              <div className="h-5 w-36 rounded-lg bg-slate-200 dark:bg-white/15" />
              <div className="h-4 w-48 rounded-lg bg-slate-100 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
