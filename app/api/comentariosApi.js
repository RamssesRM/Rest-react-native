import { BASE_URL, getHeaders } from "./apiConfig";

// Esta funcion trae todas las categorias de django
export const tomarComentarios = async () => {
    try{
        const response = await fetch(`${BASE_URL}/comentarios/`);
        if (!response.ok) throw new Error('Error al traer las comentarios 6');
    }catch (error){
        console.log('Error al traer todas las comentarios 8', error);
        throw error;
    }
};

// Esta funcion trae la categoria cuando se inserte un id, se utiliza más que todo cuando se vaya a editar para llenar los campos que se van a modificar y hacerla más dinámica
export const tomarComentarioConId = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}/comentarios/${id}/`);
        if (!response.ok) throw new Error('Error al traer el comentario 18');
    }catch (error){
        console.log('Error al traer el comentario 20', error);
        throw error;
    }
}

export const tomarComentarioConUsuario = async (usuario_id) => {
    try{
        const response = fetch(`${BASE_URL}/comentarios/?categoria_fk_id=${usuario_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar el comentario con el usuario que lo agregó', error)
        throw error
    }
}

export const tomarComentarioConCliente = async (cliente_id) => {
    try{
        const response = fetch(`${BASE_URL}/comentarios/?categoria_fk_id=${cliente_id}`)
        if (!response.ok) throw new Error ('Error trayendo la ')
    }catch (error){
        console.log('Error al tomar el comentario con el usuario que lo agregó', error)
        throw error
    }
}

// Esto guarda la categoria al momento de pasarle un objeto que el django acepte, si no lo acepta o no cumple con los modelos y los serializadores de django no va a guardar la informacion
export const crearComentario = async (Data) => {
    try{
        const response = await fetch(`${BASE_URL}/comentarios/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el comentario 32')
            return await response.json();
    }catch (error){
        console.log('Error al momento de crear el comentario 36', error);
        throw error;
    }
}

export const actualizarComentario = async (id, Data) => {
    try{
        const response = await fetch(`${BASE_URL}/comentarios/${id}/`, {
            method : 'PUT',
            headers: getHeaders,
            body:JSON.stringify(Data),
        })
        if (!response.ok) throw new Error('Error actualizando el comentario 48')
        return await response.json
    }catch (error){
        console.log('Error al momento de actualizar el comentario 50', error);
        throw error
    }
}

export const patchComentario = async (id, dataParcial) => {
    try {
        const response = await fetch(`${BASE_URL}/comentarios/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el comentario');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarComentario = async (id) => {
    try{
        const response = fetch(`${BASE_URL}/comentarios/${id}`,{
            method: 'DELETE',
            headers:getHeaders(),
        })
        if (!response.ok) throw new Error('Error al eliminar fisicamente el comentario')
        return true
    }catch (error){
        console.log('Error al eliminar el comentario fisicamente', error)
        throw error
    }
}