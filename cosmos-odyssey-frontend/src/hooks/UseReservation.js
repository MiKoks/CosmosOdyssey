import { useState, useEffect } from 'react';
import axios from 'axios';
import '../index.css';

const baseURL = process.env.REACT_APP_BASE_URL;

export const UseReservation = () => {
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    totalPrice: 0,
    travelTime: 0,
  });
  const [origins, setOrigins] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('');
  const [sortCriteria, setSortCriteria] = useState(null);

  

  useEffect(() => {
    axios.get(`${baseURL}/api/pricelists`)
      .then(response => {
        const { pricelist, companies } = response.data;
        setOrigins([...new Set(pricelist.legs.map(leg => leg.routeInfo.from.name))]);
        setDestinations([...new Set(pricelist.legs.map(leg => leg.routeInfo.to.name))]);
        setCompanies(companies);
      })
      .catch(err => console.error('Error fetching pricelists:', err));
  }, []);

  const updateRoutes = (origin, destination) => {
    if (!origin || !destination) return;

    const params = new URLSearchParams({ origin, destination });
    if (companyFilter) params.append('company', companyFilter);

    axios.get(`${baseURL}/api/findRoutes?${params.toString()}`)
      .then(response => setFilteredRoutes(response.data))
      .catch(err => console.error('Error fetching routes:', err));
  };

  return {
    filteredRoutes,
    selectedRoute,
    setSelectedRoute,
    formData,
    setFormData,
    origins,
    destinations,
    companies,
    companyFilter,
    setCompanyFilter,
    sortCriteria,
    setSortCriteria,
    updateRoutes,
  };
};
