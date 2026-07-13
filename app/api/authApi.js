const API_URL = 'http://10.0.2.2:8000/api';

export const googleLogin = async (googleToken) => {
  try {
    const response = await fetch(`${API_URL}/auth/google/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: googleToken }),
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.error || 'Error al autenticar con Google');
    }
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            let mensajeError = 'Credenciales inválidas';
            if (data.non_field_errors && data.non_field_errors.length > 0) {
                mensajeError = data.non_field_errors[0];
            } else if (data.detail) {
                mensajeError = Array.isArray(data.detail) ? data.detail[0] : data.detail;
            } else if (data.username) {
                mensajeError = Array.isArray(data.username) ? data.username[0] : data.username;
            }
            throw new Error(mensajeError);
        }
    } catch (error) {
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/auth/registro/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        const data = await response.json();
        if (response.ok) {
            return data;
        } else {
            if (data.username) throw new Error(data.username[0]);
            if (data.email) throw new Error(data.email[0]);
            if (data.password) throw new Error(data.password[0]);
            throw new Error('Error al registrar');
        }
    } catch (error) {
        throw error;
    }
};
