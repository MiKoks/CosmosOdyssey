import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../index.css';

function ReservationForm() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    totalPrice: 0,
    travelTime: 0,
  });

  const [autoScroll, setAutoScroll] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/pricelists')
      .then((response) => setRoutes(response.data.legs))
      .catch((err) => console.error('Error fetching routes:', err));
  }, []);

  useEffect(() => {
    if (autoScroll && !isDragging && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      let scrollDirection = 1; // 1 down, -1 up
  
      const interval = setInterval(() => {

        container.scrollBy({ top: scrollDirection * 2, behavior: 'smooth' });
  
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
          scrollDirection = -1;
        }
        if (container.scrollTop <= 0) {
          scrollDirection = 1;
        }
      }, 50);
  
      return () => clearInterval(interval);
    }
  }, [autoScroll, isDragging]);
  

  const handleSelect = (provider, leg) => {
    setSelectedRoute({ provider, leg });
    setFormData({
      ...formData,
      totalPrice: provider.price,
      travelTime: calculateTravelTime(provider),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedRoute) {
      alert('Please select a flight!');
      return;
    }
  
    const routeId = selectedRoute.provider.id;
  
    const requestData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      totalPrice: formData.totalPrice,
      travelTime: formData.travelTime,
      routeId, // Only include fields that the backend expects
    };
  
    axios.post('http://127.0.0.1:8000/api/reservations', requestData)
      .then((response) => {
        console.log('Success:', response.data);
        alert('Reservation made successfully!');
      })
      .catch((err) => {
        console.error('Error:', err.response ? err.response.data : err.message);
        alert('Failed to make reservation.');
      });
  };
  
  

  // Drag-to-Scroll Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const container = scrollContainerRef.current;
    container.isDragging = true;
    container.startY = e.pageY - container.offsetTop;
    container.scrollTopStart = container.scrollTop;
  };

  const handleMouseMove = (e) => {
    const container = scrollContainerRef.current;
    if (!container.isDragging) return;
    e.preventDefault();
    const y = e.pageY - container.offsetTop;
    const walk = (y - container.startY) * 1.5;
    container.scrollTop = container.scrollTopStart - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    const container = scrollContainerRef.current;
    container.isDragging = false;
  };

  return (
    <div className="reservation-container">
      <h2 className="reservation-title">Select a Flight</h2>
      <div
        ref={scrollContainerRef}
        className="card-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {routes.map((leg) =>
          leg.providers.map((provider) => (
            <div
              key={provider.id}
              onClick={() => handleSelect(provider, leg)}
              className={`card ${selectedRoute?.provider?.id === provider.id ? 'selected' : ''}`}
            >
                <h2>{provider.company.name}</h2>
              <h3>{leg.routeInfo.from.name} → {leg.routeInfo.to.name}</h3>
              <p>Price: {provider.price}</p>
              <p>Distance: {leg.routeInfo.distance} km</p>
              <p>Flight Start: {new Date(provider.flightStart).toLocaleString()}</p>
              <p>Flight End: {new Date(provider.flightEnd).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
      <button
        onClick={() => setAutoScroll((prev) => !prev)}
        className={`toggle-button ${autoScroll ? 'active' : ''}`}
      >
        {autoScroll ? 'Stop Auto-Scroll' : 'Start Auto-Scroll'}
      </button>
      <form onSubmit={handleSubmit} className="reservation-form">
        <h2 className="reservation-title">Make a Reservation</h2>
        <input
          type="text"
          placeholder="First Name"
          value={formData.firstName}
          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          required
          className="form-input"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          required
          className="form-input"
        />
        <p>Total Price: {formData.totalPrice}</p>
        <p>Travel Time: {formData.travelTime} hours</p>
        <button type="submit" className="submit-button">Reserve</button>
      </form>
    </div>
  );
}

function calculateTravelTime(provider) {
  if (!provider) return 0;
  const start = new Date(provider.flightStart);
  const end = new Date(provider.flightEnd);
  const diffInMs = end - start;
  return Math.round(diffInMs / (1000 * 60 * 60));
}

export default ReservationForm;
