import { authFetch } from "./authFetch";

// 🔥 USUARIOS

export const getUsuarios = async () => {
  const res = await authFetch("/usuarios");

  if (!res.ok) throw new Error("Error obteniendo usuarios");

  return res.json();
};

export const createUsuarioAdmin = async (data) => {
  const res = await authFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error creando usuario");

  return res.json();
};

export const updateUsuario = async (id, data) => {
  if (data.role) {
    data.role = data.role.toLowerCase();
  }

  const res = await authFetch(`/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error actualizando usuario");

  return res.json();
};

export const deleteUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error eliminando usuario");

  return true;
};

// 🔥 AUTH

export const registerUsuario = async (data) => {
  const res = await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error registrando usuario");
  }

  return res.json();
};

export const loginUsuario = async (data) => {
  const res = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Error en login");
  }

  return res.json();
};