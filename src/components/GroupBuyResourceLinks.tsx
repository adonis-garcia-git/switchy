"use client";

import { cn } from "@/lib/utils";

const RESOURCES = [
  {
    name: "mechgroupbuys.com",
    url: "https://mechgroupbuys.com",
    description: "Group buy tracker",
  },
  {
    name: "keycaplendar.com",
    url: "https://keycaplendar.com",
    description: "Keycap calendar",
  },
  {
    name: "r/mechmarket",
    url: "https://www.reddit.com/r/mechmarket",
    description: "Buy/sell/trade",
  },
  {
    name: "GeekHack",
    url: "https://geekhack.org/index.php?board=132.0",
    description: "IC & GB forum",
  },
];

export function GroupBuyResourceLinks() {
  return (
    <div className="border-t border-border-subtle pt-4 mt-2">
      <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2.5">
        Community Resources
      </h4>
      <div className="space-y-1.5">
        {RESOURCES.map((resource) => (
          <a
            key={resource.url}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center justify-between gap-2 px-2.5 py-2 rounded-md text-sm",
              "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
              "group/link"
            )}
          >
            <div className="min-w-0">
              <span className="text-xs font-medium block truncate">{resource.name}</span>
              <span className="text-[10px] text-text-muted">{resource.description}</span>
            </div>
            <svg
              className="w-3 h-3 text-text-muted/40 group-hover/link:text-text-muted shrink-0 transition-colors duration-150"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
