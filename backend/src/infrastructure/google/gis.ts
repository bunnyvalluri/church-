/**
 * src/infrastructure/google/gis.ts
 * Server-side Google Identity Services (GIS) ID Token verification.
 */

import { OAuth2Client } from 'google-auth-library';
import { servicesConfig } from '../../config/services';
import { GoogleCredentialPayload } from '../../types/auth.types';
import { UnauthorizedError } from '../../shared/errors';

let client: OAuth2Client | null = null;

function getOAuthClient(): OAuth2Client {
  if (!client) {
    client = new OAuth2Client(servicesConfig.google.clientId);
  }
  return client;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleCredentialPayload> {
  const oauthClient = getOAuthClient();
  const clientId = servicesConfig.google.clientId;

  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: clientId || undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new UnauthorizedError('Google authentication failed: missing profile data.');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      email_verified: payload.email_verified || false,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      iss: payload.iss,
      aud: typeof payload.aud === 'string' ? payload.aud : payload.aud[0] || '',
    };
  } catch (err: any) {
    throw new UnauthorizedError(`Google credential verification failed: ${err.message}`);
  }
}

