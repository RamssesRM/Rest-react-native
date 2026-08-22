import { apiClient } from "./apiClient";

const extractPaginated = (data) => {
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return data;
};

export const tomarUsuarios = async () => {
    const response = await apiClient('/usuarios/');
    if (!response.ok) throw new Error('Error al traer todos los usuarios');
    return extractPaginated(await response.json());
};

export const tomarUsuarioConId = async (id) => {
    const response = await apiClient(`/usuarios/${id}/`);
    if (!response.ok) throw new Error('Error al traer el usuario');
    return await response.json();
};

export const crearUsuario = async (Data) => {
    const response = await apiClient('/usuarios/', {
        method: 'POST',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error al momento de crear el usuario');
    return await response.json();
};

export const actualizarUsuario = async (id, Data) => {
    const response = await apiClient(`/usuarios/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error al momento de actualizar el usuario');
    return await response.json();
};

export const patchUsuario = async (id, dataParcial) => {
    const response = await apiClient(`/usuarios/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(dataParcial),
    });
    if (!response.ok) throw new Error('Error en PATCH');
    return await response.json();
};

export const eliminarUsuario = async (id) => {
    const response = await apiClient(`/usuarios/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el usuario');
    return true;
};

export const tomarStatsUsuario = async (userId) => {
    const response = await apiClient(`/usuarios/${userId}/stats/`);
    if (!response.ok) throw new Error('Error al traer las stats del usuario');
    return await response.json();
};

export const tomarStatsConUsuario = tomarStatsUsuario;

export const tomarPlatoFavorito = async (userId) => {
    const response = await apiClient(`/usuarios/${userId}/plato_favorito/`);
    if (!response.ok) throw new Error('Error al traer plato favorito');
    return await response.json();
};
