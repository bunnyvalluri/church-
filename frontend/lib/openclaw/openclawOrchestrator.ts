/**
 * frontend/lib/openclaw/openclawOrchestrator.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Skill Workflow Pipeline Orchestrator
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { openClawRegistry } from './openclawRegistry';
import { 
  SkillContext, 
  SkillResult, 
  WorkflowPipeline, 
  WorkflowExecutionResult 
} from './openclawTypes';

export class OpenClawOrchestrator {
  /**
   * Execute a composite workflow pipeline of OpenClaw skills
   */
  public async executePipeline(
    pipeline: WorkflowPipeline,
    context: SkillContext,
    onStepComplete?: (stepId: string, result: SkillResult) => void
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now();
    const stepResults: WorkflowExecutionResult['stepResults'] = [];
    let overallSuccess = true;

    for (const step of pipeline.steps) {
      const stepResult = await openClawRegistry.executeSkill(
        step.skillId,
        step.input,
        context
      );

      stepResults.push({
        stepId: step.stepId,
        skillId: step.skillId,
        result: stepResult,
      });

      if (onStepComplete) {
        onStepComplete(step.stepId, stepResult);
      }

      if (!stepResult.success && !step.continueOnError) {
        overallSuccess = false;
        break;
      }
    }

    const totalDurationMs = Date.now() - startTime;

    return {
      pipelineId: pipeline.id,
      success: overallSuccess,
      stepResults,
      totalDurationMs,
      executedAt: new Date().toISOString(),
    };
  }
}

export const openClawOrchestrator = new OpenClawOrchestrator();
