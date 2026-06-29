import { BASE_URL, getHeaders } from "./apiConfig";

// Esta funcion trae todas las categorias de django
export const tomarMesas = async () => {
    try{
        const response = await fetch(`${BASE_URL}/mesas/`);
        if (!response.ok) throw new Error('Error al traer las mesas 6');
    }catch (error){
        console.log('Error al traer todas las mesas 8', error);
        throw error;
    }
};

// Esta funcion trae la categoria cuando se inserte un id, se utiliza más que todo cuando se vaya a editar para llenar los campos que se van a modificar y hacerla más dinámica
export const tomarMesaConId = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}/mesas/${id}/`);
        if (!response.ok) throw new Error('Error al traer la mesa 18');
    }catch (error){
        console.log('Error al traer la mesa 20', error);
        throw error;
    }
}

// Esto guarda la categoria al momento de pasarle un objeto que el django acepte, si no lo acepta o no cumple con los modelos y los serializadores de django no va a guardar la informacion
export const crearMesa = async (Data) => {
    try{
        const response = await fetch(`${BASE_URL}/mesas/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(Data),
        });
        if (!response.ok) throw new Error('Error al guardar la mesa 32')
            return await response.json();
    }catch (error){
        console.log('Error al momento de crear la mesa 36', error);
        throw error;
    }
}

export const actualizarMesa = async (id, Data) => {
    try{
        const response = await fetch(`${BASE_URL}/mesas/${id}/`, {
            method : 'PUT',
            headers: getHeaders,
            body:JSON.stringify(Data),
        })
        if (!response.ok) throw new Error('Error actualizando la mesa 48')
        return await response.json
    }catch (error){
        console.log('Error al momento de actualizar la mesa 50', error);
        throw error
    }
}

export const patchMesa = async (id, dataParcial) => {
    try {
        const response = await fetch(`${BASE_URL}/mesas/${id}/`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(dataParcial),
        });
        if (!response.ok) throw new Error('Error al modificar la mesa');
        return await response.json();
    } catch (error) {
        console.error('Error en PATCH:', error);
        throw error;
    }
};

export const eliminarMesa = async (id) => {
    try{
        const response = fetch(`${BASE_URL}/mesas/${id}`,{
            method: 'DELETE',
            headers:getHeaders(),
        })
        if (!response.ok) throw new Error('Error al eliminar fisicamente la mesa')
        return true
    }catch (error){
        console.log('Error al eliminar la mesa fisicamente', error)
        throw error
    }
}