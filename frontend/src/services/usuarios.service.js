import { authFetch } from "./authFetch";

export const getUsuarios = async () => {
  const res = await authFetch("/usuarios");
  return res.json();
};

export const createUsuarioAdmin = async (data) => {
  const res = await authFetch("/usuarios", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateUsuario = async (id, data) => {
  if (data.role) data.role = data.role.toLowerCase();

  const res = await authFetch(`/usuarios/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  return res.json();
};

export const deleteUsuario = async (id) => {
  const res = await authFetch(`/usuarios/${id}`, {
    method: "DELETE",
  });

  return res.json();
};

// 🔥 AUTH AQUÍ MISMO
export const registerUsuario = async (data) => {
  const res = await authFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const loginUsuario = async (data) => {
  const res = await authFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
};