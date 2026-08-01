/**
 * frontend/lib/openclaw/openclawTypes.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Skill Architecture Types & Schema Definitions
 * Inspired by https://github.com/VoltAgent/awesome-openclaw-skills
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';

export type SkillDomain = 
  | 'SECURITY'
  | 'EVENT'
  | 'SERMON'
  | 'NOTIFICATION'
  | 'PRAYER'
  | 'DEPLOYMENT';

export type SecurityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type UserRole = 'GUEST' | 'MEMBER' | 'FIELD_VOLUNTEER' | 'PASTOR' | 'ADMIN';

export interface SkillContext {
  userId?: string;
  userRole?: UserRole;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  authToken?: string;
  taskId?: string;
  traceId?: string;
}

export interface SkillTelemetry {
  executionId: string;
  skillId: string;
  startTime: number;
  endTime?: number;
  durationMs?: number;
  status: 'SUCCESS' | 'FAILURE' | 'CANCELLED' | 'THROTTLED';
  errorMessage?: string;
  inputSize?: number;
  outputSize?: number;
}

export interface SkillPolicy {
  requiredRole: UserRole;
  rateLimitPerMin?: number;
  requiresAuditLog?: boolean;
  maxExecutionTimeMs?: number;
}

export interface SkillDefinition<TInput = any, TOutput = any> {
  id: string; // e.g. "security.jwt_validation"
  name: string;
  description: string;
  domain: SkillDomain;
  version: string;
  author: string;
  securityLevel: SecurityLevel;
  tags: string[];
  policy: SkillPolicy;
  inputSchema: z.ZodType<TInput, any, any>;
  outputSchema?: z.ZodType<TOutput, any, any>;
  execute: (input: TInput, context: SkillContext) => Promise<SkillResult<TOutput>>;
}

export interface SkillResult<T = any> {
  success: boolean;
  skillId: string;
  domain: SkillDomain;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  telemetry: SkillTelemetry;
  timestamp: string;
}

export interface WorkflowStep {
  stepId: string;
  skillId: string;
  input: any;
  continueOnError?: boolean;
}

export interface WorkflowPipeline {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface WorkflowExecutionResult {
  pipelineId: string;
  success: boolean;
  stepResults: Array<{
    stepId: string;
    skillId: string;
    result: SkillResult;
  }>;
  totalDurationMs: number;
  executedAt: string;
}
