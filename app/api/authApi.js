const API_URL = 'http://127.0.0.1:8000/api';

export const loginUser = async (username, password)=>{
    try{
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: {'Content-Type':'aplication/json'},
            body:JSON.stringify({username, password}),
        });
        const data = await response.json();
        if (response.ok){
            return data
        }else{
            throw new Error(data.detail || 'Credenciales inválidas');
        }
    }catch(error){
        throw error
    }
}

export const registerUser = async (userData) => {
    try{
        const response = await fetch(`${API_URL}/auth/registro/`,{
            method:'POST',
            headers:{'Content-Type':'aplication/json'},
            body:JSON.stringify(userData),
        });
        const data = await response.json();
        if(response.ok){
            return data
        }else{
            // Esto es para manejar errores que vengan de django
            if(data.username) throw new Error(data.username[0])
            if(data.email) throw new Error(data.username[0])
            if(data.password) throw new Error(data.password[0])
            throw new Error('Error al registrar')
        }
    }catch(error){
        throw error
    }
}