/**
 * frontend/app/api/openclaw/skills/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Skills Discovery API Endpoint
 * Returns list of registered skills, metadata, policy requirements, and tags.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeOpenClawSkills } from '@/lib/openclaw/initSkills';
import { SkillDomain } from '@/lib/openclaw/openclawTypes';

export async function GET(req: NextRequest) {
  try {
    const registry = initializeOpenClawSkills();
    const url = new URL(req.url);
    const domain = url.searchParams.get('domain') as SkillDomain | null;

    const skills = registry.listSkills(domain || undefined);

    return NextResponse.json({
      success: true,
      totalCount: skills.length,
      domainFilter: domain || 'ALL',
      skills,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
