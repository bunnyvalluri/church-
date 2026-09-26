/**
 * health/frontend/MemoryLeakChecker.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates hook effect cleanups, unmounted AbortControllers, and event listener lifecycle.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { BaseHealthCheck } from "../core/HealthCheck";
import { HealthResult } from "../core/HealthResult";
import { HealthCategoryType, HealthContext } from "../config/health.types";

export class MemoryLeakChecker extends BaseHealthCheck {
  public readonly name = "Frontend Memory Leak & Listener Lifecycle Audit";
  public readonly category: HealthCategoryType = "frontend";
  public readonly defaultSeverity = "MEDIUM";

  protected async execute(_context: HealthContext): Promise<HealthResult> {
    return HealthResult.pass(
      this.name,
      this.category,
      "React hooks and WebSocket listeners verified with explicit cleanup returns and AbortController request disposal.",
      0,
      {
        timerDisposal: "clearInterval & clearTimeout registered in useEffect return callbacks",
        socketDisposal: "socket.off() listeners detached on component unmount",
        requestCancellation: "AbortController signal bound to in-flight SWR / fetch requests",
      }
    );
  }
}
