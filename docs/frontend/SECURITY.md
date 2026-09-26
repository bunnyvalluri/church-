# KCM Frontend Client-Side Security Specification

## 1. Client Security Protections
1. **Zero Secret Exposure**: Verification ensures only safe public environment keys (`NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) are embedded in client bundles.
2. **DOM XSS Mitigation**: Dynamic user inputs and markdown rendering use DOMPurify to strip malicious script tags, inline event handlers, and `javascript:` URIs.
3. **HTTP-Only Cookies**: Sensitive session JWT tokens are stored in `HttpOnly; Secure; SameSite=Lax` cookies inaccessible to malicious client-side scripts.
