/**
 * frontend/lib/uploadSecurity.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Security Engineering: Advanced File Upload Security Validation
 * Validates file sizes, extensions, MIME types, and binary file signatures
 * (magic numbers) to prevent execution of disguised scripts/malicious files.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
}

// Byte signature limits - Phase 4 specs: Max 5MB images, 50MB videos
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_MIMES = ["video/mp4"];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".mp4"];
const FORBIDDEN_EXTENSIONS = [".exe", ".svg", ".php", ".js", ".sh", ".bat", ".html"];


/**
 * Checks a buffer's magic number bytes to verify the actual file type.
 */
export function verifyFileSignature(buffer: Buffer): string | null {
  if (buffer.length < 4) return null;

  // 1. PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }

  // 2. JPEG Signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  // 3. WEBP Signature: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    if (buffer.length >= 12) {
      const webpHeader = buffer.toString("ascii", 8, 12);
      if (webpHeader === "WEBP") {
        return "image/webp";
      }
    }
  }

  // 4. WEBM / EBML Signature: 1A 45 DF A3
  if (
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }

  // 5. MP4 ISO/IEC signatures: check for "ftyp" at index 4 (00 00 00 .. 66 74 79 70)
  if (buffer.length >= 12) {
    const ftyp = buffer.toString("ascii", 4, 8);
    if (ftyp === "ftyp") {
      return "video/mp4";
    }
  }

  return null;
}

/**
 * Validates a file's security parameters.
 */
export function validateFileSecurity(
  buffer: Buffer,
  filename: string,
  declaredMimeType: string
): SecurityValidationResult {
  // 1. Size Validation
  const size = buffer.length;
  const isImage = declaredMimeType.startsWith("image/");
  const isVideo = declaredMimeType.startsWith("video/");

  if (isImage && size > MAX_IMAGE_SIZE) {
    return { isValid: false, error: `Image exceeds maximum allowed size of 5MB. (Size: ${(size / 1024 / 1024).toFixed(2)}MB)` };
  }
  if (isVideo && size > MAX_VIDEO_SIZE) {
    return { isValid: false, error: `Video exceeds maximum allowed size of 50MB. (Size: ${(size / 1024 / 1024).toFixed(2)}MB)` };
  }
  if (!isImage && !isVideo) {
    return { isValid: false, error: `Unsupported media classification: ${declaredMimeType}` };
  }

  // 2. Extension Validation
  const extIndex = filename.lastIndexOf(".");
  if (extIndex === -1) {
    return { isValid: false, error: "File extension is missing." };
  }
  const ext = filename.slice(extIndex).toLowerCase();
  if (FORBIDDEN_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `Security Violation: File extension "${ext}" is strictly forbidden.` };
  }
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { isValid: false, error: `File extension "${ext}" is not permitted. Allowed: jpg, jpeg, png, webp, mp4.` };
  }


  // 3. Declared MIME Validation
  const allowedMimes = [...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES];
  if (!allowedMimes.includes(declaredMimeType)) {
    return { isValid: false, error: `Declared MIME type "${declaredMimeType}" is not allowed.` };
  }

  // 4. Binary File Signature (Magic Numbers) Validation
  const actualMime = verifyFileSignature(buffer);
  if (!actualMime) {
    return { isValid: false, error: "Failed to verify binary file signature. The file may be corrupt or altered." };
  }

  if (actualMime !== declaredMimeType) {
    // Treat JPEG / JPG MIME variations gently
    const isJpegMimeMatch =
      (actualMime === "image/jpeg" && declaredMimeType === "image/jpg") ||
      (actualMime === "image/jpg" && declaredMimeType === "image/jpeg");
    
    if (!isJpegMimeMatch) {
      return {
        isValid: false,
        error: `MIME type spoofing detected. Extension declares "${declaredMimeType}" but binary signature matches "${actualMime}".`,
      };
    }
  }

  return { isValid: true };
}
