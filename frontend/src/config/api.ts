const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL && import.meta.env.PROD) {
  throw new Error("VITE_API_URL missing in production environment");
}

export default API_URL || 'http://localhost:5000/api/v1';
