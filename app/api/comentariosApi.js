import { apiClient } from "./apiClient";

const extractPaginated = (data) => {
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return data;
};

export const tomarComentarios = async () => {
    const response = await apiClient('/comentarios/');
    if (!response.ok) throw new Error('Error al traer todos los comentarios');
    return extractPaginated(await response.json());
};

export const tomarComentarioConId = async (id) => {
    const response = await apiClient(`/comentarios/${id}/`);
    if (!response.ok) throw new Error('Error al traer el comentario');
    return await response.json();
};

export const tomarComentariosPorUsuario = async (usuario_id) => {
    const response = await apiClient(`/comentarios/?usuario_fk=${usuario_id}`);
    if (!response.ok) throw new Error('Error al tomar comentarios del usuario');
    return extractPaginated(await response.json());
};

export const tomarComentariosPorCliente = async (cliente_id) => {
    const response = await apiClient(`/comentarios/?cliente_id=${cliente_id}`);
    if (!response.ok) throw new Error('Error al tomar comentarios del cliente');
    return extractPaginated(await response.json());
};

export const crearComentario = async (Data) => {
    const response = await apiClient('/comentarios/', {
        method: 'POST',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error al momento de crear el comentario');
    return await response.json();
};

export const actualizarComentario = async (id, Data) => {
    const response = await apiClient(`/comentarios/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error al momento de actualizar el comentario');
    return await response.json();
};

export const patchComentario = async (id, dataParcial) => {
    const response = await apiClient(`/comentarios/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(dataParcial),
    });
    if (!response.ok) throw new Error('Error en PATCH');
    return await response.json();
};

export const eliminarComentario = async (id) => {
    const response = await apiClient(`/comentarios/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el comentario');
    return true;
};
