"use client";

import { useEffect, useState, useCallback } from "react";
import { Stores, dbDelete, dbGet, dbPut } from "@/lib/offline/indexeddb";

export interface DraftRecord<T = any> {
  id: string;
  formId: string;
  formData: T;
  updatedAt: string;
}

export function useOfflineDraft<T extends Record<string, any>>(formId: string, initialValues: T) {
  const [formData, setFormData] = useState<T>(initialValues);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Restore draft on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDraft() {
      try {
        const draft = await dbGet<DraftRecord<T>>(Stores.DRAFTS, formId);
        if (draft && draft.formData && isMounted) {
          setFormData(draft.formData);
          setLastSavedTime(draft.updatedAt);
          setIsDraftRestored(true);
        }
      } catch (err) {
        console.warn(`[useOfflineDraft] Error loading draft for ${formId}:`, err);
      }
    }
    loadDraft();
    return () => {
      isMounted = false;
    };
  }, [formId]);

  // Save draft helper
  const saveDraft = useCallback(
    async (newValues: T) => {
      setFormData(newValues);
      const updatedAt = new Date().toISOString();
      setLastSavedTime(updatedAt);
      try {
        await dbPut(Stores.DRAFTS, {
          id: formId,
          formId,
          formData: newValues,
          updatedAt,
        });
      } catch (err) {
        console.warn(`[useOfflineDraft] Error saving draft for ${formId}:`, err);
      }
    },
    [formId]
  );

  // Clear draft upon successful submit
  const clearDraft = useCallback(async () => {
    try {
      await dbDelete(Stores.DRAFTS, formId);
      setLastSavedTime(null);
      setIsDraftRestored(false);
    } catch (err) {
      console.warn(`[useOfflineDraft] Error clearing draft for ${formId}:`, err);
    }
  }, [formId]);

  return {
    formData,
    setFormData,
    saveDraft,
    clearDraft,
    isDraftRestored,
    lastSavedTime,
  };
}
