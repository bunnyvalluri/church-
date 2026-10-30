'use client';

import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/FeedbackDisplay';
import { useAuthFeature } from '../hooks';
import { LoginFormData } from '../schemas';

export interface LoginFormProps {
  onSuccess?: () => void;
  callbackUrl?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, callbackUrl = '/portal-select' }) => {
  const { loginWithCredentials, loading, error } = useAuthFeature();
  const [formData, setFormData] = React.useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginWithCredentials(formData);
    if (success) {
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = callbackUrl;
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md mx-auto text-left">
      {error && (
        <Alert variant="error" title="Sign In Failed">
          {error}
        </Alert>
      )}

      <Input
        label="Email Address"
        type="email"
        required
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="member@kcmchurch.org"
      />

      <Input
        label="Password"
        type="password"
        required
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="••••••••"
      />

      <div className="flex items-center justify-between text-xs text-slate-600">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input type="checkbox" className="rounded border-slate-300 text-violet-700" />
          <span>Remember me</span>
        </label>
        <a href="/forgot-password" className="text-violet-700 hover:underline">
          Forgot password?
        </a>
      </div>

      <Button type="submit" className="w-full" isLoading={loading}>
        Sign In to Portal
      </Button>
    </form>
  );
};

