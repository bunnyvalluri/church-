/**
 * frontend/lib/logger.ts
 * Structured Logger & Audit Monitoring for Event Management Platform
 */

export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  SECURITY = "SECURITY",
}

export interface LogEntry {
  level: LogLevel;
  action: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export function logEvent(
  level: LogLevel,
  action: string,
  message: string,
  metadata?: Record<string, any>
): void {
  const entry: LogEntry = {
    level,
    action,
    message,
    metadata,
    timestamp: new Date().toISOString(),
  };

  const formattedMsg = `[${entry.timestamp}] [${entry.level}] [${entry.action}] ${entry.message}`;

  switch (level) {
    case LogLevel.SECURITY:
      console.error(`🚨 SECURITY ALERT: ${formattedMsg}`, metadata || "");
      break;
    case LogLevel.ERROR:
      console.error(`❌ ${formattedMsg}`, metadata || "");
      break;
    case LogLevel.WARN:
      console.warn(`⚠️ ${formattedMsg}`, metadata || "");
      break;
    default:
      console.log(`ℹ️ ${formattedMsg}`, metadata || "");
      break;
  }
}
