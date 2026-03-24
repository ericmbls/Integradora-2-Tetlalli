export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Solo agregar Content-Type si NO es FormData
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const baseUrl = import.meta.env.VITE_API_URL;

  // 🔥 CENTRALIZAMOS /api AQUÍ
  const finalUrl = `${baseUrl}/api${url.startsWith("/") ? url : `/${url}`}`;

  let response;

  try {
    response = await fetch(finalUrl, {
      ...options,
      headers,
    });
  } catch (error) {
    console.error("Error de red:", error);
    throw new Error("No se pudo conectar con el servidor");
  }

  // 🔥 manejo global de sesión
  if (response.status === 401) {
    console.error("Sesión expirada");

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error("Sesión expirada"); // 👈 IMPORTANTE
  }

  return response;
};