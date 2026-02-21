"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
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
          "absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs text-text-primary bg-bg-elevated border border-border-default rounded-lg shadow-lg max-w-xs whitespace-normal",
          className
        )}>
          {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-bg-elevated" />
        </span>
      )}
    </span>
  );
}
