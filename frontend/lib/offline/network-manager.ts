/**
 * frontend/lib/offline/network-manager.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Network & Connection Status Manager.
 * Features:
 *  - Browser event detection (`online`, `offline`)
 *  - Active ping verification (`/api/health` or lightweight static HEAD)
 *  - Granular states: ONLINE, OFFLINE, SLOW_NETWORK, BACKEND_UNAVAILABLE, SYNCING
 *  - Periodic connectivity health check
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { ConnectionStatus, offlineEventBus } from "./offline-events";

class NetworkManager {
  private status: ConnectionStatus = "ONLINE";
  private pingIntervalId: any = null;
  private isChecking = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.status = navigator.onLine ? "ONLINE" : "OFFLINE";
      this.initListeners();
    }
  }

  private initListeners() {
    window.addEventListener("online", () => {
      this.checkRealConnectivity();
    });

    window.addEventListener("offline", () => {
      this.setStatus("OFFLINE");
    });

    // Start background ping check every 30 seconds
    this.pingIntervalId = setInterval(() => {
      if (this.status !== "OFFLINE") {
        this.checkRealConnectivity();
      }
    }, 30000);
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public isOnline(): boolean {
    return this.status === "ONLINE" || this.status === "SYNCING" || this.status === "SLOW_NETWORK";
  }

  public setStatus(newStatus: ConnectionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      offlineEventBus.emit<ConnectionStatus>("status-changed", this.status);
    }
  }

  public async checkRealConnectivity(): Promise<ConnectionStatus> {
    if (typeof window === "undefined") return "ONLINE";
    if (!navigator.onLine) {
      this.setStatus("OFFLINE");
      return "OFFLINE";
    }

    if (this.isChecking) return this.status;
    this.isChecking = true;

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // Perform a lightweight HEAD check
      const res = await fetch("/favicon.ico?_t=" + Date.now(), {
        method: "HEAD",
        cache: "no-store",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const rtt = performance.now() - startTime;

      if (res.ok || res.status === 304) {
        if (rtt > 2500) {
          this.setStatus("SLOW_NETWORK");
        } else {
          // If previous was OFFLINE or SLOW, switch to ONLINE
          if (this.status === "OFFLINE" || this.status === "BACKEND_UNAVAILABLE" || this.status === "SLOW_NETWORK") {
            this.setStatus("ONLINE");
          }
        }
      } else {
        this.setStatus("BACKEND_UNAVAILABLE");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        this.setStatus("SLOW_NETWORK");
      } else {
        this.setStatus("OFFLINE");
      }
    } finally {
      this.isChecking = false;
    }

    return this.status;
  }

  public destroy() {
    if (this.pingIntervalId) {
      clearInterval(this.pingIntervalId);
    }
  }
}

export const networkManager = new NetworkManager();
