export const dynamic = 'force-dynamic';
/**
 * frontend/app/api/openclaw/execute/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Skill Execution API Route
 * Validates RBAC policies, input schemas, and executes skill with telemetry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeOpenClawSkills } from '@/lib/openclaw/initSkills';
import { SkillContext, UserRole } from '@/lib/openclaw/openclawTypes';

export async function POST(req: NextRequest) {
  try {
    const registry = initializeOpenClawSkills();
    const body = await req.json().catch(() => ({}));
    
    const { skillId, input, userRole } = body;

    if (!skillId) {
      return NextResponse.json(
        { success: false, error: 'Parameter `skillId` is required.' },
        { status: 400 }
      );
    }

    // Extract caller context
    const context: SkillContext = {
      userId: body.userId || 'usr_next_client',
      userRole: (userRole as UserRole) || 'ADMIN', // Default to ADMIN for dev test panel
      userEmail: body.userEmail || 'admin@kcm.org',
      ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: req.headers.get('user-agent') || 'OpenClaw-Next-Client',
    };

    const result = await registry.executeSkill(skillId, input || {}, context);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: err.message || 'Internal server error executing OpenClaw skill.',
        },
      },
      { status: 500 }
    );
  }
}
