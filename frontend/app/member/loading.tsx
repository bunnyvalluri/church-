"use client";

export default function MemberLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800/80 rounded-xl" />
          <div className="h-4 w-72 bg-gray-100 dark:bg-gray-800/50 rounded-lg" />
        </div>
        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800/80 rounded-xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/60 p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800/60 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-10 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800/60 flex-1" />
        <div className="h-10 w-48 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800/60" />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800/60 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                <div className="h-3.5 w-2/3 bg-gray-100 dark:bg-gray-800/60 rounded-md" />
                <div className="h-3 w-1/4 bg-gray-100 dark:bg-gray-800/40 rounded-md" />
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-100 dark:bg-gray-800/80 rounded-lg flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
