import React from 'react';

function RouteCard({ route }) {
  return (
    <div className="route-card">
      <p><strong>Price:</strong> {route.price}</p>
      <p><strong>Distance:</strong> {route.distance}</p>
    </div>
  );
}

export default RouteCard;
