export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window as any).__env__?.API_URL) || 'http://localhost:3000/api'
};
