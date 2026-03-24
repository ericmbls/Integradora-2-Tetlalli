import { authFetch } from "./authFetch";

const normalizeCultivo = (cultivo) => ({
  ...cultivo,
  imagen: cultivo.imagen || null,
});

export const getCultivos = async () => {
  const res = await authFetch("/cultivos"); // ✅ sin /api
  if (!res.ok) throw new Error("Error obteniendo cultivos");
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCultivo) : [];
};

export const createCultivo = async (data) => {
  const res = await authFetch("/cultivos", {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(errorText);
    throw new Error("Error creando cultivo");
  }

  const cultivo = await res.json();
  return normalizeCultivo(cultivo);
};

export const updateCultivo = async (id, data) => {
  const res = await authFetch(`/cultivos/${id}`, {
    method: "PATCH",
    body: data,
  });

  if (!res.ok) throw new Error("Error actualizando cultivo");

  const cultivo = await res.json();
  return normalizeCultivo(cultivo);
};

export const deleteCultivo = async (id) => {
  const res = await authFetch(`/cultivos/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) throw new Error("Error eliminando cultivo");

  return true;
};