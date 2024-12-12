import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Pricelist() {
  const [legs, setLegs] = useState([]); // Store legs data
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/pricelists')
      .then((response) => {
        console.log('API Response:', response.data); // Debug the response
        setLegs(response.data.legs); // Extract the "legs" array from the response
      })
      .catch((err) => {
        console.error('Error fetching pricelists:', err);
        setError('Failed to load routes. Please try again later.');
      });
  }, []);

  return (
    <div>
      <h1>Available Routes</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        legs.length > 0 ? (
          legs.map((leg, index) => (
            <div key={leg.id}>
              <h2>Route: {leg.routeInfo.from.name} → {leg.routeInfo.to.name}</h2>
              <p>Distance: {leg.routeInfo.distance} km</p>
              <h3>Providers:</h3>
              {leg.providers.map((provider) => (
                <div key={provider.id}>
                  <p>Company: {provider.company.name}</p>
                  <p>Price: {provider.price}</p>
                  <p>Flight Start: {new Date(provider.flightStart).toLocaleString()}</p>
                  <p>Flight End: {new Date(provider.flightEnd).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ))
        ) : (
          <p>Loading routes...</p>
        )
      )}
    </div>
  );
}

export default Pricelist;
