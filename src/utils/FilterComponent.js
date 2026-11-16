import React from "react";

// Search input for list filters. Disable browser autofill so selecting email
// suggestions elsewhere (e.g., add coach) doesn't leak into this field.
const FilterComponent = ({ onFilter, filterText, placeholder }) => (
  <>
    <input
      id="user-search-filter"
      type="search"
      name="userSearchFilter"
      className="valid"
      placeholder={placeholder}
      value={filterText || ""}
      onChange={onFilter}
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="none"
    />
  </>
);

export default FilterComponent;