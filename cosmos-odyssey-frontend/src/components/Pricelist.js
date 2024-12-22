import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Pricelist() {
  const [legs, setLegs] = useState([]);
  const [error, setError] = useState(null);
  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/latest-pricelist')
      .then((response) => {
        console.log('Pricelist API Response:', response.data);
        setLegs(response.data.pricelist.legs || []);
      })
      .catch((err) => {
        console.error('Error fetching the latest pricelist:', err);
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
            <div key={index}>
              <h2>
                Route: {leg.routeInfo?.from?.name} → {leg.routeInfo?.to?.name}
              </h2>
              <p>Distance: {leg.routeInfo?.distance || 0} km</p>
              <h3>Providers:</h3>
              {leg.providers && leg.providers.length > 0 ? (
                leg.providers.map((provider, idx) => (
                  <div key={idx}>
                    <p>Company: {provider.company?.name || 'N/A'}</p>
                    <p>Price: {provider.price || 'N/A'}</p>
                    <p>
                      Flight Start:{' '}
                      {provider.flightStart
                        ? new Date(provider.flightStart).toLocaleString()
                        : 'N/A'}
                    </p>
                    <p>
                      Flight End:{' '}
                      {provider.flightEnd
                        ? new Date(provider.flightEnd).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <p>No providers available for this route.</p>
              )}
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
