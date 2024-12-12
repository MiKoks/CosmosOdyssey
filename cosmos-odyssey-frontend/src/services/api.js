import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

export const getPricelists = () => api.get('/pricelists');
export const createReservation = (data) => api.post('/reservations', data);

export default api;
