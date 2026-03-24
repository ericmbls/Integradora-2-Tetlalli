export const authFetch = async (url, options = {}) => {
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

  const baseUrl = import.meta.env.VITE_API_URL;
  const finalUrl = `${baseUrl}${url.startsWith("/") ? url : `/${url}`}`;

  const response = await fetch(finalUrl, {
    ...options,
    headers,
  });

  // 🔥 manejo global de errores
  if (response.status === 401) {
    console.error("Token inválido o expirado");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return;
  }

  return response;
};