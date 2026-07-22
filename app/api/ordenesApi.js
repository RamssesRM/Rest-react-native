import { BASE_URL, getHeaders } from "./apiConfig";
import * as SecureStore from 'expo-secure-store';

// Esta funcion trae todas las categorias de django
export const tomarOrdenes = async () => {
    try{
        const response = await fetch(`${BASE_URL}/ordenes/`);
        if (!response.ok) throw new Error('Error al traer las ordenes 6');
    }catch (error){
        console.log('Error al traer todas las ordenes 8', error);
        throw error;
    }
};

// Esta funcion trae la categoria cuando se inserte un id, se utiliza más que todo cuando se vaya a editar para llenar los campos que se van a modificar y hacerla más dinámica
export const tomarOrdenConId = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}/ordenes/${id}/`);
        if (!response.ok) throw new Error('Error al traer la orden 18');
    }catch (error){
        console.log('Error al traer la orden 20', error);
        throw error;
    }
}

export const tomarOrdenConMesero = async (mesero_id) => {
    try{
        const response = fetch(`${BASE_URL}/ordenes/?mesero_id=${mesero_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar la orden con el usuario que lo agregó', error)
        throw error
    }
}

export const tomarOrdenConCliente = async (cliente_id) => {
    try{
        const response = fetch(`${BASE_URL}/ordenes/?cliente_id=${cliente_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar la orden con el usuario que lo agregó', error)
        throw error
    }
}

export const tomarOrdenConMesa = async (mesa_id) => {
    try{
        const response = fetch(`${BASE_URL}/ordenes/?mesa_fk_id=${mesa_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar la orden con el usuario que lo agregó', error)
        throw error
    }
}

// Esto guarda la categoria al momento de pasarle un objeto que el django acepte, si no lo acepta o no cumple con los modelos y los serializadores de django no va a guardar la informacion
export const crearOrden = async (Data) => {
    try{
        const response = await fetch(`${BASE_URL}/ordenes/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar la orden 32')
            return await response.json();
    }catch (error){
        console.log('Error al momento de crear la orden 36', error);
        throw error;
    }
}

export const actualizarOrden = async (id, Data) => {
    try{
        const response = await fetch(`${BASE_URL}/ordenes/${id}/`, {
            method : 'PUT',
            headers: getHeaders(),
            body:JSON.stringify(Data),
        })
        if (!response.ok) throw new Error('Error actualizando la orden 48')
        return await response.json()
    }catch (error){
        console.log('Error al momento de actualizar la orden 50', error);
        throw error
    }
}

export const patchOrden = async (id, dataParcial) => {
    try {
        const response = await fetch(`${BASE_URL}/ordenes/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
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
    try{
        const response = fetch(`${BASE_URL}/ordenes/${id}`,{
            method: 'DELETE',
            headers:getHeaders(),
        })
        if (!response.ok) throw new Error('Error al eliminar fisicamente la orden')
        return true
    }catch (error){
        console.log('Error al eliminar la orden fisicamente', error)
        throw error
    }
}

// --- AUTH HEADERS ---
const getAuthHeaders = async () => {
    const token = await SecureStore.getItemAsync('jwt_access');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// --- CLIENTE ---
export const getMisOrdenes = async () => {
    const headers = await getAuthHeaders();
    // Limpio, sin enviarle datos falsos por la URL
    const response = await fetch(`${BASE_URL}/ordenes/`, { headers }); 
    
    if (!response.ok) throw new Error('Error al traer mis órdenes');
    return response.json();
};

// --- MESERO ---
export const getOrdenesActivas = async () => {
    const headers = await getAuthHeaders();
    // Traer todas y el frontend filtra las que no sean 'pagado' o 'eliminado', o modifica tu viewset en django
    const response = await fetch(`${BASE_URL}/ordenes/`, { headers });
    if (!response.ok) throw new Error('Error al traer órdenes activas');
    return response.json();
};

// --- CAJERO ---
export const getOrdenesFinalizadas = async () => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/ordenes/?estatus=finalizado`, { headers });
    if (!response.ok) throw new Error('Error al traer órdenes para cobrar');
    return response.json();
};

// --- ADMIN ---
export const getTodasLasOrdenes = async (filtro = '', busqueda = '') => {
    const headers = await getAuthHeaders();
    let url = `${BASE_URL}/ordenes/?`;
    if (filtro) url += `estatus=${filtro}&`;
    if (busqueda) url += `search=${busqueda}`; // Requiere configurar esto en tu ViewSet de Django
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error('Error al traer todas las órdenes');
    return response.json();
};

// --- ACCIONES (Para todos los roles) ---
export const cambiarEstadoOrden = async (ordenId, nuevoEstado, datosExtra = {}) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/ordenes/${ordenId}/`, {
        method: 'PATCH',
        headers,
        // Usamos el operador spread (...) para unir el estatus con el mesero_id
        body: JSON.stringify({ estatus: nuevoEstado, ...datosExtra }), 
    });
    if (!response.ok) throw new Error('Error al actualizar el estado');
    return response.json();
};

export const eliminarOrdenCliente = async (ordenId) => {
    const headers = await getAuthHeaders();
    const response = await fetch(`${BASE_URL}/ordenes/${ordenId}/`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ estatus: 'eliminado' }) // Eliminación lógica
    });
    if (!response.ok) throw new Error('Error al eliminar la orden');
};