'use client';

import * as React from 'react';
import { useAuth as useRootAuth } from '../../../components/providers/AuthProvider';
import { AuthService } from './services';
import { LoginFormData } from './schemas';

export function useAuthFeature() {
  const rootAuth = useRootAuth();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loginWithCredentials = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await AuthService.login(data);
      if (!res.ok || !res.data) {
        setError(res.error || 'Authentication failed. Please verify credentials.');
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Network error encountered during sign-in.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    user: rootAuth?.user,
    role: (rootAuth?.user as any)?.role,
    isAuthenticated: Boolean(rootAuth?.user),
    loading,
    error,
    loginWithCredentials,
    logout: rootAuth?.logout,
  };
}
