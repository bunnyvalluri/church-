import React from "react";

interface IndiaFlagProps {
  className?: string;
  size?: number | string;
}

export function IndiaFlag({ className = "w-4 h-4", size }: IndiaFlagProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`inline-block shrink-0 rounded-full overflow-hidden shadow-sm align-middle ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="India flag"
      role="img"
    >
      <defs>
        <clipPath id="india-flag-circle-mask">
          <circle cx="256" cy="256" r="256" />
        </clipPath>
      </defs>
      <g clipPath="url(#india-flag-circle-mask)">
        {/* Top Saffron Stripe */}
        <rect x="0" y="0" width="512" height="170.67" fill="#FF9933" />
        {/* Middle White Stripe */}
        <rect x="0" y="170.67" width="512" height="170.67" fill="#FFFFFF" />
        {/* Bottom Green Stripe */}
        <rect x="0" y="341.33" width="512" height="170.67" fill="#138808" />

        {/* Ashoka Chakra */}
        <g transform="translate(256, 256)">
          {/* Outer ring */}
          <circle cx="0" cy="0" r="44" fill="none" stroke="#000080" strokeWidth="5.5" />
          {/* Inner ring */}
          <circle cx="0" cy="0" r="14" fill="none" stroke="#000080" strokeWidth="2.5" />
          {/* Center hub */}
          <circle cx="0" cy="0" r="7.5" fill="#000080" />
          {/* 24 Spokes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            return (
              <line
                key={i}
                x1="0"
                y1="0"
                x2="0"
                y2="-44"
                stroke="#000080"
                strokeWidth="3.2"
                transform={`rotate(${angle})`}
              />
            );
          })}
        </g>
      </g>
    </svg>
  );
}

export default IndiaFlag;
