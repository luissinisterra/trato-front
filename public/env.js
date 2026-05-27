// Detectar el ambiente basado en el hostname
const isProduction = window.location.hostname !== 'localhost';
const apiUrl = isProduction 
  ? 'https://gateway-service-kudv.onrender.com'
  : 'http://localhost:3000/api';

window.__env__ = {
  API_URL: apiUrl
};
