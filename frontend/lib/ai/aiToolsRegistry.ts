/**
 * frontend/lib/ai/aiToolsRegistry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Server-Side Controlled AI Tool Registry for KCM Assistant.
 *
 * Core Security Principles:
 *  1. Explicit Allowlist: Only predefined tools can be invoked.
 *  2. Server-Side RBAC: User role is verified against tool policy before execution.
 *  3. Resource Ownership: User can only access their own private data (uid match).
 *  4. No Raw Queries: Zero dynamic SQL or Mongo queries.
 *  5. Max 3 tool calls per request.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AuthenticatedUser } from '@/lib/authMiddleware';

// ─── Tool Definitions & Schemas ──────────────────────────────────────────────

export type ToolRole =
  | 'PUBLIC'
  | 'MEMBER'
  | 'PASTOR'
  | 'ADMIN'
  | 'SUPER_ADMIN'
  | 'EVENT_MANAGER'
  | 'FIELD_VOLUNTEER'
  | 'NGO_ADMIN'
  | 'BRANCH_MANAGER'
  | 'MEDIA_TEAM';

export interface ToolDefinition<TInput = any, TOutput = any> {
  name: string;
  description: string;
  allowedRoles: ToolRole[];
  inputSchema: z.ZodSchema<TInput>;
  execute: (input: TInput, user: AuthenticatedUser | null) => Promise<TOutput>;
}

// ─── 1. Public Tools ─────────────────────────────────────────────────────────

export const getPublicChurchInfoTool: ToolDefinition = {
  name: 'get_public_church_info',
  description: 'Returns official public information about Kingdom of Christ Ministries.',
  allowedRoles: ['PUBLIC', 'MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({}).optional(),
  execute: async () => {
    return {
      churchName: 'Kingdom of Christ Ministries (KCM)',
      address: '15-201, Vivekananda Nagar, Jeedimetla, Hyderabad, Telangana 500055',
      seniorPastor: 'Bishop Kurra Kristhu Raju',
      contactPhone: '+91 97040 90069',
      primaryEmail: 'kingofchristministries23@gmail.com',
      ngoRegNumber: '206/2024 (KCM Social Service)',
      upiId: 'kcm.kristhraj2004-1@okicici',
      taxExemption: '80G Tax Deductible Receipts Issued Automatically',
    };
  },
};

export const getPublicServiceTimesTool: ToolDefinition = {
  name: 'get_public_service_times',
  description: 'Returns weekly worship and prayer service schedule.',
  allowedRoles: ['PUBLIC', 'MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({}).optional(),
  execute: async () => {
    return {
      schedule: [
        { day: 'Sunday', time: '5:45 AM', service: 'Watch Tower Dawn Prayer' },
        { day: 'Sunday', time: '8:30 AM', service: 'Sunday Worship Service' },
        { day: 'Sunday', time: '10:00 AM', service: "Senior Pastor's Message & Healing Prayer" },
        { day: 'Wednesday', time: '6:30 PM', service: 'Mid-Week Corporate Prayer' },
        { day: 'Thursday', time: '7:00 AM & 10:00 AM', service: 'Fasting Prayer' },
        { day: 'Thursday', time: '6:30 PM', service: 'Oil Anointing Service' },
        { day: 'Saturday', time: '6:30 PM', service: 'Special Revival Meeting' },
        { day: '1st Sunday of Month', time: 'All Day', service: 'Water Baptism' },
        { day: '4th Sunday of Month', time: '6:30 PM', service: 'Youth & Children Ministry' },
      ],
    };
  },
};

export const getPublicEventsTool: ToolDefinition = {
  name: 'get_public_events',
  description: 'Returns upcoming published church events.',
  allowedRoles: ['PUBLIC', 'MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({ limit: z.number().min(1).max(10).default(5) }),
  execute: async (input) => {
    try {
      const events = await prisma.event.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'asc' },
        take: input.limit || 5,
        select: {
          id: true,
          title: true,
          date: true,
          time: true,
          location: true,
          category: true,
          shortDescription: true,
        },
      });
      return { events };
    } catch {
      return { events: [] };
    }
  },
};

export const getPublicSermonsTool: ToolDefinition = {
  name: 'get_public_sermons',
  description: 'Returns recent preached sermon messages and teachings.',
  allowedRoles: ['PUBLIC', 'MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({ limit: z.number().min(1).max(10).default(5) }),
  execute: async (input) => {
    try {
      const sermons = await prisma.sermon.findMany({
        where: { isDeleted: false },
        orderBy: { date: 'desc' },
        take: input.limit || 5,
        select: {
          id: true,
          title: true,
          speaker: true,
          date: true,
          bibleVerse: true,
          category: true,
          shortDescription: true,
        },
      });
      return { sermons };
    } catch {
      return { sermons: [] };
    }
  },
};

// ─── 2. Member Tools (Strict Ownership Required) ──────────────────────────────

export const getMyProfileTool: ToolDefinition = {
  name: 'get_my_profile',
  description: "Retrieves the authenticated member's personal profile.",
  allowedRoles: ['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({}).optional(),
  execute: async (_input, user) => {
    if (!user) throw new Error('Authentication required.');
    const dbUser = await prisma.user.findUnique({
      where: { id: user.uid },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });
    return { profile: dbUser };
  },
};

export const getMyPrayersTool: ToolDefinition = {
  name: 'get_my_prayers',
  description: "Retrieves the authenticated user's submitted prayer requests.",
  allowedRoles: ['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({ limit: z.number().min(1).max(10).default(5) }),
  execute: async (input, user) => {
    if (!user) throw new Error('Authentication required.');
    try {
      const prayers = await prisma.prayerRequest.findMany({
        where: { userId: user.uid },
        orderBy: { createdAt: 'desc' },
        take: input.limit || 5,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          isAnonymous: true,
        },
      });
      return { prayers };
    } catch {
      return { prayers: [] };
    }
  },
};

export const createMyPrayerRequestTool: ToolDefinition = {
  name: 'create_my_prayer_request',
  description: 'Creates a private prayer request for the authenticated user.',
  allowedRoles: ['MEMBER', 'PASTOR', 'ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER', 'FIELD_VOLUNTEER', 'NGO_ADMIN'],
  inputSchema: z.object({
    title: z.string().min(3).max(200),
    description: z.string().min(5).max(2000),
    isAnonymous: z.boolean().default(false),
  }),
  execute: async (input, user) => {
    if (!user) throw new Error('Authentication required.');
    try {
      const created = await prisma.prayerRequest.create({
        data: {
          userId: user.uid,
          title: input.title,
          description: input.description,
          category: 'OTHER',
          status: 'PENDING',
          isAnonymous: input.isAnonymous,
        },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
        },
      });
      return { success: true, prayerRequest: created };
    } catch (err: any) {
      throw new Error(`Failed to create prayer request: ${err.message}`);
    }
  },
};

// ─── 3. Pastor & Staff Tools ──────────────────────────────────────────────────

export const getAuthorizedPrayerStatsTool: ToolDefinition = {
  name: 'get_authorized_prayer_stats',
  description: 'Aggregated prayer request counts for ministry leadership.',
  allowedRoles: ['PASTOR', 'ADMIN', 'SUPER_ADMIN'],
  inputSchema: z.object({}).optional(),
  execute: async (_input, user) => {
    if (!user || !['PASTOR', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new Error('Unauthorized role.');
    }
    try {
      const total = await prisma.prayerRequest.count();
      const pending = await prisma.prayerRequest.count({ where: { status: 'PENDING' } });
      const answered = await prisma.prayerRequest.count({ where: { status: 'ANSWERED' } });
      return { totalPrayers: total, pendingPrayers: pending, answeredPrayers: answered };
    } catch {
      return { totalPrayers: 0, pendingPrayers: 0, answeredPrayers: 0 };
    }
  },
};

// ─── Tool Registry Map ─────────────────────────────────────────────────────────

export const AI_TOOL_REGISTRY: Record<string, ToolDefinition> = {
  get_public_church_info: getPublicChurchInfoTool,
  get_public_service_times: getPublicServiceTimesTool,
  get_public_events: getPublicEventsTool,
  get_public_sermons: getPublicSermonsTool,
  get_my_profile: getMyProfileTool,
  get_my_prayers: getMyPrayersTool,
  create_my_prayer_request: createMyPrayerRequestTool,
  get_authorized_prayer_stats: getAuthorizedPrayerStatsTool,
};

/**
 * Executes a tool securely with RBAC, schema validation, and ownership validation.
 */
export async function executeAITool(
  toolName: string,
  rawInput: any,
  user: AuthenticatedUser | null
): Promise<{ success: boolean; data?: any; error?: string }> {
  const tool = AI_TOOL_REGISTRY[toolName];
  if (!tool) {
    return { success: false, error: `Tool '${toolName}' not found in allowed registry.` };
  }

  // 1. Role Authorization Check
  const effectiveRole: ToolRole = (user?.role as ToolRole) || 'PUBLIC';
  if (!tool.allowedRoles.includes(effectiveRole)) {
    return {
      success: false,
      error: `Access Denied: Role '${effectiveRole}' is not authorized to execute tool '${toolName}'.`,
    };
  }

  // 2. Schema Validation
  const parseResult = tool.inputSchema.safeParse(rawInput || {});
  if (!parseResult.success) {
    return {
      success: false,
      error: `Invalid parameters for tool '${toolName}': ${parseResult.error.message}`,
    };
  }

  // 3. Execution
  try {
    const output = await tool.execute(parseResult.data, user);
    return { success: true, data: output };
  } catch (err: any) {
    return { success: false, error: err.message || 'Internal tool execution error.' };
  }
}
