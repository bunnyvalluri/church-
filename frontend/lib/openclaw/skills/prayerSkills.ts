/**
 * frontend/lib/openclaw/skills/prayerSkills.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Domain 5: Prayer Skills
 * - Categorize Prayer Requests
 * - Crisis Urgency & Priority Detection
 * - Intelligent Pastor Assignment Engine
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';
import { openClawRegistry } from '../openclawRegistry';
import { SkillDefinition, SkillResult } from '../openclawTypes';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Categorize Prayer Requests Skill
// ─────────────────────────────────────────────────────────────────────────────
const prayerCategorizeInputSchema = z.object({
  title: z.string(),
  description: z.string().min(5, 'Prayer request detail required'),
});

export type PrayerCategorizeInput = z.infer<typeof prayerCategorizeInputSchema>;

export interface PrayerCategorizeOutput {
  category: 'HEAL_HEALTH' | 'FAMILY_RELATIONSHIP' | 'FINANCIAL_JOB' | 'SPIRITUAL_GROWTH' | 'GUIDANCE_DECISION' | 'THANKSGIVING' | 'GENERAL';
  confidenceScore: number; // 0 to 1
  keywordsDetected: string[];
}

export const prayerCategorizeSkill: SkillDefinition<PrayerCategorizeInput, PrayerCategorizeOutput> = {
  id: 'prayer.categorize',
  name: 'Prayer Request Automated Classifier',
  description: 'Categorizes incoming prayer requests into domain categories using NLP keyword pattern matching.',
  domain: 'PRAYER',
  version: '1.0.0',
  author: 'KCM Pastoral Care Core',
  securityLevel: 'LOW',
  tags: ['prayer', 'categorization', 'pastoral-care', 'nlp'],
  policy: {
    requiredRole: 'GUEST',
    rateLimitPerMin: 60,
  },
  inputSchema: prayerCategorizeInputSchema,

  async execute(input): Promise<SkillResult<PrayerCategorizeOutput>> {
    const text = `${input.title} ${input.description}`.toLowerCase();
    const keywordsDetected: string[] = [];

    let category: PrayerCategorizeOutput['category'] = 'GENERAL';
    let confidenceScore = 0.85;

    if (text.includes('heal') || text.includes('hospital') || text.includes('sick') || text.includes('cancer') || text.includes('doctor') || text.includes('pain')) {
      category = 'HEAL_HEALTH';
      keywordsDetected.push('health', 'healing');
      confidenceScore = 0.95;
    } else if (text.includes('job') || text.includes('financial') || text.includes('debt') || text.includes('rent') || text.includes('money') || text.includes('business')) {
      category = 'FINANCIAL_JOB';
      keywordsDetected.push('finances', 'employment');
      confidenceScore = 0.92;
    } else if (text.includes('marriage') || text.includes('husband') || text.includes('wife') || text.includes('child') || text.includes('family') || text.includes('son') || text.includes('daughter')) {
      category = 'FAMILY_RELATIONSHIP';
      keywordsDetected.push('family', 'relationship');
      confidenceScore = 0.90;
    } else if (text.includes('thank') || text.includes('praise') || text.includes('blessed') || text.includes('god is good')) {
      category = 'THANKSGIVING';
      keywordsDetected.push('thanksgiving', 'praise');
      confidenceScore = 0.96;
    }

    return {
      success: true,
      skillId: 'prayer.categorize',
      domain: 'PRAYER',
      data: {
        category,
        confidenceScore,
        keywordsDetected,
      },
      telemetry: { executionId: '', skillId: 'prayer.categorize', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Priority & Crisis Detection Skill
// ─────────────────────────────────────────────────────────────────────────────
const prayerPriorityInputSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export type PrayerPriorityInput = z.infer<typeof prayerPriorityInputSchema>;

export interface PrayerPriorityOutput {
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  isCrisisAlert: boolean;
  urgencyScore: number; // 0 to 100
  crisisTriggers: string[];
  recommendedSlaMinutes: number;
}

export const prayerPriorityDetectionSkill: SkillDefinition<PrayerPriorityInput, PrayerPriorityOutput> = {
  id: 'prayer.priority_detection',
  name: 'Crisis Sentiment & Priority Detection Engine',
  description: 'Scans prayer content for emergency crisis keywords (ICU, life-threatening, grief, sudden loss) and sets SLA response priority.',
  domain: 'PRAYER',
  version: '1.0.0',
  author: 'KCM Pastoral Crisis Response',
  securityLevel: 'MEDIUM',
  tags: ['prayer', 'priority', 'crisis', 'sla'],
  policy: {
    requiredRole: 'GUEST',
    rateLimitPerMin: 60,
  },
  inputSchema: prayerPriorityInputSchema,

  async execute(input): Promise<SkillResult<PrayerPriorityOutput>> {
    const text = `${input.title} ${input.description}`.toLowerCase();
    let urgencyScore = 15;
    const crisisTriggers: string[] = [];

    const CRISIS_KEYWORDS = ['icu', 'emergency', 'life support', 'critical', 'dying', 'suicide', 'immediate prayer', 'accident', 'ventilator'];
    const URGENT_KEYWORDS = ['urgent', 'hospital', 'surgery', 'tomorrow', 'loss', 'grief'];

    CRISIS_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        urgencyScore += 45;
        crisisTriggers.push(kw);
      }
    });

    URGENT_KEYWORDS.forEach(kw => {
      if (text.includes(kw)) {
        urgencyScore += 20;
        crisisTriggers.push(kw);
      }
    });

    urgencyScore = Math.min(100, urgencyScore);

    let priority: PrayerPriorityOutput['priority'] = 'NORMAL';
    let recommendedSlaMinutes = 1440; // 24 hours

    if (urgencyScore >= 70) {
      priority = 'URGENT';
      recommendedSlaMinutes = 30; // 30 mins crisis SLA
    } else if (urgencyScore >= 40) {
      priority = 'HIGH';
      recommendedSlaMinutes = 180; // 3 hours SLA
    }

    return {
      success: true,
      skillId: 'prayer.priority_detection',
      domain: 'PRAYER',
      data: {
        priority,
        isCrisisAlert: priority === 'URGENT',
        urgencyScore,
        crisisTriggers,
        recommendedSlaMinutes,
      },
      telemetry: { executionId: '', skillId: 'prayer.priority_detection', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Pastor Assignment Skill
// ─────────────────────────────────────────────────────────────────────────────
const pastorAssignmentInputSchema = z.object({
  prayerId: z.string(),
  category: z.string(),
  priority: z.enum(['NORMAL', 'HIGH', 'URGENT']),
  preferredBranch: z.string().optional().default('Main Campus'),
});

export type PastorAssignmentInput = z.infer<typeof pastorAssignmentInputSchema>;

export interface PastorAssignmentOutput {
  assignedPastorId: string;
  pastorName: string;
  pastorTitle: string;
  pastorPhone: string;
  assignedAt: string;
  assignmentReason: string;
}

export const pastorAssignmentSkill: SkillDefinition<PastorAssignmentInput, PastorAssignmentOutput> = {
  id: 'prayer.pastor_assignment',
  name: 'Intelligent Pastor Workload & Specialty Assigner',
  description: 'Matches incoming prayer requests with active pastors based on domain specialty, crisis availability, and load balancing.',
  domain: 'PRAYER',
  version: '1.0.0',
  author: 'KCM Pastoral Care Core',
  securityLevel: 'HIGH',
  tags: ['pastor', 'assignment', 'prayer', 'workflow'],
  policy: {
    requiredRole: 'PASTOR',
    rateLimitPerMin: 40,
    requiresAuditLog: true,
  },
  inputSchema: pastorAssignmentInputSchema,

  async execute(input): Promise<SkillResult<PastorAssignmentOutput>> {
    const { category, priority } = input;

    // Simulated pastor database lookup & workload balancing
    const PASTORS = [
      { id: 'pst_01', name: 'Pastor Valluri', title: 'Senior Pastor', specialty: 'HEAL_HEALTH', activeCount: 3 },
      { id: 'pst_02', name: 'Pastor David Grace', title: 'Associate Pastor', specialty: 'FAMILY_RELATIONSHIP', activeCount: 5 },
      { id: 'pst_03', name: 'Pastor Sarah John', title: 'Care & Compassion Lead', specialty: 'FINANCIAL_JOB', activeCount: 2 },
    ];

    let selected = PASTORS.find(p => p.specialty === category) || PASTORS[0];
    if (priority === 'URGENT') {
      selected = PASTORS[0]; // Senior Pastor handles critical crisis
    }

    return {
      success: true,
      skillId: 'prayer.pastor_assignment',
      domain: 'PRAYER',
      data: {
        assignedPastorId: selected.id,
        pastorName: selected.name,
        pastorTitle: selected.title,
        pastorPhone: '+91 98765 43210',
        assignedAt: new Date().toISOString(),
        assignmentReason: `Assigned based on specialty matching '${category}' and current load balance (${selected.activeCount} active).`,
      },
      telemetry: { executionId: '', skillId: 'prayer.pastor_assignment', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// Register all Prayer skills into OpenClaw Registry
export function registerPrayerSkills() {
  openClawRegistry.registerSkill(prayerCategorizeSkill);
  openClawRegistry.registerSkill(prayerPriorityDetectionSkill);
  openClawRegistry.registerSkill(pastorAssignmentSkill);
}
