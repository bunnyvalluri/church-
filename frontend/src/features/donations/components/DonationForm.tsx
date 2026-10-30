'use client';

import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Alert } from '../../../components/ui/FeedbackDisplay';
import { useDonationCheckout } from '../hooks';
import { DonationFormData, DonationPurpose } from '../schemas';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000];

export const DonationForm: React.FC = () => {
  const { initiatePayment, loading, error } = useDonationCheckout();
  const [amount, setAmount] = React.useState<number>(1000);
  const [purpose, setPurpose] = React.useState<DonationPurpose>('TITHE');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [pan, setPan] = React.useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: DonationFormData = {
      amount,
      purpose,
      donorName: name,
      donorEmail: email,
      donorPhone: phone,
      panNumber: pan || undefined,
      idempotencyKey: `kcm_give_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };

    const order = await initiatePayment(payload);
    if (!order) return;

    // Razorpay standard checkout integration
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Kingdom of Christ Ministries',
        description: `${purpose} Offering`,
        order_id: order.orderId,
        prefill: {
          name,
          email,
          contact: phone,
        },
        theme: {
          color: '#6D28D9',
        },
      });
      rzp.open();
    } else {
      alert('Razorpay payment gateway initialized. Please complete test transaction.');
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
      {error && <Alert variant="error" title="Payment Error">{error}</Alert>}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          Select Amount (INR ₹)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(val)}
              className={`py-2 px-3 text-sm font-semibold rounded-lg border transition ${
                amount === val
                  ? 'border-violet-600 bg-violet-50 text-violet-700 ring-2 ring-violet-600/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              ₹{val.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
        <Input
          type="number"
          min={10}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Custom Amount"
          required
        />
      </div>

      <Select
        label="Offering Type / Purpose"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value as DonationPurpose)}
        options={[
          { value: 'TITHE', label: 'Tithe (10%)' },
          { value: 'OFFERING', label: 'General Sunday Offering' },
          { value: 'BUILDING_FUND', label: 'Church Building Fund' },
          { value: 'MISSIONS', label: 'Rural Church Planting Missions' },
          { value: 'COMMUNITY_CARE', label: 'NGO Community Care & Food Pantry' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
        <Input
          label="Email (For 80G Tax Receipt)"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone (For SMS Confirmation)"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
        />
        <Input
          label="PAN Number (Optional for 80G Tax Exemption)"
          type="text"
          value={pan}
          onChange={(e) => setPan(e.target.value.toUpperCase())}
          placeholder="ABCDE1234F"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full text-base py-3" isLoading={loading}>
        Proceed to Secure Giving (₹{amount.toLocaleString('en-IN')})
      </Button>

      <p className="text-center text-xs text-slate-500">
        🔒 256-Bit Encrypted. Kingdom of Christ Ministries is an 80G tax-exempt registered non-profit trust.
      </p>
    </form>
  );
};

