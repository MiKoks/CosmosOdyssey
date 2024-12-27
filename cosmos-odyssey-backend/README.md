# Cosmos Odyssey Application

This application is a reservation system that integrates with an external API to fetch travel price lists. Users can select origins, destinations, and other travel-related data to create reservations.

## Features
- Fetch and display travel price lists from the API.
- Allow users to filter, sort, and select travel routes.
- Create reservations linked to valid price lists.
- Automatically handle the deletion of expired price lists and their associated reservations.

## Requirements
Make sure your local environment has the following installed:
- **PHP** >= 8.0
- **Composer** >= 2.x
- **Node.js** >= 16.x
- **npm** >= 8.x
- **MySQL** or **SQLite** (or another supported database)

## Installation

Follow these steps to set up the application locally:

### Backend Setup

1. **Install dependencies:**
    Composer Install

2. **Copy the .env file and configure it:**
    cp .env.example .env

3. **Update the .env file with your database and API settings:**
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=cosmos_odyssey
    DB_USERNAME=root
    DB_PASSWORD=your_password

4. **Run migrations and seed the database:**
    php artisan migrate --seed

5. **Start the development server:**
    php artisan serve

The backend server will now be running at http://127.0.0.1:8000.

----------------------------------------------------------------

### Frontend Setup

1. **Navigate to the frontend directory:**
    cd ../cosmos-odyssey-frontend

2. **Install dependencies:**
    npm install

3. **Start the development server:**  
    npm start

The frontend server will now be running at http://localhost:3000.

-----------------------------------------------------------------

### Tests

1. **Run PHPUNIT tests:**
    php artisan test

Tests output are shown in terminal.