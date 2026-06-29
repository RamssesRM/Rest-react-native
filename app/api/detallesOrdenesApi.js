import { BASE_URL, getHeaders } from "./apiConfig";

// Esta funcion trae todas las categorias de django
export const tomarDetallesOrdenes = async () => {
    try{
        const response = await fetch(`${BASE_URL}/detalles/`);
        if (!response.ok) throw new Error('Error al traer las detalles 6');
    }catch (error){
        console.log('Error al traer todas las detalles 8', error);
        throw error;
    }
};

// Esta funcion trae la categoria cuando se inserte un id, se utiliza más que todo cuando se vaya a editar para llenar los campos que se van a modificar y hacerla más dinámica
export const tomarDetalleOrdenConId = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}/detalles/${id}/`);
        if (!response.ok) throw new Error('Error al traer la orden 18');
    }catch (error){
        console.log('Error al traer la orden 20', error);
        throw error;
    }
}

export const tomarDetalleOrdenConUsuario = async (usuario_id) => {
    try{
        const response = fetch(`${BASE_URL}/detalles/?usuario_fk_id=${usuario_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar la orden con el usuario que lo agregó', error)
        throw error
    }
}

export const tomarDetalleOrdenConProducto = async (producto_id) => {
    try{
        const response = fetch(`${BASE_URL}/detalles/?producto_fk_id=${producto_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar la orden con el usuario que lo agregó', error)
        throw error
    }
}

// Esto guarda la categoria al momento de pasarle un objeto que el django acepte, si no lo acepta o no cumple con los modelos y los serializadores de django no va a guardar la informacion
export const crearDetalleOrden = async (Data) => {
    try{
        const response = await fetch(`${BASE_URL}/detalles/`, {
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

export const actualizarDetalleOrden = async (id, Data) => {
    try{
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, {
            method : 'PUT',
            headers: getHeaders,
            body:JSON.stringify(Data),
        })
        if (!response.ok) throw new Error('Error actualizando la orden 48')
        return await response.json
    }catch (error){
        console.log('Error al momento de actualizar la orden 50', error);
        throw error
    }
}

export const patchDetalleOrden = async (id, dataParcial) => {
    try {
        const response = await fetch(`${BASE_URL}/detalles/${id}/`, {
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

export const eliminarDetalleOrden = async (id) => {
    try{
        const response = fetch(`${BASE_URL}/detalles/${id}`,{
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