/**
 * frontend/lib/openclaw/initSkills.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Initializes and Registers All 6 Specialized OpenClaw Skill Domains
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { registerSecuritySkills } from './skills/securitySkills';
import { registerEventSkills } from './skills/eventSkills';
import { registerSermonSkills } from './skills/sermonSkills';
import { registerNotificationSkills } from './skills/notificationSkills';
import { registerPrayerSkills } from './skills/prayerSkills';
import { registerDeploymentSkills } from './skills/deploymentSkills';
import { openClawRegistry } from './openclawRegistry';

let initialized = false;

export function initializeOpenClawSkills() {
  if (initialized) return openClawRegistry;

  registerSecuritySkills();
  registerEventSkills();
  registerSermonSkills();
  registerNotificationSkills();
  registerPrayerSkills();
  registerDeploymentSkills();

  initialized = true;
  console.log('[OPENCLAW] All 6 Specialized AI Skill Domains successfully registered in OpenClaw Engine.');
  return openClawRegistry;
}
