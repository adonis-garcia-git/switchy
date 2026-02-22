import { ProductTile, ProductTileSkeleton } from "./ProductTile";

interface NormalizedProduct {
  id: string;
  imageUrl: string;
  name: string;
  brand: string;
}

interface ProductCarouselProps {
  products: NormalizedProduct[] | undefined;
  direction: "left" | "right";
}

export function ProductCarousel({ products, direction }: ProductCarouselProps) {
  const isLoading = !products;
  const animationClass =
    direction === "right"
      ? "search-carousel-right"
      : "search-carousel-left";

  return (
    <div
      className="overflow-hidden pointer-events-none [-webkit-mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      {isLoading ? (
        <div className="flex gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductTileSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className={`flex gap-4 w-max will-change-transform ${animationClass}`}>
          {products.map((p, i) => (
            <ProductTile key={`a-${p.id}-${i}`} imageUrl={p.imageUrl} name={p.name} brand={p.brand} />
          ))}
          {products.map((p, i) => (
            <ProductTile key={`b-${p.id}-${i}`} imageUrl={p.imageUrl} name={p.name} brand={p.brand} />
          ))}
        </div>
      )}
    </div>
  );
}
