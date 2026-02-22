  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const { view, setView, gridClassName, skeletonCount, isList } = useGridView();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const brands = useQuery(api.keyboards.getAllBrands, {}) ?? [];

  const keyboards = useQuery(api.keyboards.list, {
    size: filters.size || undefined,
    brand: filters.brand || undefined,
    hotSwapOnly: filters.hotSwapOnly || undefined,
    wirelessOnly: filters.wirelessOnly || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  });

  const searchResults = useQuery(
    api.keyboards.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displayKeyboards = searchQuery.trim() ? searchResults : keyboards;

  const sorted = displayKeyboards
    ? [...displayKeyboards].sort((a: any, b: any) => {
        if (filters.sortBy === "recommended") return 0;
        if (filters.sortBy === "price-low") return a.priceUsd - b.priceUsd;
        if (filters.sortBy === "price-high") return b.priceUsd - a.priceUsd;
        if (filters.sortBy === "brand") return a.brand.localeCompare(b.brand);
        return a.name.localeCompare(b.name);
      })
    : null;

  const promotedSponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "promoted_search",
    productType: "keyboard",
  });

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedKeyboards,
    resetPage,
    rangeStart,
    rangeEnd,
  } = usePagination(sorted);

  const mergedItems = usePromotedInsert(paginatedKeyboards, promotedSponsorships);

  const setFilters = useCallback((f: KeyboardFilterState) => { setFiltersRaw(f); resetPage(); }, [setFiltersRaw, resetPage]);

  return (