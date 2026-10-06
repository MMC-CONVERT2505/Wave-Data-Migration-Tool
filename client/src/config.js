// Backend ka base URL — .env / .env.production me VITE_API_URL se aata hai.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4002").replace(/\/$/, "");
