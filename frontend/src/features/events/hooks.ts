'use client';

import * as React from 'react';
import { EventsService } from './services';
import { ChurchEvent } from './schemas';

export function useEventsList(params?: { campusId?: string; category?: string }) {
  const [events, setEvents] = React.useState<ChurchEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      const res = await EventsService.getEvents(params);
      if (isMounted) {
        if (res.ok && res.data) {
          setEvents(res.data.events);
        } else {
          setError(res.error || 'Unable to load church events.');
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [params?.campusId, params?.category]);

  return { events, loading, error };
}

