"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Types ─────────────────────────────────────────────────────

export type LoadingStage =
  | "init"
  | "fetching"
  | "generating"
  | "rendering"
  | "ready"
  | "done"
  | "error";

interface LoadingScreenProps {
  stage: LoadingStage;
  progress: number;
  error: string | null;
  accentColor: string;
  onRetry: () => void;
  onFadeComplete: () => void;
}

// ─── Constants ─────────────────────────────────────────────────

const TIPS = [
  "Click any building to see that dev's profile",
  "Use Fly Mode to cruise above the skyline",
  "Taller buildings = more submissions",
  "Try searching for your LeetCode username",
  "Buildings glow brighter with more recent activity",
  "You can customize your building in the shop",
  "Explore Mode shows the full city layout",
];

// Pixel-art skyline building configs: [width, height, left%]
const SKYLINE_BUILDINGS: [number, number, number][] = [
  [28, 40, 2],
  [20, 65, 8],
  [32, 85, 14],
  [18, 50, 22],
  [24, 70, 28],
  [36, 110, 35],
  [22, 55, 44],
  [26, 75, 50],
  [30, 95, 58],
  [20, 45, 66],
  [34, 80, 72],
  [24, 60, 80],
  [28, 90, 87],
];

// ─── Component ─────────────────────────────────────────────────

export default function LoadingScreen({
  stage,
  progress,
  error,
  accentColor,
  onRetry,
  onFadeComplete,
}: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Rotate tips every 4s
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Trigger fade-out when stage becomes "ready"
  useEffect(() => {
    if (stage === "ready") {
      setFading(true);
    }
  }, [stage]);

  // Scroll terminal to bottom when new lines appear
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [stage]);

  const handleTransitionEnd = useCallback(() => {
    if (fading) {
      onFadeComplete();
    }
  }, [fading, onFadeComplete]);

  // Calculate terminal lines dynamically based on stage
  const getTerminalLines = () => {
    const lines: string[] = [
      "$ git clone git@leetcode.city:world/bengaluru.git",
      "Cloning into 'bengaluru'..."
    ];

    if (stage === "init") {
      return lines;
    }

    lines.push("remote: Querying LeetCode developers: 100% (4,561/4,561), done.");
    if (stage === "fetching") {
      return lines;
    }

    lines.push("Receiving objects: 100% (8,429/8,429), 1.12 MiB | done.");
    lines.push("Resolving streets: 100% (231/231), done.");
    if (stage === "generating") {
      return lines;
    }

    lines.push("Checking out the skyline... done.");
    lines.push("$ cd bengaluru && npm run city");
    if (stage === "rendering") {
      return lines;
    }

    lines.push("Starting LeetCode City webserver...");
    lines.push("Ready!");
    return lines;
  };

  const lines = stage === "error" ? [
    "$ git clone git@leetcode.city:world/bengaluru.git",
    "Cloning into 'bengaluru'...",
    `error: Failed to load city data: ${error || "Unknown Error"}`
  ] : getTerminalLines();

  const isError = stage === "error";

  // Build character-based progress bar
  const blockCount = Math.floor(progress / 5);
  const emptyCount = 20 - blockCount;
  const progressStr = `[${"█".repeat(blockCount)}${"░".repeat(Math.max(0, emptyCount))}] ${Math.min(100, Math.floor(progress))}%`;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#070709] transition-opacity duration-[600ms] ${fading ? "opacity-0" : "opacity-100"
        }`}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* CRT scanlines effect overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,6px_100%] opacity-15" />

      {/* Skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-[140px] overflow-hidden opacity-10">
        {SKYLINE_BUILDINGS.map(([w, h, left], i) => (
          <div
            key={i}
            className="absolute bottom-0"
            style={{
              width: w,
              height: h,
              left: `${left}%`,
              backgroundColor: accentColor,
              clipPath:
                i % 3 === 0
                  ? "polygon(0 8px, 30% 8px, 30% 0, 70% 0, 70% 8px, 100% 8px, 100% 100%, 0 100%)"
                  : i % 3 === 1
                    ? "polygon(0 4px, 50% 4px, 50% 0, 100% 0, 100% 100%, 0 100%)"
                    : undefined,
            }}
          />
        ))}
      </div>

      {/* Retro CRT Terminal Window */}
      <div 
        className="w-[90%] max-w-2xl border-[3px] bg-[#0c0c0f]/90 p-4 font-mono text-xs shadow-2xl md:p-6 md:text-sm"
        style={{ borderColor: accentColor }}
      >
        {/* Terminal Header */}
        <div className="mb-4 flex items-center justify-between border-b pb-2" style={{ borderColor: `${accentColor}33` }}>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
          </div>
          <span className="font-pixel text-[10px]" style={{ color: accentColor }}>
            leetcode-city-terminal
          </span>
        </div>

        {/* Terminal logs list */}
        <div className="h-44 overflow-y-auto space-y-1.5 pr-2 select-none text-left">
          {lines.map((line, idx) => {
            const isCommand = line.startsWith("$");
            const isErr = line.startsWith("error:");
            return (
              <div 
                key={idx} 
                style={{ 
                  color: isErr ? "#ef4444" : isCommand ? accentColor : "#a3a3a3",
                  fontWeight: isCommand ? "bold" : "normal"
                }}
              >
                {line}
              </div>
            );
          })}

          {/* Typing/loading indicator cursor line */}
          {!isError && stage !== "ready" && (
            <div className="flex items-center gap-1" style={{ color: accentColor }}>
              <span>Loading...</span>
              <span className="h-4 w-2 animate-pulse bg-current" style={{ backgroundColor: accentColor }} />
            </div>
          )}

          <div ref={terminalEndRef} />
        </div>

        {/* Retro progress bar inside terminal */}
        {!isError && (
          <div className="mt-4 border-t pt-3" style={{ borderColor: `${accentColor}22` }}>
            <div className="font-mono text-[11px] md:text-xs" style={{ color: accentColor }}>
              {progressStr}
            </div>
          </div>
        )}
      </div>

      {/* Error retry */}
      {isError && (
        <button
          onClick={onRetry}
          className="btn-press mt-6 px-6 py-2 font-pixel text-xs text-[#0d0d0f]"
          style={{ backgroundColor: accentColor }}
        >
          Retry
        </button>
      )}

      {/* Tips rotator */}
      {!isError && (
        <p className="mt-6 max-w-xs text-center font-pixel text-[9px] leading-relaxed tracking-wide text-neutral-500 sm:text-xs">
          💡 Tip: {TIPS[tipIndex]}
        </p>
      )}
    </div>
  );
}

