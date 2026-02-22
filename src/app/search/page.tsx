export default function SearchPage() {
  return (
    <div className="min-h-screen px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-lg mx-auto text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-text-muted/10 border border-border-subtle flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-text-muted/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-text-primary font-[family-name:var(--font-outfit)] tracking-tight mb-3">
          Search Unavailable
        </h1>
        <p className="text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          This feature is powered by an external AI search API that&apos;s too
          expensive to leave running in demo mode. Sorry about that!
        </p>
        <p className="text-xs text-text-muted mt-4">
          Browse switches, keyboards, and keycaps directly from the nav instead.
        </p>
      </div>
    </div>
  );
}
