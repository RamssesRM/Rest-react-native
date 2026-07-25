import { BASE_URL } from "./apiConfig";
import * as SecureStore from 'expo-secure-store';

const getAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync('jwt_access');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Obtener todos los detalles
export const tomarDetallesOrdenes = async () => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/`, { headers });
        if (!response.ok) throw new Error('Error al traer los detalles');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todos los detalles', error);
        throw error;
    }
};

// Obtener detalle por ID
export const tomarDetalleOrdenConId = async (id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, { headers });
        if (!response.ok) throw new Error('Error al traer el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al traer el detalle', error);
        throw error;
    }
};

// Obtener detalles por orden
export const tomarDetallesPorOrden = async (orden_id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/?orden_fk=${orden_id}`, { headers });
        if (!response.ok) throw new Error('Error trayendo detalles de la orden');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles de la orden', error);
        throw error;
    }
};

// Obtener detalles por usuario
export const tomarDetalleOrdenConUsuario = async (usuario_id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/?usuario_fk_id=${usuario_id}`, { headers });
        if (!response.ok) throw new Error('Error trayendo detalles del usuario');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles del usuario', error);
        throw error;
    }
};

// Obtener detalles por producto
export const tomarDetalleOrdenConProducto = async (producto_id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/?producto_fk_id=${producto_id}`, { headers });
        if (!response.ok) throw new Error('Error trayendo detalles del producto');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar detalles del producto', error);
        throw error;
    }
};

// Crear detalle
export const crearDetalleOrden = async (Data) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/`, {
            method: 'POST',
            headers,
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear el detalle', error);
        throw error;
    }
};

// Actualizar detalle completo
export const actualizarDetalleOrden = async (id, Data) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando el detalle');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar el detalle', error);
        throw error;
    }
};

// Actualizar detalle parcial
export const patchDetalleOrden = async (id, dataParcial) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el detalle');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

// Eliminar detalle
export const eliminarDetalleOrden = async (id) => {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, {
            method: 'DELETE',
            headers,
        });
        if (!response.ok) throw new Error('Error al eliminar el detalle');
        return true;
    } catch (error) {
        console.log('Error al eliminar el detalle', error);
        throw error;
    }
};
