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
  "Want a shortcut? The highway through Pune has less lag.",
  "Chai? Filter coffee? Let's get moving!",
  "Platform 3... Rajdhani Express is departing shortly.",
  "Warning: High server load detected on backend district!",
  "Please stand clear of the closing doors.",
];

export default function TransitScreen({ active = true, fromDistrict, toDistrict, accentColor }: TransitScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dialogue, setDialogue] = useState("");
  
  const fromCity = useMemo(() => DISTRICT_NAMES[fromDistrict] ?? fromDistrict, [fromDistrict]);
  const toCity = useMemo(() => DISTRICT_NAMES[toDistrict] ?? toDistrict, [toDistrict]);

  // Determine transit mode based on destination
  const transitMode = useMemo(() => {
    if (toDistrict === "backend" || fromDistrict === "backend") return "rickshaw";
    if (toDistrict === "fullstack" || fromDistrict === "fullstack" || toDistrict === "devops") return "metro";
    if (toDistrict === "downtown" && fromDistrict === "frontend") return "express";
    return "bus";
  }, [fromDistrict, toDistrict]);

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

    // Pick random funny dialogue
    const randIdx = Math.floor(Math.random() * DIALOGUES.length);
    setDialogue(DIALOGUES[randIdx]);

    return () => clearInterval(interval);
  }, [active, transitMode]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0d0d0f] font-mono text-[#ffa116]">
      {/* CRT Scanline Scanline Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      
      {/* Outer Retro Screen Frame */}
      <div className="relative flex w-[90%] max-w-2xl flex-col items-center justify-between border-4 border-[#ffa116] bg-[#121318] p-8 shadow-[0_0_30px_rgba(255,161,22,0.15)] md:w-[600px] h-[400px]">
        {/* Header Marquee Banner */}
        <div className="w-full text-center border-b-2 border-dashed border-[#ffa116]/40 pb-4">
          <h2 className="text-xl font-bold tracking-widest uppercase animate-pulse">
            === LEETCODE TRANSIT SYSTEM ===
          </h2>
        </div>

        {/* Route map visual */}
        <div className="w-full pt-4">
          <div className="mb-1 flex items-center justify-between px-1 text-[10px] text-white/60">
            <span>{fromCity.toUpperCase()}</span>
            <span>{toCity.toUpperCase()}</span>
          </div>
          <div className="relative h-2 w-full border border-[#ffa116]/40 bg-black">
            <div
              className="absolute inset-y-0 left-0 origin-left bg-[#ffa116]/60"
              style={{ transform: `scaleX(${progress / 100})`, transition: "transform 0.1s linear" }}
            />
            <div
              className="absolute -top-1.5 -translate-x-1/2 text-sm"
              style={{ left: `${progress}%`, transition: "left 0.1s linear" }}
            >
              📍
            </div>
          </div>
        </div>

        {/* Immersive Graphics area depending on selected mode */}
        <div className="flex-1 w-full flex flex-col items-center justify-center py-6 text-center">
          {transitMode === "bus" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl animate-bounce">🚌</div>
              <div className="text-sm text-white/80 max-w-sm">
                Boarding <span className="text-[#ffa116] font-bold">BMTC RED BUS</span>
              </div>
              <div className="border border-[#ffa116]/30 px-3 py-1 bg-black/40 text-xs text-white/60">
                TICKET: {fromCity} &rarr; {toCity}
              </div>
            </div>
          )}

          {transitMode === "metro" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl animate-pulse">🚇</div>
              <div className="text-sm text-white/80 max-w-sm">
                Riding the <span className="text-[#ffa116] font-bold">Elevated Metro Line</span>
              </div>
              <div className="text-xs text-[#00ffcc] animate-pulse">
                &bull; Doors Closing... Next Station: {toCity} &bull;
              </div>
            </div>
          )}

          {transitMode === "rickshaw" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl animate-bounce" style={{ animationDuration: '0.4s' }}>🛺</div>
              <div className="text-sm text-white/80 max-w-sm">
                Cruising in a <span className="text-[#ffa116] font-bold">Tuk-Tuk Auto Rickshaw</span>
              </div>
              <div className="text-xs italic text-yellow-200/70 border-t border-b border-[#ffa116]/20 py-2 px-4 max-w-xs">
                &ldquo;{dialogue}&rdquo;
              </div>
            </div>
          )}

          {transitMode === "express" && (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl text-white">🚂</div>
              <div className="text-sm text-white/80 max-w-sm">
                Departing on <span className="text-[#ffa116] font-bold">Rajdhani Express</span>
              </div>
              <div className="text-xs text-red-400">
                PLATFORM 3 &bull; Chai Wallah ready
              </div>
            </div>
          )}
        </div>

        {/* Progress bar at bottom */}
        <div className="w-full space-y-2">
          <div className="flex justify-between text-xs tracking-wider">
            <span>TRANSITING FROM: {fromCity.toUpperCase()}</span>
            <span>{progress}%</span>
          </div>
          {/* Progress outer track */}
          <div className="w-full h-6 border-2 border-[#ffa116] p-0.5 bg-black overflow-hidden">
            <div
              className="h-full origin-left bg-[#ffa116] shadow-[0_0_10px_#ffa116]"
              style={{ transform: `scaleX(${progress / 100})`, transition: "transform 0.1s linear" }}
            />
          </div>
          <div className="text-center text-[10px] text-white/40 tracking-widest pt-2">
            ARRIVING AT {toCity.toUpperCase()}... PLEASE HOLD ON
          </div>
        </div>
      </div>
    </div>
  );
}
