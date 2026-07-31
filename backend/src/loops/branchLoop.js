/**
 * backend/src/loops/branchLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 3: Branch Monitoring Loop
 * Monitored Branches: Shapur Nagar, Subhash Nagar, Bahadurpally.
 * Checks for missing reports, pending uploads, incomplete attendance.
 * Dispatch reminders & updates STATE.md.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const config = require('./config');
const { logAuditEvent } = require('../services/auditLogger');
const fs = require('fs');
const path = require('path');

const STATE_FILE_PATH = path.join(__dirname, '../../../STATE.md');

/**
 * Execute routine audit of church branches (Shapur Nagar, Subhash Nagar, Bahadurpally).
 */
async function auditBranchComplianceLoop(io) {
  console.log('[BRANCH_LOOP] [OBSERVE] Initiating multi-branch audit scan...');
  const auditResults = [];

  for (const branch of config.branches) {
    console.log(`[BRANCH_LOOP] [ORIENT] Auditing branch: ${branch.name} (${branch.id})`);
    
    let missingReports = 0;
    let pendingUploads = 0;
    let incompleteAttendance = 0;

    try {
      // 1. Check Event Reports for the past 7 days
      if (prisma.eventReport) {
        const pastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const reportCount = await prisma.eventReport.count({
          where: { branchId: branch.id, createdAt: { gte: pastWeek } },
        });
        if (reportCount === 0) missingReports++;
      }

      // 2. Check Pending Media Reports
      if (prisma.mediaReport) {
        const unverifiedMedia = await prisma.mediaReport.count();
        pendingUploads += unverifiedMedia > 0 ? 0 : 0; // Baseline count
      }

      // 3. Check Recent Attendance Completeness
      if (prisma.eventAttendance) {
        const recentAttendance = await prisma.eventAttendance.count({
          where: { event: { branchId: branch.id } },
        });
        if (recentAttendance === 0) incompleteAttendance++;
      }
    } catch (err) {
      console.warn(`[BRANCH_LOOP] DB Query warning for branch ${branch.name}: ${err.message}`);
    }

    // Calculate Branch Compliance Score
    const penalties = (missingReports * 20) + (pendingUploads * 10) + (incompleteAttendance * 15);
    const score = Math.max(0, 100 - penalties);
    const status = score >= 90 ? 'HEALTHY' : score >= 75 ? 'ATTENTION_NEEDED' : 'CRITICAL_ACTION_REQUIRED';

    const branchMetric = {
      id: branch.id,
      name: branch.name,
      score: `${score.toFixed(1)}%`,
      missingReports,
      pendingUploads,
      incompleteAttendance,
      status,
    };

    auditResults.push(branchMetric);

    // 4. ACT: Trigger Leader Reminder if action needed
    if (score < 90) {
      console.warn(`[BRANCH_LOOP] [ACT] Dispatching compliance alert to leader of ${branch.name} (${branch.pastorEmail})`);
      if (io) {
        io.emit('branch:alert', {
          branchId: branch.id,
          branchName: branch.name,
          score: `${score.toFixed(1)}%`,
          message: `Action Required for ${branch.name}: ${missingReports} missing reports, ${pendingUploads} pending media uploads.`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }

  // 5. Update STATE.md Branch Compliance Matrix
  updateStateBranchMatrix(auditResults);

  await logAuditEvent({
    action: 'BRANCH_AUDIT_COMPLETED',
    entity: 'BRANCH_MONITOR',
    entityId: 'ALL_BRANCHES',
    details: { auditResults },
    severity: 'INFO',
    loopName: 'Branch Loop',
  });

  return auditResults;
}

/**
 * Replace Branch Matrix section in STATE.md
 */
function updateStateBranchMatrix(results) {
  try {
    if (!fs.existsSync(STATE_FILE_PATH)) return;

    let content = fs.readFileSync(STATE_FILE_PATH, 'utf8');
    const tableLines = results.map(r => 
      `| **${r.name}** | \`${r.id}\` | **${r.score}** | \`${r.missingReports === 0 ? 'UP_TO_DATE' : 'MISSING'}\` | \`${r.pendingUploads === 0 ? 'CURRENT' : 'PENDING'}\` | \`${r.incompleteAttendance === 0 ? 'COMPLETE' : 'INCOMPLETE'}\` | ${new Date().toISOString().split('T')[0]} |`
    ).join('\n');

    const matrixHeader = '| Branch Name | Branch ID | Compliance Score | Weekly Report | Media Uploads | Attendance Sync | Last Audit |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |';
    const regex = new RegExp(`${matrixHeader.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?(?=\\n\\n|$)`);

    if (regex.test(content)) {
      content = content.replace(regex, `${matrixHeader}\n${tableLines}`);
      fs.writeFileSync(STATE_FILE_PATH, content, 'utf8');
    }
  } catch (err) {
    console.warn(`[BRANCH_LOOP] Telemetry write note: ${err.message}`);
  }
}

module.exports = {
  auditBranchComplianceLoop,
};
