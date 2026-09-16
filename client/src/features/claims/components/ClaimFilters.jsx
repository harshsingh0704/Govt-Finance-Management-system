function ClaimFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}) {
  const hasFilters = search.trim() !== "" || status !== "all";

  return (
    <div className="claims-filters">
      <div className="claims-search">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="claims-search-icon"
        >
          <path
            d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by claim ID or journey..."
          aria-label="Search claims"
        />
      </div>

      <div className="claims-filter-control">
        <label htmlFor="claim-status-filter">Status</label>

        <select
          id="claim-status-filter"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {hasFilters && (
        <button
          type="button"
          className="claims-clear-filters"
          onClick={onClear}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default ClaimFilters;