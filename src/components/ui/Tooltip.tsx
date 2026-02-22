"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
}

const SIDE_CLASSES = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW_CLASSES = {
  top: "absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-bg-floating",
  bottom: "absolute bottom-full left-1/2 -translate-x-1/2 -mb-px border-4 border-transparent border-b-bg-floating",
  left: "absolute left-full top-1/2 -translate-y-1/2 -ml-px border-4 border-transparent border-l-bg-floating",
  right: "absolute right-full top-1/2 -translate-y-1/2 -mr-px border-4 border-transparent border-r-bg-floating",
};

export function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <span className="relative inline-block" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
      {show && (
        <span className={cn(
          "absolute z-50 px-3 py-2 text-xs text-text-primary bg-bg-floating border border-border-default rounded-lg shadow-floating max-w-xs whitespace-nowrap",
          SIDE_CLASSES[side],
          className
        )}>
          {content}
          <span className={ARROW_CLASSES[side]} />
        </span>
      )}
    </span>
  );
}
