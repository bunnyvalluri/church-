'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/FeedbackDisplay';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Alert } from '../../../components/ui/FeedbackDisplay';
import { QrCode, CheckCircle2 } from 'lucide-react';
import { AttendanceService } from '../services';

export const QRCheckInScanner: React.FC<{ campusId: string }> = ({ campusId }) => {
  const [ticketInput, setTicketInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [lastCheckIn, setLastCheckIn] = React.useState<{ name: string; time: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    setLoading(true);
    setError(null);

    const res = await AttendanceService.checkInByQR({
      ticketId: ticketInput.trim(),
      campusId,
    });

    setLoading(false);

    if (res.ok && res.data) {
      setLastCheckIn({
        name: res.data.memberName,
        time: new Date(res.data.attendedAt).toLocaleTimeString(),
      });
      setTicketInput('');
    } else {
      setError(res.error || 'Check-in failed. Please verify ticket status.');
    }
  };

  return (
    <Card className="max-w-md mx-auto text-left shadow-sm">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <QrCode className="h-5 w-5 text-violet-700" />
          <CardTitle className="text-lg">Event Check-In Station</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {lastCheckIn && (
          <Alert variant="success" title="Attendee Checked In">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-700" />
              <span>
                <strong>{lastCheckIn.name}</strong> checked in at {lastCheckIn.time}
              </span>
            </div>
          </Alert>
        )}

        {error && <Alert variant="error" title="Check-In Error">{error}</Alert>}

        <form onSubmit={handleManualCheckIn} className="space-y-3">
          <Input
            label="Scan or Enter Ticket ID / Phone Number"
            type="text"
            required
            value={ticketInput}
            onChange={(e) => setTicketInput(e.target.value)}
            placeholder="e.g. TKT-948271"
            autoFocus
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Record Check-In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

