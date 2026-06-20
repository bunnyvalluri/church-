"use client";

import Events from "@/components/sections/Events";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Page Header */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Events Calendar</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Stay connected with what's happening at Kingdom of Christ Ministries.
          </p>
        </div>
      </div>

      {/* Main Events List */}
      <Events />

      {/* Calendar View Placeholder (Future Feature) */}
      <section className="py-20 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold dark:text-white">January 2026</h2>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronLeft className="w-5 h-5 dark:text-white" />
              </button>
              <button className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700">
                <ChevronRight className="w-5 h-5 dark:text-white" />
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-700">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Interactive Monthly Calendar View Coming Soon</p>
          </div>
        </div>
      </section>
    </div>
  );
}
