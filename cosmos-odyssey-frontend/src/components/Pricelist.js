import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pricelist.css';

function Pricelist() {
  const [pricelists, setPricelists] = useState([]);
  const [selectedPricelist, setSelectedPricelist] = useState(null);
  const [error, setError] = useState(null);
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}/api/all-pricelists`)
      .then((response) => {
        const data = response.data || [];
        setPricelists(data);

        if (data.length > 0) {
          setSelectedPricelist(data[0]);
        }
      })
      .catch((err) => {
        console.error('Error fetching pricelists:', err);
        setError('Failed to load pricelists. Please try again later.');
      });
  }, []);

  const handlePricelistChange = (event) => {
    const selectedId = event.target.value;
    const pricelist = pricelists.find((p) => p.id === parseInt(selectedId));
    setSelectedPricelist(pricelist);
  };

  return (
    <div className="pricelist-container">
      <h1 className="page-title">Available Pricelists</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          <div className="dropdown-container">
            <label className="dropdown-label" htmlFor="pricelist-select">
              Select a Pricelist:
            </label>
            <select
              id="pricelist-select"
              className="dropdown"
              onChange={handlePricelistChange}
              value={selectedPricelist?.id || ''}
            >
              {pricelists.map((pricelist) => (
                <option key={pricelist.id} value={pricelist.id}>
                  Valid Until: {new Date(pricelist.valid_until).toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          {selectedPricelist ? (
            <div className="pricelist-details">
              <h2 className="section-title">Routes for Selected Pricelist</h2>
              {selectedPricelist.legs && selectedPricelist.legs.length > 0 ? (
                selectedPricelist.legs.map((leg, index) => (
                  <div className="route-card" key={index}>
                    <h3>
                      Route: {leg.routeInfo?.from?.name} → {leg.routeInfo?.to?.name}
                    </h3>
                    <p>Distance: {leg.routeInfo?.distance || 0} km</p>
                    <h4>Providers:</h4>
                    {leg.providers && leg.providers.length > 0 ? (
                      leg.providers.map((provider, idx) => (
                        <div className="provider-details" key={idx}>
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
                <p>No routes available for this pricelist.</p>
              )}
            </div>
          ) : (
            <p>Select a pricelist to see the routes.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Pricelist;
