"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type DevRole = "PASTOR" | "ADMIN" | "MEMBER";

const PORTALS: {
  role: DevRole;
  label: string;
  sublabel: string;
  path: string;
  emoji: string;
  gradient: string;
  glow: string;
  dot: string;
}[] = [
  {
    role: "PASTOR",
    label: "Pastor Portal",
    sublabel: "/pastor",
    path: "/pastor",
    emoji: "✝",
    gradient: "linear-gradient(135deg, #7c3aed, #a855f7)",
    glow: "rgba(124, 58, 237, 0.4)",
    dot: "#a855f7",
  },
  {
    role: "ADMIN",
    label: "Admin Portal",
    sublabel: "/admin",
    path: "/admin",
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #e11d48, #f43f5e)",
    glow: "rgba(225, 29, 72, 0.4)",
    dot: "#f43f5e",
  },
  {
    role: "MEMBER",
    label: "Member Portal",
    sublabel: "/dashboard",
    path: "/dashboard",
    emoji: "◉",
    gradient: "linear-gradient(135deg, #0284c7, #06b6d4)",
    glow: "rgba(2, 132, 199, 0.4)",
    dot: "#06b6d4",
  },
];

const ROLE_CONFIG: Record<DevRole, { color: string; short: string }> = {
  PASTOR: { color: "#a855f7", short: "PAS" },
  ADMIN:  { color: "#f43f5e", short: "ADM" },
  MEMBER: { color: "#06b6d4", short: "MEM" },
};

// Beautiful inline SVG icon — glowing cross with gradient + sparkles
const KCMDevIcon = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f0eeff" />
        <stop offset="100%" stopColor="#e0d9ff" />
      </radialGradient>
      <linearGradient id="cross" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
      </radialGradient>
      <filter id="blur">
        <feGaussianBlur stdDeviation="3" />
      </filter>
    </defs>
    {/* Background */}
    <rect width="100" height="100" rx="22" fill="url(#bg)" />
    {/* Glow halo */}
    <ellipse cx="50" cy="50" rx="32" ry="32" fill="url(#glow)" filter="url(#blur)" />
    {/* Cross — vertical bar */}
    <rect x="43" y="22" width="14" height="56" rx="4" fill="url(#cross)" />
    {/* Cross — horizontal bar */}
    <rect x="22" y="38" width="56" height="14" rx="4" fill="url(#cross)" />
    {/* Gold star top-right */}
    <text x="72" y="26" fontSize="10" fill="#f59e0b">✦</text>
    {/* Gold star bottom-left */}
    <text x="14" y="80" fontSize="7" fill="#f59e0b" opacity="0.7">✦</text>
    {/* Purple sparkle */}
    <text x="68" y="78" fontSize="7" fill="#a78bfa" opacity="0.8">·</text>
    <circle cx="27" cy="30" r="2" fill="#c4b5fd" opacity="0.6" />
  </svg>
);


