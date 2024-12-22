// Example for HomePage.js
import React from 'react';
import '../homepage.css';
import CosmosOdysseyPic from '../assets/CosmosOdysseyPic.png';

function HomePage() {
  return (
    <div className="homepage-container">
      <h1 className="homepage-title">Welcome to Cosmos Odyssey</h1>
      <p className="homepage-description">
        Explore the universe with the best travel routes across planets!
      </p>
      
      <div className="image-container">
        <img 
          src={CosmosOdysseyPic} 
          alt="Cosmos Odyssey Logo" 
          className="homepage-image"
        />
      </div>
    </div>
  );
}

export default HomePage;
