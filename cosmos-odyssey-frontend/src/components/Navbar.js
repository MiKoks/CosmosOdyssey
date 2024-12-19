import React from 'react';
import { Link } from 'react-router-dom';
import '../index.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <Link to="/" className="navbar-link">Home</Link>
        </li>
        <li>
          <Link to="/pricelists" className="navbar-link">Pricelists</Link>
        </li>
        <li>
          <Link to="/reservation" className="navbar-link">Reservation</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
