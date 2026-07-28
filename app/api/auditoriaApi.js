import { apiClient } from './apiClient';

const MODELOS = [
    { key: 'usuarios', label: 'Usuarios', color: '#9C27B0', icon: 'people-outline' },
    { key: 'ordenes', label: 'Órdenes', color: '#FF9800', icon: 'receipt-outline' },
    { key: 'detallesOrdenes', label: 'Detalles Orden', color: '#FF5722', icon: 'list-outline' },
    { key: 'mesas', label: 'Mesas', color: '#2196F3', icon: 'grid-outline' },
    { key: 'productos', label: 'Productos', color: '#4CAF50', icon: 'fast-food-outline' },
    { key: 'categorias', label: 'Categorías', color: '#00BCD4', icon: 'pricetags-outline' },
    { key: 'comentarios', label: 'Comentarios', color: '#E91E63', icon: 'chatbubble-outline' },
];

const ACCIONES = [
    { key: 'CREADO', label: 'Creado', color: '#4CAF50' },
    { key: 'ACTUALIZADO', label: 'Actualizado', color: '#FF9800' },
    { key: 'ELIMINADO', label: 'Eliminado', color: '#F44336' },
];

export const tomarAuditoria = async (params: {
    modelo?: string;
    accion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    buscar?: string;
    page?: number;
    page_size?: number;
} = {}) => {
    const queryParts: string[] = [];
    if (params.modelo) queryParts.push(`modelo=${encodeURIComponent(params.modelo)}`);
    if (params.accion) queryParts.push(`accion=${encodeURIComponent(params.accion)}`);
    if (params.fecha_desde) queryParts.push(`fecha_desde=${params.fecha_desde}`);
    if (params.fecha_hasta) queryParts.push(`fecha_hasta=${params.fecha_hasta}`);
    if (params.buscar) queryParts.push(`buscar=${encodeURIComponent(params.buscar)}`);
    if (params.page) queryParts.push(`page=${params.page}`);
    if (params.page_size) queryParts.push(`page_size=${params.page_size}`);

    const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    const response = await apiClient(`/auditoria/${query}`);
    if (!response.ok) throw new Error('Error al cargar auditoría');
    return response.json();
};

export { MODELOS, ACCIONES };
