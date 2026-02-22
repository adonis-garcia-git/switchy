  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { view, setView, gridClassName, skeletonCount, isList } = useGridView();

  const brands = useQuery(api.accessories.getAllBrands, {}) ?? [];

  const accessories = useQuery(api.accessories.list, {
    subcategory: filters.subcategory || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  });

  const searchResults = useQuery(
    api.accessories.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displayAccessories = searchQuery.trim() ? searchResults : accessories;

  const sorted = displayAccessories
    ? [...displayAccessories].sort((a: any, b: any) => {
        if (filters.sortBy === "recommended") return 0;
        const dir = filters.sortOrder === "asc" ? 1 : -1;
        if (filters.sortBy === "price") return (a.priceUsd - b.priceUsd) * dir;
        if (filters.sortBy === "brand") return a.brand.localeCompare(b.brand) * dir;
        return a.name.localeCompare(b.name) * dir;
      })
    : null;

  const promotedSponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "promoted_search",
    productType: "accessory",
  });

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedAccessories,
    resetPage,
    rangeStart,
    rangeEnd,
  } = usePagination(sorted);

  const mergedItems = usePromotedInsert(paginatedAccessories, promotedSponsorships);

  const setFilters = useCallback((f: AccessoryFilterState) => { setFiltersRaw(f); resetPage(); }, [setFiltersRaw, resetPage]);

  return (
    <div className="min-h-screen">
      <div className="flex">
        {/* Sidebar - desktop */}