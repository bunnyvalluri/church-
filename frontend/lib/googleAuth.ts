/**
 * lib/googleAuth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Official Google Identity Services (GIS) Web SDK Loader and Diagnostics.
 *
 * Supports:
 * - Google Identity Services OAuth 2.0 Token Client (Popup flow for custom UI buttons)
 * - Google Identity Services ID Token Client
 * - Structured client-side diagnostics and safe error fallbacks
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type GoogleSdkState = 'IDLE' | 'LOADING' | 'READY' | 'AUTHENTICATING' | 'ERROR';

export interface GoogleCredentialResponse {
  credential?: string; // The cryptographically signed Google ID Token (JWT)
  select_by?: string;
  clientId?: string;
}

export interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

export interface GoogleTokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: 'signin' | 'signup' | 'use';
            ux_mode?: 'popup' | 'redirect';
            login_uri?: string;
            state_cookie_domain?: string;
            nonce?: string;
            itp_support?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number | string;
              locale?: string;
              click_listener?: () => void;
            }
          ) => void;
          prompt: (notification?: (notification: any) => void) => void;
          disableAutoSelect: () => void;
          revoke: (hint: string, done: (done: any) => void) => void;
        };
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: any) => void;
            prompt?: string;
          }) => GoogleTokenClient;
          initCodeClient: (config: any) => any;
          revoke: (accessToken: string, done?: () => void) => void;
        };
      };
    };
  }
}

let gisScriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Returns the public Google OAuth 2.0 Web Client ID from environment variables.
 * Checks NEXT_PUBLIC_GOOGLE_CLIENT_ID.
 */
export function getGoogleClientId(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '').trim();
}

/**
 * Detects the runtime origin safely across client/server.
 */
export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
}

/**
 * Resets the cached script loading promise to allow a fresh retry if a network error occurred.
 */
export function resetGoogleGsiScriptPromise(): void {
  gisScriptLoadingPromise = null;
}

/**
 * Structured diagnostic logger for Google Identity Services.
 * NEVER logs tokens, credentials, or secrets.
 */
export function logGoogleAuthDiagnostic(event: string, details?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  const isDev = process.env.NODE_ENV !== 'production';

  const payload = {
    event,
    origin: getCurrentOrigin(),
    clientIdConfigured: Boolean(getGoogleClientId()),
    gisScriptLoaded: Boolean(window.google?.accounts?.oauth2 || window.google?.accounts?.id),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    ...details,
  };

  if (isDev) {
    console.info(`[GOOGLE_AUTH_DEBUG] ${event}:`, payload);
  }
}

/**
 * Reliably loads the Google Identity Services SDK (<script src="https://accounts.google.com/gsi/client" async defer />).
 * Features:
 * - Singleton promise to prevent duplicate script tags.
 * - Guaranteed 8-second timeout guard to prevent permanent loading spinners.
 * - Safe error handling on network disconnects.
 */
export function loadGoogleGsiScript(timeoutMs = 8000): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // If already available on window, resolve immediately
  if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
    return Promise.resolve(true);
  }

  if (gisScriptLoadingPromise) {
    return gisScriptLoadingPromise;
  }

  gisScriptLoadingPromise = new Promise<boolean>((resolve) => {
    let hasResolved = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const finalize = (success: boolean) => {
      if (hasResolved) return;
      hasResolved = true;
      if (timerId) clearTimeout(timerId);
      if (!success) {
        gisScriptLoadingPromise = null; // Clear so subsequent retries can re-attempt
      }
      resolve(success);
    };

    // Timeout guard — guarantee resolution so the UI never gets stuck
    timerId = setTimeout(() => {
      logGoogleAuthDiagnostic('SDK_LOAD_TIMEOUT', { timeoutMs });
      finalize(false);
    }, timeoutMs);

    // Check if script element is already present in DOM
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google?.accounts?.oauth2 || window.google?.accounts?.id) {
        finalize(true);
        return;
      }
      existingScript.addEventListener(
        'load',
        () => finalize(Boolean(window.google?.accounts?.oauth2 || window.google?.accounts?.id)),
        { once: true }
      );
      existingScript.addEventListener(
        'error',
        () => {
          logGoogleAuthDiagnostic('SDK_LOAD_ERROR', { error: 'Failed to load GIS script from CDN' });
          finalize(false);
        },
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      logGoogleAuthDiagnostic('SDK_LOAD_SUCCESS');
      finalize(Boolean(window.google?.accounts?.oauth2 || window.google?.accounts?.id));
    };

    script.onerror = () => {
      logGoogleAuthDiagnostic('SDK_LOAD_ERROR', { error: 'Network error loading accounts.google.com/gsi/client' });
      finalize(false);
    };

    document.head.appendChild(script);
  });

  return gisScriptLoadingPromise;
}
