"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackToHomeProps {
  className?: string;
  variant?: "default" | "glass";
  href?: string;
  label?: string;
}

export default function BackToHome({
  className,
  variant = "glass",
  href = "/",
  label = "Back to Home",
}: BackToHomeProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 select-none group min-h-[44px] min-w-[44px]",
        // Glassmorphism Variant (for dark Hero backgrounds)
        variant === "glass" && [
          "text-white bg-white/10 hover:bg-white/20",
          "border border-white/25 hover:border-white/40",
          "backdrop-blur-md shadow-sm hover:shadow-md",
          "hover:-translate-x-0.5 hover:scale-[1.02]",
          "active:scale-95 active:translate-x-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-purple-900",
        ],
        // Default Variant (for standard light backgrounds)
        variant === "default" && [
          "text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700",
          "border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
          "shadow-sm hover:shadow-md",
          "hover:-translate-x-0.5 hover:scale-[1.02]",
          "active:scale-95 active:translate-x-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
        ],
        className
      )}
      aria-label={label}
    >
      <ChevronLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
      <span>{label}</span>
    </Link>
  );
}
