interface ProductTileProps {
  imageUrl: string;
  name: string;
  brand: string;
}

export function ProductTile({ imageUrl, name, brand }: ProductTileProps) {
  return (
    <div className="w-40 sm:w-48 flex-shrink-0 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden pointer-events-none select-none [filter:saturate(0.7)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
        <img
          src={imageUrl}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-wider text-text-muted leading-none mb-1">
          {brand}
        </p>
        <p className="text-xs font-semibold text-text-primary font-[family-name:var(--font-outfit)] truncate leading-tight">
          {name}
        </p>
      </div>
    </div>
  );
}

export function ProductTileSkeleton() {
  return (
    <div className="w-40 sm:w-48 flex-shrink-0 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden pointer-events-none select-none">
      <div className="aspect-[4/3] bg-bg-elevated animate-pulse" />
      <div className="px-3 py-2.5 space-y-1.5">
        <div className="h-2 w-12 bg-bg-elevated/80 rounded animate-pulse" />
        <div className="h-3 w-24 bg-bg-elevated/80 rounded animate-pulse" />
      </div>
    </div>
  );
}
