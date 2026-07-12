/**
 * frontend/hooks/useEvents.ts
 * TanStack React Query hooks for the Event Management System.
 * Wire up Firebase Auth headers and support optimistic updates.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/AuthProvider";

// Helper fetcher with token
const fetchWithAuth = async (url: string, getIdToken: () => Promise<string | null>, options: RequestInit = {}) => {
  const token = await getIdToken();
  const headers = {
    ...options.headers,
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

/**
 * Hook to fetch events with search, filters, sorting, and cursor pagination.
 */
export function useEvents(filters: {
  branchId?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  filterType?: string;
  search?: string;
  sort?: string;
  cursor?: string;
  limit?: number;
}) {
  const { getIdToken } = useAuth();
  
  const queryParams = new URLSearchParams();
  if (filters.branchId) queryParams.set("branchId", filters.branchId);
  if (filters.category) queryParams.set("category", filters.category);
  if (filters.status) queryParams.set("status", filters.status);
  if (filters.featured !== undefined) queryParams.set("featured", String(filters.featured));
  if (filters.filterType) queryParams.set("filterType", filters.filterType);
  if (filters.search) queryParams.set("search", filters.search);
  if (filters.sort) queryParams.set("sort", filters.sort);
  if (filters.cursor) queryParams.set("cursor", filters.cursor);
  if (filters.limit) queryParams.set("limit", String(filters.limit));

  return useQuery({
    queryKey: ["events", queryParams.toString()],
    queryFn: () => fetchWithAuth(`/api/events?${queryParams.toString()}`, getIdToken),
  });
}

/**
 * Hook to fetch upcoming published events.
 */
export function useUpcomingEvents(limit = 6) {
  const { getIdToken } = useAuth();
  return useQuery({
    queryKey: ["events", "upcoming", limit],
    queryFn: () => fetchWithAuth(`/api/events/upcoming?limit=${limit}`, getIdToken),
  });
}

/**
 * Hook to fetch single event details by ID or Slug.
 */
export function useEventDetails(idOrSlug: string) {
  const { getIdToken } = useAuth();
  return useQuery({
    queryKey: ["event", idOrSlug],
    queryFn: () => fetchWithAuth(`/api/events/${idOrSlug}`, getIdToken),
    enabled: !!idOrSlug,
  });
}

/**
 * Mutation to create a new event.
 */
export function useCreateEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      fetchWithAuth("/api/events", getIdToken, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to update an event.
 */
export function useUpdateEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchWithAuth(`/api/events/${id}`, getIdToken, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      if (data.event?.slug) {
        queryClient.invalidateQueries({ queryKey: ["event", data.event.slug] });
      }
    },
  });
}

/**
 * Mutation to update event status.
 */
export function useUpdateEventStatus() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchWithAuth(`/api/events/${id}/status`, getIdToken, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.id] });
      if (data.event?.slug) {
        queryClient.invalidateQueries({ queryKey: ["event", data.event.slug] });
      }
    },
  });
}

/**
 * Mutation to soft-delete an event.
 */
export function useDeleteEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/events/${id}`, getIdToken, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to restore a soft-deleted event.
 */
export function useRestoreEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/events/${id}/restore`, getIdToken, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to duplicate an event.
 */
export function useDuplicateEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchWithAuth(`/api/events/${id}/duplicate`, getIdToken, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to reorder events.
 */
export function useReorderEvents() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) =>
      fetchWithAuth("/api/events/reorder", getIdToken, {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to register for an event (public or logged-in member).
 */
export function useRegisterEvent() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      fetchWithAuth(`/api/events/${eventId}/register`, getIdToken, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Mutation to scan a QR code and check-in an attendee.
 */
export function useCheckInAttendee() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, ticketCode }: { eventId: string; ticketCode: string }) =>
      fetchWithAuth(`/api/events/${eventId}/check-in`, getIdToken, {
        method: "POST",
        body: JSON.stringify({ ticketCode }),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
    },
  });
}

/**
 * Mutation to submit a post-event report.
 */
export function useSubmitEventReport() {
  const { getIdToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      fetchWithAuth(`/api/events/${eventId}/report`, getIdToken, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
