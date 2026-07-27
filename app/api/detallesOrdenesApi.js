import { apiClient } from "./apiClient";

export const tomarDetallesOrdenes = async () => {
    try {
        const response = await apiClient('/detalles/');
        if (!response.ok) throw new Error('Error al traer los detalles');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todos los detalles', error);
        throw error;
    }
};

export const tomarDetalleOrdenConId = async (id) => {
    try {
        const response = await apiClient(`/detalles/${id}/`);
        if (!response.ok) throw new Error('Error al traer el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al traer el detalle', error);
        throw error;
    }
};

export const tomarDetallesPorOrden = async (orden_id) => {
    try {
        const response = await apiClient(`/detalles/?orden_fk=${orden_id}`);
        if (!response.ok) throw new Error('Error trayendo detalles de la orden');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles de la orden', error);
        throw error;
    }
};

export const tomarDetalleOrdenConUsuario = async (usuario_id) => {
    try {
        const response = await apiClient(`/detalles/?usuario_fk_id=${usuario_id}`);
        if (!response.ok) throw new Error('Error trayendo detalles del usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles del usuario', error);
        throw error;
    }
};

export const tomarDetalleOrdenConProducto = async (producto_id) => {
    try {
        const response = await apiClient(`/detalles/?producto_fk_id=${producto_id}`);
        if (!response.ok) throw new Error('Error trayendo detalles del producto');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles del producto', error);
        throw error;
    }
};

export const crearDetalleOrden = async (Data) => {
    try {
        const response = await apiClient('/detalles/', {
            method: 'POST',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear el detalle', error);
        throw error;
    }
};

export const actualizarDetalleOrden = async (id, Data) => {
    try {
        const response = await apiClient(`/detalles/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar el detalle', error);
        throw error;
    }
};

export const patchDetalleOrden = async (id, dataParcial) => {
    try {
        const response = await apiClient(`/detalles/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el detalle');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarDetalleOrden = async (id) => {
    try {
        const response = await apiClient(`/detalles/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar el detalle');
        return true;
    } catch (error) {
        console.log('Error al eliminar el detalle', error);
        throw error;
    }
};
