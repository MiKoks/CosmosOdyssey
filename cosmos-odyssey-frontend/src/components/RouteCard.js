import React from 'react';

function RouteCard({ route, selectedRoute, handleSelect }) {
  return (
    <div
      className={`card ${selectedRoute?.legs === route.legs ? 'selected' : ''}`}
      onClick={() => handleSelect(route)}
      style={{
        cursor: 'pointer',
        border: selectedRoute?.legs === route.legs ? '2px solid blue' : '1px solid #ccc',
      }}
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
  );
}

export default RouteCard;
