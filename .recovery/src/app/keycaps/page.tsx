  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { view, setView, gridClassName, skeletonCount, isList } = useGridView();

  const brands = useQuery(api.keycaps.getAllBrands, {}) ?? [];

  const keycaps = useQuery(api.keycaps.list, {
    profile: filters.profile || undefined,
    material: filters.material || undefined,
    brand: filters.brand || undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
  });

  const searchResults = useQuery(
    api.keycaps.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  const displayKeycaps = searchQuery.trim() ? searchResults : keycaps;

  const sorted = displayKeycaps
    ? [...displayKeycaps].sort((a: any, b: any) => {
        if (filters.sortBy === "recommended") return 0;
        const dir = filters.sortOrder === "asc" ? 1 : -1;
        if (filters.sortBy === "price") return (a.priceUsd - b.priceUsd) * dir;
        if (filters.sortBy === "brand") return a.brand.localeCompare(b.brand) * dir;
        return a.name.localeCompare(b.name) * dir;
      })
    : null;

  const promotedSponsorships = useQuery(api.sponsorships.getActiveByType, {
    placement: "promoted_search",
    productType: "keycaps",
  });

  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems: paginatedKeycaps,
    resetPage,
    rangeStart,
    rangeEnd,
  } = usePagination(sorted);

  const mergedItems = usePromotedInsert(paginatedKeycaps, promotedSponsorships);

  const setFilters = useCallback((f: KeycapFilterState) => { setFiltersRaw(f); resetPage(); }, [setFiltersRaw, resetPage]);

  return (
    <div className="min-h-screen">
      <div className="flex">