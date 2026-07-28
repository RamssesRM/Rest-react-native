import { apiClient } from "./apiClient";

const extractPaginated = (data) => {
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return data;
};

export const tomarMesas = async () => {
    const response = await apiClient('/mesas/');
    if (!response.ok) throw new Error('Error al traer las mesas');
    return extractPaginated(await response.json());
};

export const tomarMesaConId = async (id) => {
    const response = await apiClient(`/mesas/${id}/`);
    if (!response.ok) throw new Error('Error al traer la mesa');
    return await response.json();
};

export const crearMesa = async (Data) => {
    const response = await apiClient('/mesas/', {
        method: 'POST',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error al guardar la mesa');
    return await response.json();
};

export const actualizarMesa = async (id, Data) => {
    const response = await apiClient(`/mesas/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(Data),
    });
    if (!response.ok) throw new Error('Error actualizando la mesa');
    return await response.json();
};

export const patchMesa = async (id, dataParcial) => {
    const response = await apiClient(`/mesas/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(dataParcial),
    });
    if (!response.ok) throw new Error('Error al modificar la mesa');
    return await response.json();
};

export const eliminarMesa = async (id) => {
    const response = await apiClient(`/mesas/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la mesa');
    return true;
};
