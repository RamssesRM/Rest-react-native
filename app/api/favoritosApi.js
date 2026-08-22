import { apiClient } from "./apiClient";

const extractPaginated = (data) => {
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return data;
};

export const tomarFavoritos = async () => {
    const response = await apiClient('/favoritos/');
    if (!response.ok) throw new Error('Error al traer favoritos');
    return extractPaginated(await response.json());
};

export const agregarFavorito = async (productoId) => {
    const response = await apiClient('/favoritos/', {
        method: 'POST',
        body: JSON.stringify({ producto_fk: productoId }),
    });
    if (!response.ok) throw new Error('Error al agregar favorito');
    return await response.json();
};

export const quitarFavorito = async (favoritoId) => {
    const response = await apiClient(`/favoritos/${favoritoId}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al quitar favorito');
    return true;
};
