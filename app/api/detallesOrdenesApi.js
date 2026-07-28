import { apiClient } from "./apiClient";

const extractPaginated = (data) => {
    if (data && typeof data === 'object' && 'results' in data) return data.results;
    return data;
};

export const tomarDetalles = async () => {
    const response = await apiClient('/detalles/');
    if (!response.ok) throw new Error('Error al traer todos los detalles');
    return extractPaginated(await response.json());
};

export const tomarDetalleConId = async (id) => {
    const response = await apiClient(`/detalles/${id}/`);
    if (!response.ok) throw new Error('Error al traer el detalle');
    return await response.json();
};

export const tomarDetallesPorOrden = async (orden_id) => {
    const response = await apiClient(`/detalles/?orden_fk=${orden_id}`);
    if (!response.ok) throw new Error('Error al tomar detalles de la orden');
    return extractPaginated(await response.json());
};

export const tomarDetallesPorUsuario = async (usuario_id) => {
    const response = await apiClient(`/detalles/?usuario_fk=${usuario_id}`);
    if (!response.ok) throw new Error('Error al tomar detalles del usuario');
    return extractPaginated(await response.json());
};

export const tomarDetallesPorProducto = async (producto_id) => {
    const response = await apiClient(`/detalles/?producto_fk=${producto_id}`);
    if (!response.ok) throw new Error('Error al tomar detalles del producto');
    return extractPaginated(await response.json());
};

export const crearDetalle = async (data) => {
    const response = await apiClient('/detalles/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
    }
    return await response.json();
};

export const actualizarDetalle = async (id, data) => {
    const response = await apiClient(`/detalles/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al momento de actualizar el detalle');
    return await response.json();
};

export const patchDetalle = async (id, dataParcial) => {
    const response = await apiClient(`/detalles/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(dataParcial),
    });
    if (!response.ok) throw new Error('Error en PATCH');
    return await response.json();
};

export const patchDetalleOrden = patchDetalle;

export const eliminarDetalle = async (id) => {
    const response = await apiClient(`/detalles/${id}/`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar el detalle');
    return true;
};

export const eliminarDetalleOrden = eliminarDetalle;
