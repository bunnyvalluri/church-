"use client";

import React, { useEffect, useState } from "react";
import { AlertOctagon, Check, Server, HardDrive } from "lucide-react";
import { conflictManager, ConflictRecord } from "@/lib/offline/conflict-manager";
import { offlineEventBus } from "@/lib/offline/offline-events";

export default function ConflictDialog() {
  const [activeConflict, setActiveConflict] = useState<ConflictRecord | null>(null);

  useEffect(() => {
    async function checkConflicts() {
      const unresolved = await conflictManager.getUnresolvedConflicts();
      if (unresolved.length > 0) {
        setActiveConflict(unresolved[0]);
      }
    }

    checkConflicts();

    const unsub = offlineEventBus.on("conflict-detected", () => {
      checkConflicts();
    });

    return () => unsub();
  }, []);

  if (!activeConflict) return null;

  const handleResolve = async (strategy: "KEEP_LOCAL" | "KEEP_SERVER") => {
    await conflictManager.resolveConflict(activeConflict.clientOperationId, strategy);
    const unresolved = await conflictManager.getUnresolvedConflicts();
    setActiveConflict(unresolved.length > 0 ? unresolved[0] : null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-amber-400 mb-4">
          <AlertOctagon className="w-7 h-7 shrink-0 animate-pulse" />
          <div>
            <h3 className="font-bold text-lg text-white">Data Conflict Detected</h3>
            <p className="text-xs text-slate-400">
              Changes for <span className="font-semibold text-purple-400">{activeConflict.entityType}</span> conflict with server updates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold mb-2">
              <HardDrive className="w-4 h-4" />
              <span>Your Offline Edit</span>
            </div>
            <pre className="text-[10px] text-slate-300 overflow-x-auto max-h-32 p-2 bg-slate-950/60 rounded-lg font-mono">
              {JSON.stringify(activeConflict.localPayload, null, 2)}
            </pre>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-2">
              <Server className="w-4 h-4" />
              <span>Server Version</span>
            </div>
            <pre className="text-[10px] text-slate-300 overflow-x-auto max-h-32 p-2 bg-slate-950/60 rounded-lg font-mono">
              {JSON.stringify(activeConflict.serverPayload || { note: "Latest remote state" }, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={() => handleResolve("KEEP_SERVER")}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
          >
            Discard Local & Keep Server
          </button>
          <button
            onClick={() => handleResolve("KEEP_LOCAL")}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Overwrite Server with Local
          </button>
        </div>
      </div>
    </div>
  );
}
