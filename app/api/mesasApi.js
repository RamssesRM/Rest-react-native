import { apiClient } from "./apiClient";

export const tomarMesas = async () => {
    try {
        const response = await apiClient('/mesas/');
        if (!response.ok) throw new Error('Error al traer las mesas');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todas las mesas', error);
        throw error;
    }
};

export const tomarMesaConId = async (id) => {
    try {
        const response = await apiClient(`/mesas/${id}/`);
        if (!response.ok) throw new Error('Error al traer la mesa');
        return await response.json();
    } catch (error) {
        console.log('Error al traer la mesa', error);
        throw error;
    }
};

export const crearMesa = async (Data) => {
    try {
        const response = await apiClient('/mesas/', {
            method: 'POST',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar la mesa');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear la mesa', error);
        throw error;
    }
};

export const actualizarMesa = async (id, Data) => {
    try {
        const response = await apiClient(`/mesas/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando la mesa');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar la mesa', error);
        throw error;
    }
};

export const patchMesa = async (id, dataParcial) => {
    try {
        const response = await apiClient(`/mesas/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar la mesa');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarMesa = async (id) => {
    try {
        const response = await apiClient(`/mesas/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar la mesa');
        return true;
    } catch (error) {
        console.log('Error al eliminar la mesa', error);
        throw error;
    }
};
