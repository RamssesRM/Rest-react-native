import { BASE_URL } from './apiConfig';

const TIMEOUT_MS = 5000;

const fetchWithTimeout = async (url, options = {}, timeout = TIMEOUT_MS) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        return response;
    } finally {
        clearTimeout(timer);
    }
};

export const googleLogin = async (googleToken) => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    });
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (response.ok) {
        return data;
      } else {
        throw new Error(data.error || 'Error al autenticar con Google');
      }
    } catch (parseError) {
      throw new Error('Error del servidor. Intenta de nuevo.');
    }
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('No se pudo conectar con el servidor');
    throw error;
  }
};

export const loginUser = async (username, password)=>{
    try{
        const response = await fetchWithTimeout(`${BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok){
            return data
        }else{
            let mensajeError = 'Credenciales inválidas'
            if (data.non_field_errors && data.non_field_errors.length > 0) {
                mensajeError = data.non_field_errors[0];
            } 
            else if (data.detail) {
                mensajeError = Array.isArray(data.detail) ? data.detail[0] : data.detail;
            }
            else if (data.username) {
                mensajeError = Array.isArray(data.username) ? data.username[0] : data.username;
            }
            throw new Error(mensajeError);
        }
    }catch(error){
        if (error.name === 'AbortError') throw new Error('No se pudo conectar con el servidor');
        throw error
    }
};

export const resetPassword = async (email) => {
    try {
        const response = await fetch(`${API_URL}/auth/password-reset/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            throw new Error(data.error || data.detail || 'No se pudo enviar el correo de recuperación');
        }
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try{
        const response = await fetchWithTimeout(`${BASE_URL}/auth/registro/`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(userData),
        });
        const data = await response.json();
        if(response.ok){
            return data
        }else{
            if(data.username) throw new Error(data.username[0])
            if(data.email) throw new Error(data.email[0])
            if(data.password) throw new Error(data.password[0])
            throw new Error('Error al registrar')
        }
    }catch(error){
        if (error.name === 'AbortError') throw new Error('No se pudo conectar con el servidor');
        throw error
    }
}
