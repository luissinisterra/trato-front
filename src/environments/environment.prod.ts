export const environment = {
  production: true,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env__?.API_URL) || 'https://gateway-service-kudv.onrender.com'
};
