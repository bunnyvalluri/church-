'use client';

import * as React from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/FormControls';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/FormControls';
import { Alert } from '../../../components/ui/FeedbackDisplay';
import { PrayerService, PrayerRequestFormData } from '../services';

export const PrayerRequestForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [formData, setFormData] = React.useState<PrayerRequestFormData>({
    name: '',
    phone: '',
    email: '',
    category: 'HEALING',
    request: '',
    isConfidential: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await PrayerService.submitRequest(formData);
    setLoading(false);

    if (res.ok) {
      setSuccessMsg('Your prayer request has been received. Our pastoral team is standing in prayer with you.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        category: 'HEALING',
        request: '',
        isConfidential: false,
      });
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.error || 'Failed to submit prayer request. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-left">
      {successMsg && <Alert variant="success" title="Prayer Submitted">{successMsg}</Alert>}
      {errorMsg && <Alert variant="error" title="Submission Error">{errorMsg}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Full Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Brother / Sister Name"
        />
        <Select
          label="Prayer Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
          options={[
            { value: 'HEALING', label: 'Physical Healing & Health' },
            { value: 'FAMILY', label: 'Family Peace & Restoration' },
            { value: 'FINANCE', label: 'Financial Breakthrough & Debt' },
            { value: 'DELIVERANCE', label: 'Spiritual Deliverance & Peace' },
            { value: 'THANKSGIVING', label: 'Thanksgiving & Praise' },
            { value: 'SALVATION', label: 'Salvation of Loved Ones' },
            { value: 'OTHER', label: 'Other Petition' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number (Optional for Pastoral Follow-up)"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Email Address (Optional)"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="you@example.com"
        />
      </div>

      <Textarea
        label="Prayer Petition / Details"
        required
        rows={4}
        value={formData.request}
        onChange={(e) => setFormData({ ...formData, request: e.target.value })}
        placeholder="Please write your prayer need here with faith..."
      />

      <Checkbox
        label="Keep this request strictly confidential (Pastoral team only)"
        description="If unchecked, your request may appear anonymously on the church prayer wall."
        checked={formData.isConfidential}
        onChange={(e) => setFormData({ ...formData, isConfidential: e.target.checked })}
      />

      <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
        Submit Prayer Request
      </Button>
    </form>
  );
};

