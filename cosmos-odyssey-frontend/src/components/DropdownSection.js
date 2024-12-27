import React from 'react';

function DropdownSection({ origins, destinations, selectedOrigin, setSelectedOrigin, selectedDestination, setSelectedDestination }) {
  return (
    <div className="initial-dropdowns">
      <select
        value={selectedOrigin}
        onChange={(e) => setSelectedOrigin(e.target.value)}
        className="filter-dropdown"
      >
        <option value="">Select Origin</option>
        {origins.map((origin, index) => (
          <option key={index} value={origin}>
            {origin}
          </option>
        ))}
      </select>

      <select
        value={selectedDestination}
        onChange={(e) => setSelectedDestination(e.target.value)}
        className="filter-dropdown"
      >
        <option value="">Select Destination</option>
        {destinations.map((destination, index) => (
          <option key={index} value={destination}>
            {destination}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DropdownSection;
