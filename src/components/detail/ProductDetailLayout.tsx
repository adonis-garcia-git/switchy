import { type ReactNode } from "react";

interface ProductDetailLayoutProps {
  /** Breadcrumb navigation (rendered above the grid) */
  breadcrumb: ReactNode;
  /** Primary product content — hero, specs, features, notes */
  children: ReactNode;
  /** Cross-sell sidebar — CompleteYourBuild, BuildAdvisorCTA, VendorPartnerSection */
  sidebar: ReactNode;
  /** Full-width bottom section — SimilarProducts carousel */
  bottomSection?: ReactNode;
}

/**
 * Shared 2-column layout for all product detail pages.
 *
 * - xl+: left fluid content + right 380–420px sticky sidebar, full-width bottom
 * - <xl: single column — main → bottom → sidebar (via CSS order)
 */
export function ProductDetailLayout({
  breadcrumb,
  children,
  sidebar,
  bottomSection,
}: ProductDetailLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {breadcrumb}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] 2xl:grid-cols-[1fr_420px] gap-8 xl:gap-10">
          {/* Main content — always first visually */}
          <div className="min-w-0 order-1">{children}</div>

          {/* Sidebar — appears after bottom on mobile, beside main on xl+ */}
          <aside className="order-3 xl:order-2">
            <div className="xl:sticky xl:top-24 space-y-6">{sidebar}</div>
          </aside>

          {/* Bottom section (carousel) — between main and sidebar on mobile, full-width row on xl+ */}
          {bottomSection && (
            <div className="order-2 xl:order-3 xl:col-span-2">
              {bottomSection}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
