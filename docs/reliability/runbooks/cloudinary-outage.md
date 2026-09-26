# Runbook: Cloudinary Media Outage & Upload Degradation

## 1. Symptoms & Trigger Conditions
- Alert: `CloudinaryUploadFailureRateHigh`.
- Media upload requests on `/event-manager` or `/pastor` return 500/504 errors.

## 2. Immediate Diagnostic Actions
1. **Check Cloudinary Status**:
   - Verify status on `status.cloudinary.com`.
2. **Verify API Credentials & Rate Limits**:
   - Check `CLOUDINARY_API_KEY` and account transformation credits.

## 3. Containment & Remediation
- **Graceful Degradation**:
  The application automatically catches Cloudinary failures and notifies the user with a retryable toast while preserving form draft inputs.
- **Fail-Safe Mode**:
  Uploaded media buffers locally in the upload queue until Cloudinary upstream recovers.

## 4. Verification
- Test uploading an event poster image (< 15MB) and confirm dynamic WebP transformation.
