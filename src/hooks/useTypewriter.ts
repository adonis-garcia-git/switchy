"use client";

import { useState, useEffect, useRef } from "react";

interface UseTypewriterOptions {
  strings: string[];
  typeSpeed?: number;
  pauseBetween?: number;
  enabled?: boolean;
}

export function useTypewriter({
  strings,
  typeSpeed = 40,
  pauseBetween = 2500,
  enabled = true,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const phaseRef = useRef<"typing" | "pausing" | "clearing">("typing");

  useEffect(() => {
    if (!enabled || strings.length === 0) {
      setDisplayText("");
      return;
    }

    let timeout: NodeJS.Timeout;

    const tick = () => {
      const currentString = strings[indexRef.current % strings.length];

      if (phaseRef.current === "typing") {
        if (charRef.current < currentString.length) {
          charRef.current++;
          setDisplayText(currentString.slice(0, charRef.current));
          timeout = setTimeout(tick, typeSpeed);
        } else {
          phaseRef.current = "pausing";
          timeout = setTimeout(tick, pauseBetween);
        }
      } else if (phaseRef.current === "pausing") {
        phaseRef.current = "clearing";
        setDisplayText("");
        timeout = setTimeout(tick, 200);
      } else if (phaseRef.current === "clearing") {
        indexRef.current = (indexRef.current + 1) % strings.length;
        charRef.current = 0;
        phaseRef.current = "typing";
        tick();
      }
    };

    tick();
    return () => clearTimeout(timeout);
  }, [strings, typeSpeed, pauseBetween, enabled]);

  // Blinking cursor
  useEffect(() => {
    if (!enabled) { setShowCursor(false); return; }
    const interval = setInterval(() => setShowCursor((p) => !p), 530);
    return () => clearInterval(interval);
  }, [enabled]);

  return { text: displayText, cursor: showCursor ? "|" : " " };
}
