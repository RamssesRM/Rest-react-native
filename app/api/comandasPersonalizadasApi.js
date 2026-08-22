import { apiClient } from './apiClient';

export const tomarComandasPersonalizadas = async () => {
    const response = await apiClient('/comandas-personalizadas/');
    return response.json();
};

export const tomarComandaPersonalizadaConId = async (id) => {
    const response = await apiClient(`/comandas-personalizadas/${id}/`);
    return response.json();
};

export const crearComandaPersonalizada = async (data) => {
    const response = await apiClient('/comandas-personalizadas/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const editarComandaPersonalizada = async (id, data) => {
    const response = await apiClient(`/comandas-personalizadas/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    return response.json();
};

export const eliminarComandaPersonalizada = async (id) => {
    const response = await apiClient(`/comandas-personalizadas/${id}/`, {
        method: 'DELETE',
    });
    return response.ok;
};

export const crearOrdenDesdePlantilla = async (comandaId, mesaId) => {
    const response = await apiClient(`/comandas-personalizadas/${comandaId}/crear_orden/`, {
        method: 'POST',
        body: JSON.stringify({ mesa_id: mesaId }),
    });
    return response.json();
};

export const guardarDesdeOrden = async (ordenId, nombre) => {
    const response = await apiClient('/comandas-personalizadas/guardar_desde_orden/', {
        method: 'POST',
        body: JSON.stringify({ orden_id: ordenId, nombre }),
    });
    return response.json();
};
