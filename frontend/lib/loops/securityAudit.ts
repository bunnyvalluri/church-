/**
 * frontend/lib/loops/securityAudit.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Frontend Security Audit helper.
 * Validates uploads, inspects MIME types, and verifies auth state.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
];

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate client-side file upload parameters before sending to backend.
 */
export function validateClientFileUpload(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 25 MB maximum limit.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format (${file.type}). Permitted formats: JPEG, PNG, WebP, GIF, PDF, MP4.`,
    };
  }

  return { valid: true };
}

/**
 * Sanitize client string payload against XSS vulnerabilities.
 */
export function sanitizeStringInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
