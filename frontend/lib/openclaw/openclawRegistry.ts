/**
 * frontend/lib/openclaw/openclawRegistry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Dynamic Skill Registry & Policy Engine
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { 
  SkillDefinition, 
  SkillContext, 
  SkillResult, 
  SkillDomain, 
  UserRole,
  SkillTelemetry
} from './openclawTypes';

const ROLE_HIERARCHY: Record<UserRole, number> = {
  GUEST: 0,
  MEMBER: 1,
  FIELD_VOLUNTEER: 2,
  PASTOR: 3,
  ADMIN: 4,
};

class OpenClawRegistry {
  private static instance: OpenClawRegistry;
  private skills: Map<string, SkillDefinition> = new Map();
  private rateLimitTracker: Map<string, number[]> = new Map();

  private constructor() {}

  public static getInstance(): OpenClawRegistry {
    if (!OpenClawRegistry.instance) {
      OpenClawRegistry.instance = new OpenClawRegistry();
    }
    return OpenClawRegistry.instance;
  }

  /**
   * Register a new OpenClaw Skill
   */
  public registerSkill(skill: SkillDefinition): void {
    if (this.skills.has(skill.id)) {
      console.warn(`[OPENCLAW] Overwriting existing skill registration: ${skill.id}`);
    }
    this.skills.set(skill.id, skill);
  }

  /**
   * List all registered skills, optionally filtered by domain
   */
  public listSkills(domain?: SkillDomain): Array<Omit<SkillDefinition, 'execute'>> {
    const list: Array<Omit<SkillDefinition, 'execute'>> = [];
    for (const skill of this.skills.values()) {
      if (!domain || skill.domain === domain) {
        const { execute, ...meta } = skill;
        list.push(meta);
      }
    }
    return list;
  }

  /**
   * Retrieve skill definition by ID
   */
  public getSkill(id: string): SkillDefinition | undefined {
    return this.skills.get(id);
  }

  /**
   * Evaluate RBAC authorization policy for caller
   */
  public isAuthorized(requiredRole: UserRole, userRole?: UserRole): boolean {
    const callerLevel = ROLE_HIERARCHY[userRole || 'GUEST'];
    const requiredLevel = ROLE_HIERARCHY[requiredRole];
    return callerLevel >= requiredLevel;
  }

  /**
   * Check rate-limit policy for a skill invocation
   */
  private checkRateLimit(skillId: string, limitPerMin: number, context: SkillContext): boolean {
    if (!limitPerMin) return true;
    const identifier = `${skillId}:${context.userId || context.ipAddress || 'anonymous'}`;
    const now = Date.now();
    const windowStart = now - 60000;

    const timestamps = (this.rateLimitTracker.get(identifier) || []).filter(ts => ts > windowStart);
    if (timestamps.length >= limitPerMin) {
      return false;
    }
    timestamps.push(now);
    this.rateLimitTracker.set(identifier, timestamps);
    return true;
  }

  /**
   * Execute skill with full OpenClaw safety guardrails
   */
  public async executeSkill<TInput = any, TOutput = any>(
    skillId: string,
    input: TInput,
    context: SkillContext
  ): Promise<SkillResult<TOutput>> {
    const startTime = Date.now();
    const executionId = `exec_${Math.random().toString(36).substring(2, 9)}_${startTime}`;
    
    const skill = this.skills.get(skillId);

    const baseTelemetry: SkillTelemetry = {
      executionId,
      skillId,
      startTime,
      status: 'FAILURE',
    };

    if (!skill) {
      const endTime = Date.now();
      return {
        success: false,
        skillId,
        domain: 'SECURITY',
        error: {
          code: 'SKILL_NOT_FOUND',
          message: `Skill with id '${skillId}' is not registered in OpenClaw engine.`,
        },
        telemetry: {
          ...baseTelemetry,
          endTime,
          durationMs: endTime - startTime,
          errorMessage: 'Skill not found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 1. RBAC Guardrail Check
    if (!this.isAuthorized(skill.policy.requiredRole, context.userRole)) {
      const endTime = Date.now();
      return {
        success: false,
        skillId,
        domain: skill.domain,
        error: {
          code: 'UNAUTHORIZED',
          message: `Role '${context.userRole || 'GUEST'}' lacks permission for skill '${skillId}'. Requires '${skill.policy.requiredRole}'.`,
        },
        telemetry: {
          ...baseTelemetry,
          endTime,
          durationMs: endTime - startTime,
          errorMessage: 'Unauthorized access',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Rate-Limit Guardrail Check
    if (skill.policy.rateLimitPerMin) {
      const allowed = this.checkRateLimit(skillId, skill.policy.rateLimitPerMin, context);
      if (!allowed) {
        const endTime = Date.now();
        return {
          success: false,
          skillId,
          domain: skill.domain,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit of ${skill.policy.rateLimitPerMin} requests/min exceeded for skill '${skillId}'.`,
          },
          telemetry: {
            ...baseTelemetry,
            status: 'THROTTLED',
            endTime,
            durationMs: endTime - startTime,
            errorMessage: 'Rate limit exceeded',
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    // 3. Input Zod Schema Validation Guardrail
    const parseResult = skill.inputSchema.safeParse(input);
    if (!parseResult.success) {
      const endTime = Date.now();
      return {
        success: false,
        skillId,
        domain: skill.domain,
        error: {
          code: 'INVALID_INPUT_SCHEMA',
          message: `Input schema validation failed for skill '${skillId}'.`,
          details: parseResult.error.format(),
        },
        telemetry: {
          ...baseTelemetry,
          endTime,
          durationMs: endTime - startTime,
          errorMessage: 'Schema validation error',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // 4. Safe Execution with Timeout & Error Boundary
    try {
      const validatedInput = parseResult.data;
      
      const timeoutMs = skill.policy.maxExecutionTimeMs || 15000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Execution timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      const result = await Promise.race([
        skill.execute(validatedInput, context),
        timeoutPromise
      ]);

      const endTime = Date.now();
      const durationMs = endTime - startTime;

      return {
        ...result,
        telemetry: {
          executionId,
          skillId,
          startTime,
          endTime,
          durationMs,
          status: 'SUCCESS',
        },
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      const endTime = Date.now();
      return {
        success: false,
        skillId,
        domain: skill.domain,
        error: {
          code: 'EXECUTION_ERROR',
          message: err.message || 'An unexpected error occurred during skill execution.',
          details: err.stack,
        },
        telemetry: {
          ...baseTelemetry,
          endTime,
          durationMs: endTime - startTime,
          errorMessage: err.message,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const openClawRegistry = OpenClawRegistry.getInstance();
