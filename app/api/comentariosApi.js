import { apiClient } from "./apiClient";

export const tomarComentarios = async () => {
    try {
        const response = await apiClient('/comentarios/');
        if (!response.ok) throw new Error('Error al traer los comentarios');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todos los comentarios', error);
        throw error;
    }
};

export const tomarComentarioConId = async (id) => {
    try {
        const response = await apiClient(`/comentarios/${id}/`);
        if (!response.ok) throw new Error('Error al traer el comentario');
        return await response.json();
    } catch (error) {
        console.log('Error al traer el comentario', error);
        throw error;
    }
};

export const tomarComentarioConUsuario = async (usuario_id) => {
    try {
        const response = await apiClient(`/comentarios/?usuario_fk=${usuario_id}`);
        if (!response.ok) throw new Error('Error trayendo comentarios del usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar comentarios del usuario', error);
        throw error;
    }
};

export const tomarComentarioConCliente = async (cliente_id) => {
    try {
        const response = await apiClient(`/comentarios/?usuario_fk=${cliente_id}`);
        if (!response.ok) throw new Error('Error trayendo comentarios del cliente');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar comentarios del cliente', error);
        throw error;
    }
};

export const crearComentario = async (Data) => {
    try {
        const response = await apiClient('/comentarios/', {
            method: 'POST',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el comentario');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear el comentario', error);
        throw error;
    }
};

export const actualizarComentario = async (id, Data) => {
    try {
        const response = await apiClient(`/comentarios/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando el comentario');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar el comentario', error);
        throw error;
    }
};

export const patchComentario = async (id, dataParcial) => {
    try {
        const response = await apiClient(`/comentarios/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el comentario');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarComentario = async (id) => {
    try {
        const response = await apiClient(`/comentarios/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el comentario');
        return true;
    } catch (error) {
        console.log('Error al eliminar el comentario', error);
        throw error;
    }
};
