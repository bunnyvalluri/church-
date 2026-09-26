# Runbook: Authentication Outage & Token Recovery

## 1. Symptoms & Trigger Conditions
- Alert: `AuthFailureRateSpike` or `GoogleGISAuthenticationFailure`.
- Users report login failures on `/login` or Google Sign-In popup errors.

## 2. Immediate Diagnostic Actions
1. **Check GIS Origin & Client ID**:
   - Verify `410280994688-ln5134fjt46akdl9m781rc74fu40hq44.apps.googleusercontent.com` in Google Cloud Console.
   - Confirm Authorized JavaScript Origins include `https://kcmchurch.vercel.app` and `http://localhost:3000`.
2. **Inspect NextAuth / Session Verification**:
   - Check NextAuth server logs for JWT signature validation errors.

## 3. Containment & Remediation
- **Scenario A: Expired GIS Session**:
  Prompt client session refresh; clear corrupted client storage.
- **Scenario B: NextAuth Secret Mismatch**:
  Verify `NEXTAUTH_SECRET` is synchronized across all active backend & frontend pods.

## 4. Verification
- Test direct password login and Google OAuth flow on `/login`.
