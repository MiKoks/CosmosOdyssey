import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PricelistsPage from './pages/PricelistsPage';
import ReservationPage from './pages/ReservationPage';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <div>
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pricelists" element={<PricelistsPage />} />
            <Route path="/reservation" element={<ReservationPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
