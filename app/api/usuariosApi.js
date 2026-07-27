import { apiClient } from "./apiClient";

export const tomarUsuarios = async () => {
    try {
        const response = await apiClient('/usuarios/');
        if (!response.ok) throw new Error('Error al traer los usuarios');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todos los usuarios', error);
        throw error;
    }
};

export const tomarUsuarioConId = async (id) => {
    try {
        const response = await apiClient(`/usuarios/${id}/`);
        if (!response.ok) throw new Error('Error al traer el usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al traer el usuario', error);
        throw error;
    }
};

export const crearUsuario = async (Data) => {
    try {
        const response = await apiClient('/usuarios/', {
            method: 'POST',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear el usuario', error);
        throw error;
    }
};

export const actualizarUsuario = async (id, Data) => {
    try {
        const response = await apiClient(`/usuarios/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando el usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar el usuario', error);
        throw error;
    }
};

export const patchUsuario = async (id, dataParcial) => {
    try {
        const response = await apiClient(`/usuarios/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el usuario');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarUsuario = async (id) => {
    try {
        const response = await apiClient(`/usuarios/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el usuario');
        return true;
    } catch (error) {
        console.log('Error al eliminar el usuario', error);
        throw error;
    }
};

export const tomarStatsConUsuario = async (user_id) => {
    try {
        const response = await apiClient(`/usuarios/${user_id}/stats/`);
        if (!response.ok) throw new Error('Error al traer las stats del usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al traer las stats del usuario:', error);
        throw error;
    }
};
