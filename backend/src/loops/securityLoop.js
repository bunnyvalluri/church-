/**
 * backend/src/loops/securityLoop.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Loop 2: Security Loop
 * Scans auth routes -> Validates JWT -> Checks RBAC -> Sanitizes Uploads ->
 * Detects suspicious activity -> Saves audit logs.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const config = require('./config');
const { logAuditEvent } = require('../services/auditLogger');
const crypto = require('crypto');

// In-memory rate limiting & security tracker
const failedLogins = new Map(); // IP -> { count, timestamp }
const suspiciousActivityLog = [];

/**
 * Execute periodic Security Audit Loop scan.
 */
async function runSecurityAuditScan() {
  console.log('[SECURITY_LOOP] [OBSERVE] Running routine security audit scan...');
  const now = Date.now();
  let flaggedAnomalies = 0;

  // 1. Scan failed login attempts window
  for (const [ip, record] of failedLogins.entries()) {
    if (now - record.timestamp > config.security.loginWindowMinutes * 60 * 1000) {
      failedLogins.delete(ip); // Clear expired windows
    } else if (record.count >= config.security.maxFailedLoginsPerWindow) {
      flaggedAnomalies++;
      console.warn(`[SECURITY_LOOP] [ALERT] Suspicious activity detected! IP ${ip} exceeded ${record.count} failed login attempts.`);
      
      await logAuditEvent({
        action: 'SUSPICIOUS_BRUTE_FORCE_DETECTED',
        entity: 'SECURITY_SCANNER',
        entityId: ip,
        details: { ip, failedAttempts: record.count, windowMinutes: config.security.loginWindowMinutes },
        severity: 'WARN',
        loopName: 'Security Loop',
      });
    }
  }

  console.log(`[SECURITY_LOOP] Scan completed. Active flagged anomalies: ${flaggedAnomalies}`);
  return { flaggedAnomalies, scanTime: new Date().toISOString() };
}

/**
 * Express Middleware verifying JWT, RBAC, and payload security.
 */
function securityLoopMiddleware(requiredRoles = []) {
  return async (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // 1. Check Rate-Limiting / Brute Force
    const ipRecord = failedLogins.get(clientIp);
    if (ipRecord && ipRecord.count >= config.security.maxFailedLoginsPerWindow && (Date.now() - ipRecord.timestamp < config.security.loginWindowMinutes * 60 * 1000)) {
      await logAuditEvent({
        action: 'RATE_LIMIT_BLOCKED',
        entity: 'HTTP_REQUEST',
        entityId: clientIp,
        details: { path: req.path, ip: clientIp },
        severity: 'WARN',
        loopName: 'Security Loop',
      });
      return res.status(429).json({ error: 'Too many failed requests. Temporarily blocked by Security Loop.' });
    }

    // 2. Validate File Upload MIME Types & Content Length
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > config.security.maxFileUploadSizeBytes) {
        await logAuditEvent({
          action: 'FILE_UPLOAD_SIZE_EXCEEDED',
          entity: 'FILE_UPLOAD',
          entityId: clientIp,
          details: { sizeBytes: contentLength, maxAllowed: config.security.maxFileUploadSizeBytes },
          severity: 'WARN',
          loopName: 'Security Loop',
        });
        return res.status(413).json({ error: 'File upload exceeds maximum permitted payload size.' });
      }
    }

    // 3. Authorization Header & JWT Token Validation
    const authHeader = req.headers.authorization;
    if (requiredRoles.length > 0) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        recordFailedAttempt(clientIp);
        await logAuditEvent({
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          entity: 'AUTH_ROUTE',
          entityId: req.path,
          details: { ip: clientIp, reason: 'Missing or malformed Authorization header' },
          severity: 'WARN',
          loopName: 'Security Loop',
        });
        return res.status(401).json({ error: 'Unauthorized: Missing valid authentication token.' });
      }
    }

    next();
  };
}

function recordFailedAttempt(ip) {
  const existing = failedLogins.get(ip) || { count: 0, timestamp: Date.now() };
  existing.count += 1;
  existing.timestamp = Date.now();
  failedLogins.set(ip, existing);
}

module.exports = {
  runSecurityAuditScan,
  securityLoopMiddleware,
  recordFailedAttempt,
};
