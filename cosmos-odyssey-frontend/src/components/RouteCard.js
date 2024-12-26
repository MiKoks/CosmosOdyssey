import React from 'react';
import '../index.css';

const RouteCard = ({ route, isSelected, onSelect }) => (
  <div
    className={`card ${isSelected ? 'selected' : ''}`}
    onClick={() => onSelect(route)}
    style={{
      cursor: 'pointer',
      border: isSelected ? '2px solid blue' : '1px solid #ccc',
    }}
  >
    <h2>{route.legs.length > 1 ? 'Combined Route' : 'Direct Route'}</h2>
    <p>Total Price: {route.totalPrice}</p>
    <p>Total Distance: {route.totalDistance} km</p>
    <p>Total Time: {route.totalTime} hours</p>
    <p>Companies: {route.companies.join(', ')}</p>
    <p>Stops: {route.legs.length - 1}</p>
    <p>Pricelist ID: {route.pricelist_id}</p>
    <ul>
      {route.legs.map((leg, idx) => (
        <li key={idx}>
          {leg.from} → {leg.to}, Price: {leg.price}, Time: {leg.travelTime}h, Company: {leg.company}
        </li>
      ))}
    </ul>
  </div>
);

export default RouteCard;

