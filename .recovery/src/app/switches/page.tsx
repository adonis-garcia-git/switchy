                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); resetPage(); }}
                placeholder="Search switches by name..."
                className="w-full bg-bg-surface border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-150 hover:border-border-default"
              />
            </div>
          </div>

          {/* Sponsored carousel */}
          <SponsoredCarousel productType="switch" />

          {/* Grid */}
          {mergedItems === null ? (
            <div className={gridClassName}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border-subtle bg-bg-surface p-4 animate-pulse"
                >
                  <div className="flex justify-between mb-3">
                    <div>
                      <div className="h-2.5 w-16 bg-bg-elevated rounded mb-2" />
                      <div className="h-4 w-32 bg-bg-elevated rounded" />
                    </div>
                    <div className="h-5 w-14 bg-bg-elevated rounded" />
                  </div>
                  <div className="h-px bg-border-subtle mb-3" />
                  <div className="h-3 w-24 bg-bg-elevated rounded mb-3" />
                  <div className="h-3 w-20 bg-bg-elevated rounded mb-3" />
                  <div className="flex gap-1">
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                    <div className="h-3 w-3 bg-bg-elevated rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : totalItems === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-muted text-sm">
                No switches match your filters.
              </p>
              <p className="text-text-muted/60 text-xs mt-1">
                Try adjusting your criteria.
              </p>
            </div>
          ) : (
            <>
              <div className={gridClassName}>
                {(() => {
                  let featuredShown = false;
                  return mergedItems!.map((item: any) => {
                    if (item.isPromoted) {
                      return (
                        <PromotedProductCard
                          key={item._id}
                          sponsorshipId={item._id.replace("promoted-", "")}
                          vendorName={item.vendorName}
                          productName={item.productName}
                          productUrl={item.productUrl}
                          imageUrl={item.imageUrl}
                          priceUsd={item.priceUsd}
                        />
                      );
                    }
                    const isFeatured = !featuredShown;
                    if (isFeatured) featuredShown = true;
                    return (
                      <SwitchCard
                        key={item._id}
                        sw={item}