import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import '../index.css';

function ReservationForm() {
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    totalPrice: 0,
    travelTime: 0,
  });

  const [selectedOrigin, setSelectedOrigin] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [autoScroll, setAutoScroll] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('');

  // One sorting criterion at a time, but cycles through asc->desc->off
  const [sortCriteria, setSortCriteria] = useState([]);

  const scrollContainerRef = useRef(null);

  // Drag scrolling variables
  const [mouseDown, setMouseDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);

  const [didMove, setDidMove] = useState(false);
  const [mouseDownProvider, setMouseDownProvider] = useState(null);
  const [mouseDownLeg, setMouseDownLeg] = useState(null);

  const [scrollDirectionDown, setScrollDirectionDown] = useState(true);

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/pricelists')
      .then((response) => {
        const legs = response.data.legs.map((leg) => ({
          ...leg,
          providers: leg.providers.map((provider) => ({
            ...provider,
            travelTime: calculateTravelTime(provider),
          })),
        }));

        setRoutes(legs);
        setFilteredRoutes(legs);

        const uniqueOrigins = [...new Set(legs.map((leg) => leg.routeInfo.from.name))];
        const uniqueDestinations = [...new Set(legs.map((leg) => leg.routeInfo.to.name))];
        setOrigins(uniqueOrigins);
        setDestinations(uniqueDestinations);
      })
      .catch((err) => console.error('Error fetching routes:', err));
  }, []);

  useEffect(() => {
    let interval;
    if (autoScroll && scrollContainerRef.current) {
      interval = setInterval(() => {
        const container = scrollContainerRef.current;
        if (container) {
          if (scrollDirectionDown) {
            if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
              setScrollDirectionDown(false);
            } else {
              container.scrollTop += 2;
            }
          } else {
            if (container.scrollTop <= 0) {
              setScrollDirectionDown(true);
            } else {
              container.scrollTop -= 2;
            }
          }
        }
      }, 20);
    }
    return () => clearInterval(interval);
  }, [autoScroll, scrollDirectionDown]);

  const handleMouseDown = (e) => {
    setMouseDown(true);
    setDidMove(false);
    setIsDragging(false);
    setStartY(e.clientY);

    const container = scrollContainerRef.current;
    if (container) {
      setScrollTop(container.scrollTop);
      container.style.cursor = 'grabbing';
    }

    const cardDiv = e.target.closest('.card');
    if (cardDiv && filteredRoutes) {
      const cardId = cardDiv.getAttribute('data-id');
      let foundProvider = null;
      let foundLeg = null;
      for (let leg of filteredRoutes) {
        for (let provider of leg.providers) {
          if (provider.id === cardId) {
            foundProvider = provider;
            foundLeg = leg;
            break;
          }
        }
        if (foundProvider) break;
      }
      setMouseDownProvider(foundProvider);
      setMouseDownLeg(foundLeg);
    } else {
      setMouseDownProvider(null);
      setMouseDownLeg(null);
    }
  };

  const handleMouseUp = () => {
    setMouseDown(false);
    const container = scrollContainerRef.current;
    if (container) {
      container.style.cursor = 'grab';
    }

    if (!didMove && mouseDownProvider && mouseDownLeg) {
      handleSelect(mouseDownProvider, mouseDownLeg);
    }

    setMouseDownProvider(null);
    setMouseDownLeg(null);
    setIsDragging(false);
    setStartY(null);
  };

  const handleMouseMove = (e) => {
    if (!mouseDown || startY === null) return;

    const diff = Math.abs(e.clientY - startY);
    if (diff > 5 && !didMove) {
      setDidMove(true);
      setIsDragging(true);
    }

    if (!isDragging) return;
    e.preventDefault();
    const y = e.clientY;
    const walk = (y - startY) * 2;
    scrollContainerRef.current.scrollTop = scrollTop - walk;
  };

  const handleSelect = (provider, leg) => {
    setSelectedRoute({ provider, leg });
    setFormData({
      ...formData,
      totalPrice: provider.price,
      travelTime: provider.travelTime,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      alert('Please select a flight!');
      return;
    }

    const requestData = {
      ...formData,
      routeId: selectedRoute.provider.id,
    };

    axios
      .post('http://127.0.0.1:8000/api/reservations', requestData)
      .then(() => alert('Reservation made successfully!'))
      .catch((err) =>
        alert(`Failed to make reservation: ${err.response?.data || err.message}`)
      );
  };

  function calculateTravelTime(provider) {
    if (!provider) return 0;
    const start = new Date(provider.flightStart);
    const end = new Date(provider.flightEnd);
    return Math.round((end - start) / (1000 * 60 * 60));
  }

  // compareByKey: price/travelTime at provider level, distance at leg level
  function compareByKey(a, b, key, isProviderLevel = true) {
    if (key === 'price') {
      if (!isProviderLevel) return 0;
      return a.price - b.price;
    } else if (key === 'travelTime') {
      if (!isProviderLevel) return 0;
      return a.travelTime - b.travelTime;
    } else if (key === 'distance') {
      if (isProviderLevel) return 0; 
      return a.routeInfo.distance - b.routeInfo.distance;
    }
    return 0;
  }

  const applyFiltersAndSorting = useCallback((origin, destination, company, allRoutes) => {
    if (!origin || !destination) {
      setFilteredRoutes([]);
      return;
    }

    let filtered = allRoutes.filter(
      (leg) =>
        leg.routeInfo.from.name === origin &&
        leg.routeInfo.to.name === destination
    );

    if (company) {
      filtered = filtered
        .map((leg) => ({
          ...leg,
          providers: leg.providers.filter((provider) => provider.company.name === company),
        }))
        .filter((leg) => leg.providers.length > 0);
    }

    if (sortCriteria.length > 0) {
      const { key, order } = sortCriteria[0];
      if (key === 'distance') {
        // sort legs by distance
        filtered.sort((a, b) => {
          const comparison = compareByKey(a, b, 'distance', false);
          return order === 'asc' ? comparison : -comparison;
        });
      } else {
        // price or travelTime: sort providers
        filtered.forEach((leg) => {
          leg.providers.sort((a, b) => {
            const comparison = compareByKey(a, b, key, true);
            return order === 'asc' ? comparison : -comparison;
          });
        });
      }
    }

    setFilteredRoutes(filtered);
  }, [sortCriteria]);

  const handleSort = (criteria) => {
    if (sortCriteria.length > 0 && sortCriteria[0].key === criteria) {
      // Criterion is already active
      const current = sortCriteria[0];
      if (current.order === 'asc') {
        // Asc -> Desc
        setSortCriteria([{ key: criteria, order: 'desc' }]);
      } else if (current.order === 'desc') {
        // Desc -> Off (remove)
        setSortCriteria([]);
      }
    } else {
      // Not active yet, turn on asc
      setSortCriteria([{ key: criteria, order: 'asc' }]);
    }

    applyFiltersAndSorting(selectedOrigin, selectedDestination, companyFilter, routes);
  };

  const handleCompanyFilterChange = (company) => {
    setCompanyFilter(company);
    applyFiltersAndSorting(selectedOrigin, selectedDestination, company, routes);
  };

  useEffect(() => {
    applyFiltersAndSorting(selectedOrigin, selectedDestination, companyFilter, routes);
  }, [selectedOrigin, selectedDestination, companyFilter, routes, sortCriteria, applyFiltersAndSorting]);

  return (
    <div className="reservation-container">
      <h3 className="reservation-title">Select Origin and Destination</h3>

      <div className="initial-dropdowns">
        <select
          value={selectedOrigin}
          onChange={(e) => {
            setSelectedOrigin(e.target.value);
          }}
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
          onChange={(e) => {
            setSelectedDestination(e.target.value);
          }}
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

      <h2 className="reservation-title">Select a Flight</h2>
      <div className="filter-container">
        <div className="filter-dropdown-container">
          <select
            value={companyFilter}
            onChange={(e) => handleCompanyFilterChange(e.target.value)}
            className="filter-dropdown"
          >
            <option value="">All Companies</option>
            {Array.from(
              new Set(
                routes
                  .filter(
                    (leg) =>
                      leg.routeInfo.from.name === selectedOrigin &&
                      leg.routeInfo.to.name === selectedDestination
                  )
                  .flatMap((leg) =>
                    leg.providers.map((provider) => provider.company.name)
                  )
              )
            ).map((company, index) => (
              <option key={index} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-container">
          <button
            onClick={() => handleSort('price')}
            className={`sort-button ${
              sortCriteria.some((c) => c.key === 'price') ? 'active' : ''
            }`}
          >
            Sort by Price{' '}
            {sortCriteria.find((c) => c.key === 'price')?.order === 'asc'
              ? 'Low → High'
              : sortCriteria.find((c) => c.key === 'price')?.order === 'desc'
              ? 'High → Low'
              : ''}
          </button>
          <button
            onClick={() => handleSort('distance')}
            className={`sort-button ${
              sortCriteria.some((c) => c.key === 'distance') ? 'active' : ''
            }`}
          >
            Sort by Distance{' '}
            {sortCriteria.find((c) => c.key === 'distance')?.order === 'asc'
              ? 'Low → High'
              : sortCriteria.find((c) => c.key === 'distance')?.order === 'desc'
              ? 'High → Low'
              : ''}
          </button>
          <button
            onClick={() => handleSort('travelTime')}
            className={`sort-button ${
              sortCriteria.some((c) => c.key === 'travelTime') ? 'active' : ''
            }`}
          >
            Sort by Travel Time{' '}
            {sortCriteria.find((c) => c.key === 'travelTime')?.order === 'asc'
              ? 'Low → High'
              : sortCriteria.find((c) => c.key === 'travelTime')?.order === 'desc'
              ? 'High → Low'
              : ''}
          </button>
        </div>
      </div>

      <div
        className="card-container"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ 
          cursor: 'grab', 
          height: '400px',       
          overflowY: 'auto',
          userSelect: 'none'
        }}
      >
        {filteredRoutes.map((leg) =>
          leg.providers.map((provider) => (
            <div
              key={provider.id}
              data-id={provider.id}
              className={`card ${
                selectedRoute?.provider?.id === provider.id ? 'selected' : ''
              }`}
            >
              <h2>{provider.company.name}</h2>
              <h3>
                {leg.routeInfo.from.name} → {leg.routeInfo.to.name}
              </h3>
              <p>Price: {provider.price}</p>
              <p>Distance: {leg.routeInfo.distance} km</p>
              <p>Travel Time: {provider.travelTime} hours</p>
              <p>Flight Start: {new Date(provider.flightStart).toLocaleString()}</p>
              <p>Flight End: {new Date(provider.flightEnd).toLocaleString()}</p>
            </div>
          ))
        )}
        <div style={{ height: '3000px' }}></div>
      </div>

      <button
        onClick={() => setAutoScroll(!autoScroll)}
        className={`toggle-button ${autoScroll ? 'active' : ''}`}
      >
        {autoScroll ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
      </button>

      <form onSubmit={handleSubmit} className="reservation-form">
        <h2>Make a Reservation</h2>
        <input
          className="form-input"
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
        />
        <input
          className="form-input"
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
        />
        <p>Total Price: {formData.totalPrice}</p>
        <p>Travel Time: {formData.travelTime} hours</p>
        <button className="submit-button" type="submit">
          Reserve
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;
