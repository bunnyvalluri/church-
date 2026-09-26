# KCM Authentication & Session Management Specification

## 1. Authentication Architecture
The platform enforces server-side authentication using cryptographic JWTs delivered via secure HTTP-Only cookies.

```
[Client (Web / PWA)] ──(Credentials or Google Token)──> [/api/auth/login or /api/auth/google]
                                                                  |
                                                                  v
                                                     [Verify Hash / Google GIS]
                                                                  |
                                                                  v
                                                     [Create Session in DB & Redis]
                                                                  |
                                                                  v
                                                [Issue Set-Cookie: __kcm_session]
                                                (HttpOnly, Secure, SameSite=Lax)
```

## 2. Google Identity Services (GIS) Security
1. **Server-Side Token Verification**: The Google credential JWT sent from GIS is verified server-side against Google's public keys using `google-auth-library` or JWKS endpoint.
2. **Audience & Issuer Validation**:
   - `iss` must match `https://accounts.google.com`
   - `aud` must match `GOOGLE_CLIENT_ID`
   - `exp` must be strictly in the future.
3. **Account Linking**: Existing accounts matching the verified email are linked securely; new users are provisioned with role `MEMBER`. Client-side claims are never trusted for role elevation.
