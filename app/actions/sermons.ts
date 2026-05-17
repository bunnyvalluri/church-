"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Sermon = {
  id: string;
  title: string;
  description: string;
  pastor: string;
  date: Date;
  videoUrl: string | null;
  audioUrl: string | null;
  thumbnail: string | null;
  category: string;
  tags: string[];
  views: number;
};

// ── Cached sermon fetcher (revalidates every 5 minutes) ───────────────────────
export const getLatestSermons = unstable_cache(
  async (): Promise<Sermon[]> => {
    try {
      const sermons = await prisma.sermon.findMany({
        orderBy: { date: "desc" },
        take: 6,
        select: {
          id: true,
          title: true,
          description: true,
          pastor: true,
          date: true,
          videoUrl: true,
          audioUrl: true,
          thumbnail: true,
          category: true,
          tags: true,
          views: true,
        },
      });
      return sermons;
    } catch (error) {
      console.error("[SERVER ACTION] getLatestSermons failed:", error);
      return [];
    }
  },
  ["latest-sermons"],
  {
    revalidate: 300, // 5 minutes
    tags: ["sermons"],
  }
);

// ── Increment view count (fire-and-forget) ────────────────────────────────────
export async function incrementSermonViews(id: string): Promise<void> {
  try {
    await prisma.sermon.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    // Non-critical: log but don't throw
    console.warn(`[SERVER ACTION] Failed to increment views for sermon ${id}:`, error);
  }
}

// ── Get a single sermon by ID (Cached) ────────────────────────────────────────
export const getSermonById = unstable_cache(
  async (id: string): Promise<Sermon | null> => {
    try {
      return await prisma.sermon.findUnique({ where: { id } });
    } catch (error) {
      console.error(`[SERVER ACTION] getSermonById(${id}) failed:`, error);
      return null;
    }
  },
  ["sermon-by-id"],
  {
    revalidate: 3600, // 1 hour cache since single sermons rarely change
    tags: ["sermons"],
  }
);

// ── Get sermons by category (Cached) ──────────────────────────────────────────
export const getSermonsByCategory = unstable_cache(
  async (category: string): Promise<Sermon[]> => {
    try {
      return await prisma.sermon.findMany({
        where: { category },
        orderBy: { date: "desc" },
        take: 12,
      });
    } catch (error) {
      console.error(`[SERVER ACTION] getSermonsByCategory(${category}) failed:`, error);
      return [];
    }
  },
  ["sermons-by-category"],
  {
    revalidate: 300, // 5 minutes
    tags: ["sermons"],
  }
);
