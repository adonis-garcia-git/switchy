import Link from "next/link";

interface BuildAdvisorCTAProps {
  brand: string;
  name: string;
  productType: string;
  className?: string;
}

export function BuildAdvisorCTA({ brand, name, productType, className }: BuildAdvisorCTAProps) {
  const query = encodeURIComponent(`Tell me about the ${brand} ${name} ${productType}`);

  return (
    <section className={className}>
      <Link
        href={`/builder?q=${query}`}
        className="group block rounded-2xl border border-border-accent/30 bg-gradient-to-br from-accent-dim/20 via-bg-surface to-accent-dim/10 p-6 sm:p-8 hover:border-border-accent/60 transition-[border-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        <div className="flex items-start gap-4">
          {/* Sparkle icon */}
          <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent/15 transition-colors duration-200">
            <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-[family-name:var(--font-outfit)] font-semibold text-text-primary tracking-tight mb-1">
              Need help deciding?
            </p>
            <p className="text-sm text-text-secondary">
              Ask our AI Build Advisor about the{" "}
              <span className="text-accent font-medium">{brand} {name}</span>{" "}
              and get personalized recommendations.
            </p>
          </div>

          <svg
            className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-[color,transform] duration-200 shrink-0 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </Link>
    </section>
  );
}
