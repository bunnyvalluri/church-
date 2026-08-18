/**
 * lib/googleAuth.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Identity Services (GIS) Web SDK Loader and Diagnostics Utility.
 *
 * Official GIS SDK: https://accounts.google.com/gsi/client
 * Replaces deprecated gapi.auth2 and legacy Firebase popup redirects.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type GoogleSdkState = 'UNINITIALIZED' | 'LOADING' | 'READY' | 'ERROR';

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
            context?: string;
            ux_mode?: 'popup' | 'redirect';
            login_uri?: string;
            state_cookie_domain?: string;
            nonce?: string;
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
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string; // The signed Google ID Token (JWT)
  select_by?: string;
  clientId?: string;
}

let gisScriptLoadingPromise: Promise<boolean> | null = null;

/**
 * Returns the public Google OAuth 2.0 Web Client ID from environment variables.
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
    gisScriptLoaded: Boolean(window.google?.accounts?.id),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    ...details,
  };

  if (isDev) {
    console.info(`[GOOGLE_AUTH_DEBUG] ${event}:`, payload);
  }
}

/**
 * Reliably and eagerly loads the Google Identity Services SDK (<script src="https://accounts.google.com/gsi/client" async defer />).
 * Uses a singleton promise to prevent duplicate script tags or race conditions.
 */
export function loadGoogleGsiScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  // If already available on window, resolve immediately
  if (window.google?.accounts?.id) {
    return Promise.resolve(true);
  }

  if (gisScriptLoadingPromise) {
    return gisScriptLoadingPromise;
  }

  gisScriptLoadingPromise = new Promise<boolean>((resolve) => {
    // Check if script element is already present in DOM
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      if (window.google?.accounts?.id) {
        resolve(true);
        return;
      }
      existingScript.addEventListener('load', () => resolve(true), { once: true });
      existingScript.addEventListener('error', () => {
        logGoogleAuthDiagnostic('SDK_LOAD_ERROR', { error: 'Failed to load GIS script from CDN' });
        resolve(false);
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      logGoogleAuthDiagnostic('SDK_LOAD_SUCCESS');
      resolve(true);
    };

    script.onerror = (err) => {
      logGoogleAuthDiagnostic('SDK_LOAD_ERROR', { error: 'Network error loading accounts.google.com/gsi/client' });
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return gisScriptLoadingPromise;
}
