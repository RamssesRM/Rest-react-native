import { BASE_URL, getHeaders } from "./apiConfig";

// Esta funcion trae todas las categorias de django
export const tomarUsuarios = async () => {
    try{
        const response = await fetch(`${BASE_URL}/usuarios/`);
        if (!response.ok) throw new Error('Error al traer las usuarios 6');
    }catch (error){
        console.log('Error al traer todas las usuarios 8', error);
        throw error;
    }
};

// Esta funcion trae la categoria cuando se inserte un id, se utiliza más que todo cuando se vaya a editar para llenar los campos que se van a modificar y hacerla más dinámica
export const tomarUsuarioConId = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}/usuarios/${id}/`);
        if (!response.ok) throw new Error('Error al traer el usuario 18');
    }catch (error){
        console.log('Error al traer el usuario 20', error);
        throw error;
    }
}

// Esto guarda la categoria al momento de pasarle un objeto que el django acepte, si no lo acepta o no cumple con los modelos y los serializadores de django no va a guardar la informacion
export const crearUsuario = async (Data) => {
    try{
        const response = await fetch(`${BASE_URL}/usuarios/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar el usuario 32')
            return await response.json();
    }catch (error){
        console.log('Error al momento de crear el usuario 36', error);
        throw error;
    }
}

export const actualizarUsuario = async (id, Data) => {
    try{
        const response = await fetch(`${BASE_URL}/usuarios/${id}/`, {
            method : 'PUT',
            headers: getHeaders,
            body:JSON.stringify(Data),
        })
        if (!response.ok) throw new Error('Error actualizando el usuario 48')
        return await response.json
    }catch (error){
        console.log('Error al momento de actualizar el usuario 50', error);
        throw error
    }
}

export const patchUsuario = async (id, dataParcial) => {
    try {
        const response = await fetch(`${BASE_URL}/usuarios/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar el usuario');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarUsuario = async (id) => {
    try{
        const response = fetch(`${BASE_URL}/usuarios/${id}`,{
            method: 'DELETE',
            headers:getHeaders(),
        })
        if (!response.ok) throw new Error('Error al eliminar fisicamente el usuario')
        return true
    }catch (error){
        console.log('Error al eliminar la mesa fisicamente', error)
        throw error
    }
}