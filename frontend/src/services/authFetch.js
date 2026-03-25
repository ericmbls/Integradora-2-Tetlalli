export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const baseUrl = import.meta.env.VITE_API_URL;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  return res;
};