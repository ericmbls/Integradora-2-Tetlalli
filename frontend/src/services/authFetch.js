export const authFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Aseguramos que la URL final no duplique /api
  const baseUrl = import.meta.env.VITE_API_URL; // debe ser solo el dominio, sin /api
  const finalUrl = `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

  return fetch(finalUrl, {
    ...options,
    headers,
  });
};