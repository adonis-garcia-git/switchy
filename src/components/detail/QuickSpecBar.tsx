import { type ReactNode } from "react";

interface QuickSpec {
  icon: ReactNode;
  label: string;
  value: string;
}

interface QuickSpecBarProps {
  specs: QuickSpec[];
}

export function QuickSpecBar({ specs }: QuickSpecBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {specs.map((spec) => (
        <div
          key={spec.label}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-bg-elevated/60 border border-border-subtle backdrop-blur-sm"
        >
          <span className="text-accent shrink-0">{spec.icon}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-text-muted hidden sm:inline">
              {spec.label}
            </span>
            <span className="text-sm font-semibold font-[family-name:var(--font-mono)] text-text-primary">
              {spec.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
