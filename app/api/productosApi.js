import { apiClient, apiClientFormData } from './apiClient';

export const tomarProductos = async (search, categoria_fk) => {
    let url = '/productos/';
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoria_fk) params.append('categoria_fk', categoria_fk);
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const response = await apiClient(url);
    if (!response.ok) throw new Error('Error al traer productos');
    return await response.json();
};

export const crearProducto = async (formData) => {
    const response = await apiClientFormData('/productos/', formData, 'POST');
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Error al crear producto');
    }
    return await response.json();
};

export const editarProducto = async (id, formData) => {
    const response = await apiClientFormData(`/productos/${id}/`, formData);
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Error al editar producto');
    }
    return await response.json();
};

export const eliminarProducto = async (id) => {
    const response = await apiClient(`/productos/${id}/`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar producto');
};

export const restaurarProducto = async (id) => {
    const response = await apiClient(`/productos/${id}/restaurar/`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Error al reactivar producto');
    return await response.json();
};

export const tomarProductosInactivos = async () => {
    const response = await apiClient('/productos/inactivos/');
    if (!response.ok) throw new Error('Error al traer productos inactivos');
    return await response.json();
};
