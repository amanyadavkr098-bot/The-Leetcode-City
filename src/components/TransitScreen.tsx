"use client";

import React, { useState, useEffect, useMemo } from "react";
import { DISTRICT_NAMES } from "@/lib/github";

interface TransitScreenProps {
  active?: boolean;
  fromDistrict: string;
  toDistrict: string;
  accentColor?: string;
}

const DIALOGUES = [
  "No sharing of code! Only pair programming allowed.",
  "Adjusting mirror... the traffic today is massive!",
  "Want a shortcut? The highway has less lag.",
  "Chai? Filter coffee? Let's get moving!",
  "Platform 3... Express is departing shortly.",
  "Warning: High server load detected on backend district!",
  "Please stand clear of the closing doors.",
];

// ASCII art vehicles
const VEHICLE_ART: Record<string, string[]> = {
  bus: [
    "  ╔═══════════════════════╗  ",
    "  ║  ■ □ ■ □ ■ □ ■ □ ■  ║  ",
    "  ║  BUS TRANSIT SYSTEM   ║  ",
    "  ║  ■ □ ■ □ ■ □ ■ □ ■  ║  ",
    "  ╚══╤══════════════╤════╝  ",
    "    ═╧═            ═╧═      ",
  ],
  metro: [
    "  ╔═══╦═══════════════╦═══╗  ",
    "  ║ ▓ ║  METRO LINE   ║ ▓ ║  ",
    "  ║   ║ ■ ■ ■ ■ ■ ■  ║   ║  ",
    "  ╠═══╬═══════════════╬═══╣  ",
    "  ║▒▒▒║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║▒▒▒║  ",
    "  ╚═╤═╩═══════════════╩═╤═╝  ",
    "   ═╧═               ═╧═    ",
  ],
  rickshaw: [
    "      ╔══════╗      ",
    "     ╔╣ AUTO ╠╗     ",
    "    ╔╣╠══════╣║     ",
    "    ║║║ ◊  ◊ ║║     ",
    "    ╚╩╩══╤═══╩╝     ",
    "     ═╧═ └ ═╧═      ",
  ],
  express: [
    "  ╔════╦══════════════════╦════╗  ",
    "  ║ ▶▶ ║  EXPRESS TRAIN   ║ ◀◀ ║  ",
    "  ║    ║ ■ ■ ■ ■ ■ ■ ■ ■ ║    ║  ",
    "  ╠════╬══════════════════╬════╣  ",
    "  ║▒▒▒▒║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║▒▒▒▒║  ",
    "  ╚═╤══╩══════════════════╩══╤═╝  ",
    "   ═╧═                    ═╧═    ",
  ],
};

export default function TransitScreen({ active = true, fromDistrict, toDistrict, accentColor }: TransitScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dialogue, setDialogue] = useState("");
  const [dots, setDots] = useState("");

  const fromCity = useMemo(() => DISTRICT_NAMES[fromDistrict] ?? fromDistrict, [fromDistrict]);
  const toCity = useMemo(() => DISTRICT_NAMES[toDistrict] ?? toDistrict, [toDistrict]);

  const transitMode = useMemo(() => {
    if (toDistrict === "backend" || fromDistrict === "backend") return "rickshaw";
    if (toDistrict === "fullstack" || fromDistrict === "fullstack" || toDistrict === "devops") return "metro";
    if (toDistrict === "downtown" && fromDistrict === "frontend") return "express";
    return "bus";
  }, [fromDistrict, toDistrict]);

  const accent = accentColor || "#ffa116";

  // Increment progress bar over 5 seconds
  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    const randIdx = Math.floor(Math.random() * DIALOGUES.length);
    setDialogue(DIALOGUES[randIdx]);

    return () => clearInterval(interval);
  }, [active, transitMode]);

  // Animated dots
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const barWidth = 36;
  const filledBlocks = Math.floor((progress / 100) * barWidth);
  const emptyBlocks = barWidth - filledBlocks;
  const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  const vehicleArt = VEHICLE_ART[transitMode] || VEHICLE_ART.bus;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: "#0d0d0f", fontFamily: "monospace" }}
    >
      {/* CRT Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.2) 50%)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Outer Retro Screen Frame */}
      <div
        className="relative flex w-[90%] max-w-2xl flex-col items-center justify-between p-8 md:w-[600px] h-[420px]"
        style={{
          border: `3px solid ${accent}`,
          backgroundColor: "#121318",
          boxShadow: `0 0 30px ${accent}22, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header Banner */}
        <div
          className="w-full text-center pb-4"
          style={{ borderBottom: `2px dashed ${accent}44` }}
        >
          <p
            className="text-[9px] tracking-[0.35em] uppercase mb-1"
            style={{ color: accent, opacity: 0.5 }}
          >
            TRANSIT
          </p>
          <h2
            className="text-lg font-bold tracking-[0.2em] uppercase sm:text-xl"
            style={{ color: accent }}
          >
            ═══ LEETCODE TRANSIT ═══
          </h2>
        </div>

        {/* ASCII Vehicle Art */}
        <div className="flex-1 w-full flex flex-col items-center justify-center py-4">
          <pre
            className="text-[8px] leading-[10px] sm:text-[10px] sm:leading-[12px] mb-4"
            style={{ color: accent, opacity: 0.7 }}
          >
            {vehicleArt.join("\n")}
          </pre>

          {/* Route Info */}
          <div className="text-center space-y-2">
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#e8dcc8", opacity: 0.8 }}>
              {fromCity.toUpperCase()}
              <span style={{ color: accent }}> ──▶ </span>
              {toCity.toUpperCase()}
            </p>
            <p
              className="text-[9px] tracking-wide italic max-w-xs"
              style={{ color: "#e8dcc8", opacity: 0.4 }}
            >
              &ldquo;{dialogue}&rdquo;
            </p>
          </div>
        </div>

        {/* Progress bar at bottom */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-[10px] tracking-[0.15em] uppercase" style={{ color: accent }}>
            <span>TRANSITING{dots}</span>
            <span>{progress}%</span>
          </div>
          <div
            className="text-[10px] sm:text-xs text-center"
            style={{ color: accent, letterSpacing: "1px" }}
          >
            [{progressBar}]
          </div>
          <p
            className="text-center text-[9px] tracking-[0.2em] uppercase pt-1"
            style={{ color: "#e8dcc8", opacity: 0.3 }}
          >
            ARRIVING AT {toCity.toUpperCase()}{dots}
          </p>
        </div>
      </div>
    </div>
  );
}
