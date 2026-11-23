/**
 * src/stores/index.ts
 * Lightweight, type-safe reactive stores.
 */

import { useSyncExternalStore } from 'react';

type Listener<T> = (state: T) => void;

export class SimpleStore<T> {
  private state: T;
  private listeners: Set<Listener<T>> = new Set();

  constructor(initialState: T) {
    this.state = initialState;
    this.getState = this.getState.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T> | ((prev: T) => T)): void {
    if (typeof partial === 'function') {
      this.state = (partial as (prev: T) => T)(this.state);
    } else {
      this.state = { ...this.state, ...partial };
    }
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export function useStore<T>(store: SimpleStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

export interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  selectedCampusId: string;
}

export const uiStore = new SimpleStore<UIState>({
  sidebarOpen: false,
  activeModal: null,
  selectedCampusId: 'branch_kukatpally',
});
