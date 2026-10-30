'use client';

import * as React from 'react';
import { DonationsService } from './services';
import { DonationFormData } from './schemas';

export function useDonationCheckout() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const initiatePayment = async (data: DonationFormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await DonationsService.createOrder(data);
      if (!res.ok || !res.data) {
        setError(res.error || 'Failed to initialize payment gateway.');
        return null;
      }
      return res.data;
    } catch (err: any) {
      setError(err.message || 'Payment initiation error.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading, error };
}

