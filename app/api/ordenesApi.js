import { apiClient, apiClientFormData } from "./apiClient";

export const tomarOrdenes = async () => {
    try {
        const response = await apiClient('/ordenes/');
        if (!response.ok) throw new Error('Error al traer las ordenes');
        return await response.json();
    } catch (error) {
        console.log('Error al traer todas las ordenes', error);
        throw error;
    }
};

export const tomarOrdenConId = async (id) => {
    try {
        const response = await apiClient(`/ordenes/${id}/`);
        if (!response.ok) throw new Error('Error al traer la orden');
        return await response.json();
    } catch (error) {
        console.log('Error al traer la orden', error);
        throw error;
    }
};

export const tomarOrdenConMesero = async (mesero_id) => {
    try {
        const response = await apiClient(`/ordenes/?mesero_id=${mesero_id}`);
        if (!response.ok) throw new Error('Error trayendo la orden del mesero');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar la orden con el mesero', error);
        throw error;
    }
};

export const tomarOrdenConCliente = async (cliente_id) => {
    try {
        const response = await apiClient(`/ordenes/?cliente_id=${cliente_id}`);
        if (!response.ok) throw new Error('Error trayendo la orden del cliente');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar la orden con el cliente', error);
        throw error;
    }
};

export const tomarOrdenConMesa = async (mesa_id) => {
    try {
        const response = await apiClient(`/ordenes/?mesa_fk_id=${mesa_id}`);
        if (!response.ok) throw new Error('Error trayendo la orden de la mesa');
        return await response.json();
    } catch (error) {
        console.log('Error al tomar la orden de la mesa', error);
        throw error;
    }
};

export const crearOrden = async (Data) => {
    try {
        const response = await apiClient('/ordenes/', {
            method: 'POST',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar la orden');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de crear la orden', error);
        throw error;
    }
};

export const actualizarOrden = async (id, Data) => {
    try {
        const response = await apiClient(`/ordenes/${id}/`, {
            method: 'PUT',
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error actualizando la orden');
        return await response.json();
    } catch (error) {
        console.log('Error al momento de actualizar la orden', error);
        throw error;
    }
};

export const patchOrden = async (id, dataParcial) => {
    try {
        const response = await apiClient(`/ordenes/${id}/`, {
            method: 'PATCH',
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar la orden');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarOrden = async (id) => {
    try {
        const response = await apiClient(`/ordenes/${id}/`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error al eliminar la orden');
        return true;
    } catch (error) {
        console.log('Error al eliminar la orden', error);
        throw error;
    }
};

export const getMisOrdenes = async () => {
    const response = await apiClient('/ordenes/');
    if (!response.ok) throw new Error('Error al traer mis órdenes');
    return response.json();
};

export const getOrdenesActivas = async () => {
    const response = await apiClient('/ordenes/');
    if (!response.ok) throw new Error('Error al traer órdenes activas');
    return response.json();
};

export const getOrdenesCajero = async () => {
    const [resCocinando, resFinalizado] = await Promise.all([
        apiClient('/ordenes/?estatus=cocinando'),
        apiClient('/ordenes/?estatus=finalizado'),
    ]);
    if (!resCocinando.ok || !resFinalizado.ok) throw new Error('Error al traer órdenes para cajero');
    const cocinando = await resCocinando.json();
    const finalizado = await resFinalizado.json();
    return [...cocinando, ...finalizado];
};

export const getTodasLasOrdenes = async (filtro = '', busqueda = '') => {
    let url = '/ordenes/?';
    if (filtro) url += `estatus=${filtro}&`;
    if (busqueda) url += `search=${busqueda}`;
    const response = await apiClient(url);
    if (!response.ok) throw new Error('Error al traer todas las órdenes');
    return response.json();
};

export const cambiarEstadoOrden = async (ordenId, nuevoEstado, datosExtra = {}) => {
    const response = await apiClient(`/ordenes/${ordenId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estatus: nuevoEstado, ...datosExtra }),
    });
    if (!response.ok) throw new Error('Error al actualizar el estado');
    return response.json();
};

export const registrarPago = async (ordenId, { metodo_pago, referencia_pago, comprobante }) => {
    const formData = new FormData();
    formData.append('metodo_pago', metodo_pago);
    if (referencia_pago) formData.append('referencia_pago', referencia_pago);
    if (comprobante) {
        formData.append('comprobante_pago', {
            uri: comprobante,
            type: 'image/jpeg',
            name: 'comprobante.jpg',
        });
    }

    const response = await apiClientFormData(`/ordenes/${ordenId}/`, formData);
    if (!response.ok) throw new Error('Error al registrar el pago');
    return response.json();
};

export const eliminarOrdenCliente = async (ordenId) => {
    const response = await apiClient(`/ordenes/${ordenId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ estatus: 'eliminado' }),
    });
    if (!response.ok) throw new Error('Error al eliminar la orden');
};

export const getMesas = async () => {
    const response = await apiClient('/mesas/');
    if (!response.ok) throw new Error('Error al traer mesas');
    return response.json();
};

export const getCategorias = async () => {
    const response = await apiClient('/categorias/');
    if (!response.ok) throw new Error('Error al traer categorías');
    return response.json();
};

export const getProductos = async () => {
    const response = await apiClient('/productos/');
    if (!response.ok) throw new Error('Error al traer productos');
    return response.json();
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
    return response.json();
};
