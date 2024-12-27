import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';
import DropdownSection from './DropdownSection';
import FilterAndSort from './FilterAndSort';
import RouteCard from './RouteCard';

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
  const [sortCriteria, setSortCriteria] = useState([]);
  const scrollContainerRef = useRef(null);
  const [scrollDirectionDown, setScrollDirectionDown] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);

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

    axios
      .get(`http://127.0.0.1:8000/api/findRoutes?${params.toString()}`)
      .then((response) => {
        setFilteredRoutes(response.data);
      })
      .catch((err) => console.error('Error fetching routes:', err));
  }, [selectedOrigin, selectedDestination, companyFilter, sortCriteria]);

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
    setIsDragging(true);
    setStartY(e.clientY);
    if (scrollContainerRef.current) {
      setScrollTop(scrollContainerRef.current.scrollTop);
      scrollContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const container = scrollContainerRef.current;
    if (container) {
      const walk = (e.clientY - startY) * -1; //scroll direction
      container.scrollTop = scrollTop + walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab';
    }
  };

  const handleSelect = (route) => {
    setSelectedRoute({
      legs: route.legs,
      totalPrice: route.totalPrice,
      totalTime: route.totalTime,
      companies: route.companies,
      routeIds: route.legs.map((leg) => leg.routeId),
      pricelist_id: route.pricelist_id,
    });

    setFormData({
      ...formData,
      totalPrice: route.totalPrice,
      travelTime: route.totalTime,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      alert('Please select a flight!');
      return;
    }

    const requestData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      routes: selectedRoute.routeIds,
      total_price: selectedRoute.totalPrice,
      total_travel_time: selectedRoute.totalTime,
      company_names: Array.isArray(selectedRoute.companies)
        ? selectedRoute.companies
        : [selectedRoute.companies],
      pricelist_id: selectedRoute.pricelist_id || null,
    };

    axios
      .post('http://127.0.0.1:8000/api/reservations', requestData)
      .then(() => alert('Reservation made successfully!'))
      .catch((err) => {
        console.error('Reservation submission error:', err.response?.data || err.message);
        alert(`Failed to make reservation: ${JSON.stringify(err.response?.data || err.message)}`);
      });
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

  return (
    <div className="reservation-container">
      <h3 className="reservation-title">Select Origin and Destination</h3>

      <DropdownSection
        origins={origins}
        destinations={destinations}
        selectedOrigin={selectedOrigin}
        setSelectedOrigin={setSelectedOrigin}
        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}
      />

      <h3 className="reservation-title">Select a Flight</h3>
      <FilterAndSort
        companies={companies}
        companyFilter={companyFilter}
        handleCompanyFilterChange={handleCompanyFilterChange}
        handleSort={handleSort}
        sortCriteria={sortCriteria}
      />

      <div
        className="card-container"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: 'grab', height: '400px', overflowY: 'auto', userSelect: 'none' }}
      >
        {filteredRoutes.map((route, i) => (
          <RouteCard
            key={i}
            route={route}
            selectedRoute={selectedRoute}
            handleSelect={handleSelect}
          />
        ))}
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
