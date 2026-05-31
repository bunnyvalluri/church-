"use server";

import { prisma } from "@/lib/prisma";
import { LRUCache } from "@/lib/lruCache";

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

// ── Shared field selector — avoids repetition across queries ─────────────────
const SERMON_SELECT = {
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
} as const;

// ── O(1) In-Memory LRU Cache for search queries ──────────────────────────────
const searchCache = new LRUCache<string, Sermon[]>(100);

// ── Get latest sermons ────────────────────────────────────────────────────────
export async function getLatestSermons(limit = 6): Promise<Sermon[]> {
  try {
    return await prisma.sermon.findMany({
      orderBy: { date: "desc" },
      take: limit,
      select: SERMON_SELECT,
    });
  } catch (error) {
    console.error("[SERMONS] getLatestSermons failed:", error);
    return [];
  }
}

// ── Get sermon by ID ──────────────────────────────────────────────────────────
export async function getSermonById(id: string): Promise<Sermon | null> {
  if (!id || typeof id !== "string") return null;
  try {
    return await prisma.sermon.findUnique({
      where: { id },
      select: SERMON_SELECT,
    });
  } catch (error) {
    console.error(`[SERMONS] getSermonById(${id}) failed:`, error);
    return null;
  }
}

// ── Get sermons by category ──────────────────────────────────────────────────
export async function getSermonsByCategory(category: string, limit = 12): Promise<Sermon[]> {
  if (!category?.trim()) return [];
  try {
    return await prisma.sermon.findMany({
      where: { category: { equals: category, mode: "insensitive" } }, // case-insensitive match
      orderBy: { date: "desc" },
      take: limit,
      select: SERMON_SELECT,
    });
  } catch (error) {
    console.error(`[SERMONS] getSermonsByCategory(${category}) failed:`, error);
    return [];
  }
}

// ── Get most-viewed sermons ──────────────────────────────────────────────────
export async function getMostViewedSermons(limit = 6): Promise<Sermon[]> {
  try {
    return await prisma.sermon.findMany({
      orderBy: { views: "desc" },
      take: limit,
      select: SERMON_SELECT,
    });
  } catch (error) {
    console.error("[SERMONS] getMostViewedSermons failed:", error);
    return [];
  }
}

// ── Increment view count (fire-and-forget) ────────────────────────────────────
export async function incrementSermonViews(id: string): Promise<void> {
  if (!id) return;
  try {
    await prisma.sermon.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  } catch (error) {
    // Non-critical — log only
    console.warn(`[SERMONS] Failed to increment views for ${id}:`, error);
  }
}

// ── Search sermons by title/description (LRU-cached) ─────────────────────────
export async function searchSermons(query: string, limit = 10): Promise<Sermon[]> {
  const q = query?.trim().toLowerCase();
  if (!q || q.length < 2) return [];

  // Check the memory O(1) LRU Cache first
  const cacheKey = `${q}-${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const results = await prisma.sermon.findMany({
      where: {
        OR: [
          { title:       { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { pastor:      { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { date: "desc" },
      take: limit,
      select: SERMON_SELECT,
    });

    // Populate search cache
    searchCache.put(cacheKey, results);
    return results;
  } catch (error) {
    console.error(`[SERMONS] searchSermons("${q}") failed:`, error);
    return [];
  }
}
