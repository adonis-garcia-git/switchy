
export function SwitchCard({
  sw,
  compareMode,
  isSelected,
  onCompareToggle,
  sponsored,
}: SwitchCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border bg-bg-surface p-4 group",
        "transition-[border-color,box-shadow] duration-200",
        "hover:border-border-accent hover:glow-accent",
        isSelected
          ? "border-accent glow-accent-strong"
          : "border-border-subtle"
      )}
    >
      {/* Sponsored badge */}
      {sponsored && (
        <div className="absolute top-3 left-3 z-10">
          <SponsoredBadge />
        </div>
      )}

      {/* Compare selection overlay */}
      {compareMode && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCompareToggle?.(sw._id);
            }}
            className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            aria-label={isSelected ? `Deselect ${sw.name}` : `Select ${sw.name} for comparison`}
          />
          <div
            className={cn(
              "absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none",
              "border-2 transition-[background-color,border-color,transform] duration-200",
              isSelected
                ? "bg-accent border-accent scale-100"
                : "border-text-muted/40 bg-bg-primary/70 backdrop-blur-sm scale-90"
            )}
          >
            {isSelected ? (
              <svg
                className="w-4 h-4 text-bg-primary"