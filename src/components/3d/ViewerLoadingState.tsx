export function ViewerLoadingState({ height = "300px" }: { height?: string }) {
  return (
    <div
      className="rounded-xl border border-border-default bg-bg-elevated/50 flex items-center justify-center overflow-hidden"
      style={{ height }}
    >
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 relative">
          <div className="absolute inset-0 rounded-lg border border-accent/20 bg-accent/5 animate-pulse" />
          <svg
            className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25"
            />
          </svg>
        </div>
        <p className="text-sm text-text-secondary font-medium">Loading 3D viewer...</p>
        <p className="text-xs text-text-muted mt-1">Preparing interactive model</p>
      </div>
    </div>
  );
}