export default function DevToolbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<DevRole>("PASTOR");
  const [switching, setSwitching] = useState<DevRole | null>(null);
  const [hoveredRole, setHoveredRole] = useState<DevRole | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("__dev_role__") as DevRole | null;
    const envRole = (
      process.env.NEXT_PUBLIC_DEV_AUTO_LOGIN || ""
    ).toUpperCase() as DevRole;
    if (stored && ["PASTOR", "ADMIN", "MEMBER"].includes(stored)) {
      setActiveRole(stored);
    } else if (envRole && ["PASTOR", "ADMIN", "MEMBER"].includes(envRole)) {
      localStorage.setItem("__dev_role__", envRole);
      setActiveRole(envRole);
    }
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  const switchRole = (role: DevRole, path: string) => {
    setSwitching(role);
    localStorage.setItem("__dev_role__", role);
    setActiveRole(role);
    setTimeout(() => {
      setSwitching(null);
      setIsOpen(false);
      window.location.href = path;
    }, 350);
  };

  const cfg = ROLE_CONFIG[activeRole];

  return (
    <>
      <style>{`
        @keyframes devSpin { to { transform: rotate(360deg); } }
        @keyframes devFadeUp {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        @keyframes devPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${cfg.color}55; }
          50%       { box-shadow: 0 0 0 6px transparent; }
        }
        .dev-portal-btn:hover .dev-portal-arrow { transform: translateX(3px); }
        .dev-portal-arrow { transition: transform 0.2s ease; display: inline-block; }
      `}</style>

      <div style={{ position: "fixed", bottom: 28, right: 28, zIndex: 99999, userSelect: "none" }}>

        {/* ── Expanded Panel ───────────────────────────────────────── */}
        {isOpen && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 14px)",
              right: 0,
              width: 256,
              animation: "devFadeUp 0.22s cubic-bezier(0.34,1.56,0.64,1) both",
              background: "rgba(9, 9, 18, 0.97)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 20,
              padding: "6px",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "12px 14px 10px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                marginBottom: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                      flexShrink: 0,
                    }}
                  >
                    <KCMDevIcon size={30} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: "0.04em" }}>
                      Dev Shortcuts
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", marginTop: 1 }}>
                      NODE_ENV=development
                    </div>
                  </div>
                </div>
                {/* Active Role Pill */}
                <div
                  style={{
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: `${cfg.color}20`,
                    border: `1px solid ${cfg.color}40`,
                    fontSize: 9,
                    fontWeight: 800,
                    color: cfg.color,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {cfg.short}
                </div>
              </div>
            </div>

            {/* Portal Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 3, padding: "4px 2px 2px" }}>
              {PORTALS.map((p) => {
                const isActive = activeRole === p.role;
                const isLoading = switching === p.role;
                const isHovered = hoveredRole === p.role;

                return (
                  <button
                    key={p.role}
                    className="dev-portal-btn"
                    onClick={() => switchRole(p.role, p.path)}
                    disabled={!!switching}
                    onMouseEnter={() => setHoveredRole(p.role)}
                    onMouseLeave={() => setHoveredRole(null)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 13,
                      border: isActive
                        ? `1px solid ${p.dot}35`
                        : "1px solid transparent",
                      background: isActive
                        ? `${p.dot}12`
                        : isHovered
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                      cursor: switching ? "not-allowed" : "pointer",
                      transition: "all 0.18s ease",
                      opacity: switching && !isLoading ? 0.35 : 1,
                      position: "relative",
                      overflow: "hidden",
                      outline: "none",
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: isActive || isHovered ? p.gradient : "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 900,
                        color: "#fff",
                        flexShrink: 0,
                        transition: "all 0.18s ease",
                        boxShadow: isActive ? `0 4px 14px ${p.glow}` : "none",
                      }}
                    >
                      {isLoading ? (
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            border: "2px solid rgba(255,255,255,0.2)",
                            borderTop: "2px solid #fff",
                            borderRadius: "50%",
                            animation: "devSpin 0.5s linear infinite",
                          }}
                        />
                      ) : (
                        p.emoji
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                          lineHeight: 1.3,
                          transition: "color 0.15s",
                        }}
                      >
                        {p.label}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: isActive ? p.dot : "rgba(255,255,255,0.25)",
                          fontFamily: "monospace",
                          marginTop: 1,
                          transition: "color 0.15s",
                        }}
                      >
                        {p.sublabel}
                      </div>
                    </div>

                    {/* Right indicator */}
                    {isActive ? (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: p.dot,
                          boxShadow: `0 0 8px ${p.dot}`,
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <span
                        className="dev-portal-arrow"
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.2)",
                          flexShrink: 0,
                        }}
                      >
                        →
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                margin: "6px 4px 2px",
                padding: "8px 10px",
                borderRadius: 10,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e", flexShrink: 0 }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "monospace" }}>
                Stored in localStorage · dev only
              </span>
            </div>
          </div>
        )}

        {/* ── Floating Toggle Button ──────────────────────────────── */}
        <button
          onClick={() => setIsOpen((o) => !o)}
          title="Dev Shortcuts"
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: isOpen
              ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
              : "#ffffff",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isOpen
              ? "1px solid rgba(139,92,246,0.5)"
              : "1px solid rgba(0,0,0,0.08)",
            boxShadow: isOpen
              ? "0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(139,92,246,0.3)"
              : "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            transform: isOpen ? "rotate(45deg) scale(1.05)" : "rotate(0) scale(1)",
            position: "relative",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!isOpen) {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 8px 28px rgba(0,0,0,0.16), 0 2px 6px rgba(0,0,0,0.08)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = isOpen
              ? "rotate(45deg) scale(1.05)"
              : "rotate(0) scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = isOpen
              ? "0 8px 32px rgba(99,102,241,0.5), 0 0 0 1px rgba(139,92,246,0.3)"
              : "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)";
          }}
        >
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ display: "block" }}>
              <path d="M2 2L14 14M14 2L2 14" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 10, overflow: "hidden" }}>
              <KCMDevIcon size={38} />
            </div>
          )}
        </button>

        {/* Role Badge */}
        {!isOpen && (
          <div
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              height: 18,
              minWidth: 18,
              padding: "0 5px",
              borderRadius: 6,
              background: cfg.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "0.06em",
              border: "2px solid #ffffff",
              pointerEvents: "none",
              boxShadow: `0 2px 8px ${cfg.color}80`,
              animation: "devPulse 2.5s ease infinite",
            }}
          >
            {cfg.short}
          </div>
        )}
      </div>
    </>
  );
}
