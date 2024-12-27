import React from 'react';

function FilterAndSort({ companies, companyFilter, handleCompanyFilterChange, handleSort, sortCriteria }) {
  return (
    <div className="filter-container">
      <div className="filter-dropdown-container">
        <select
          value={companyFilter}
          onChange={(e) => handleCompanyFilterChange(e.target.value)}
          className="filter-dropdown"
        >
          <option value="">All Companies</option>
          {companies.map((company, index) => (
            <option key={index} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>

      <div className="sort-container">
        {['price', 'distance', 'travelTime'].map((key) => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`sort-button ${
              sortCriteria.some((c) => c.key === key) ? 'active' : ''
            }`}
          >
            Sort by {key.charAt(0).toUpperCase() + key.slice(1)}{' '}
            {sortCriteria.find((c) => c.key === key)?.order === 'asc'
              ? 'Low → High'
              : sortCriteria.find((c) => c.key === key)?.order === 'desc'
              ? 'High → Low'
              : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export default FilterAndSort;
