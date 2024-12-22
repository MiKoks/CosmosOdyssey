import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';

function ReservationForm() {
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
  const [companies, setCompanies] = useState([]);
  // One sorting criterion with asc/desc/off states
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
            const { pricelist, companies } = response.data;
            const legs = pricelist.legs;
            const uniqueOrigins = [...new Set(legs.map((leg) => leg.routeInfo.from.name))];
            const uniqueDestinations = [...new Set(legs.map((leg) => leg.routeInfo.to.name))];
            setOrigins(uniqueOrigins);
            setDestinations(uniqueDestinations);
            setCompanies(companies);
        })
        .catch((err) => console.error('Error fetching pricelists:', err));
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
    setMouseDownProvider(null);
    setMouseDownLeg(null);
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

  const handleSort = (criteria) => {
    if (sortCriteria.length > 0 && sortCriteria[0].key === criteria) {
      const current = sortCriteria[0];
      if (current.order === 'asc') {
        setSortCriteria([{ key: criteria, order: 'desc' }]);
      } else if (current.order === 'desc') {
        setSortCriteria([]);
      }
    } else {
      setSortCriteria([{ key: criteria, order: 'asc' }]);
    }
  };

  const handleCompanyFilterChange = (company) => {
    setCompanyFilter(company);
  };

  useEffect(() => {
    if (!selectedOrigin || !selectedDestination) {
      setFilteredRoutes([]);
      return;
    }
  
    const params = new URLSearchParams();
    params.append('origin', selectedOrigin);
    params.append('destination', selectedDestination);
    if (companyFilter) params.append('company', companyFilter);
  
    if (sortCriteria.length > 0) {
      const { key, order } = sortCriteria[0];
      params.append('sortKey', key);
      params.append('sortOrder', order);
    }
  
    fetch(`http://127.0.0.1:8000/api/findRoutes?${params.toString()}`)
      .then(res => res.json())
      .then(data => setFilteredRoutes(data))
      .catch(err => console.error('Error fetching routes:', err));
  }, [selectedOrigin, selectedDestination, companyFilter, sortCriteria]);

  return (
    <div className="reservation-container">
      <h3 className="reservation-title">Select Origin and Destination</h3>

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

      <h3 className="reservation-title">Select a Flight</h3>
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
        {filteredRoutes.map((route, i) => (
          <div
            key={i}
            className="card"
          >
            {route.legs.length > 1 ? <h2>Combined Route</h2> : <h2>Direct Route</h2>}
            <p>Total Price: {route.totalPrice}</p>
            <p>Total Distance: {route.totalDistance} km</p>
            <p>Total Time: {route.totalTime} hours</p>
            <p>Companies: {route.companies.join(', ')}</p>
            <p>Stops: {route.legs.length - 1}</p>
            <ul>
              {route.legs.map((leg, idx) => (
                <li key={idx}>
                  {leg.from} → {leg.to}, Price: {leg.price}, Time: {leg.travelTime}h, Company: {leg.company}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
