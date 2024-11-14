// src/lib/api/axios-config.js

import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

/**
 * Interceptor para las peticiones
 * - Agrega el token de autenticación
 * - Maneja el formato de los datos
 */
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener token del almacenamiento local
        const token = localStorage.getItem('token');

        // Si existe token, agregarlo al header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log de desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Request:', {
                url: config.url,
                method: config.method,
                data: config.data,
                headers: config.headers
            });
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

/**
 * Interceptor para las respuestas
 * - Maneja errores comunes de la API
 * - Gestiona la sesión expirada
 * - Formatea las respuestas
 */
axiosInstance.interceptors.response.use(
    (response) => {
        // Log de desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data
            });
        }

        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Manejar errores específicos del backend
        const errorResponse = {
            message: error.response?.data?.error || 'Ha ocurrido un error',
            status: error.response?.status,
            type: error.response?.data?.type || 'Error',
            details: error.response?.data?.details || {}
        };

        // Manejar error de autenticación
        if (error.response?.status === 401) {
            // Si ya estamos en login o es un intento fallido de login, no redirigir
            if (originalRequest.url === '/auth/login' || originalRequest._retry) {
                return Promise.reject(errorResponse);
            }

            // Marcar la petición como reintentada
            originalRequest._retry = true;

            // Limpiar la sesión
            localStorage.removeItem('token');

            // Si estamos en el cliente, redirigir a login
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }

            return Promise.reject(errorResponse);
        }

        // Manejar error de autorización
        if (error.response?.status === 403) {
            errorResponse.message = 'No tiene permisos para realizar esta acción';
        }

        // Manejar error de validación
        if (error.response?.data?.type === 'ValidationError') {
            errorResponse.message = 'Error de validación';
            errorResponse.validationErrors = error.response.data.details;
        }

        // Manejar error de no encontrado
        if (error.response?.status === 404) {
            errorResponse.message = 'Recurso no encontrado';
        }

        // Manejar errores de conexión
        if (error.code === 'ECONNABORTED') {
            errorResponse.message = 'La conexión ha excedido el tiempo de espera';
            errorResponse.type = 'TimeoutError';
        }

        // Manejar errores de red
        if (!error.response) {
            errorResponse.message = 'Error de conexión con el servidor';
            errorResponse.type = 'NetworkError';
        }

        // Log de desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.error('API Error:', {
                config: {
                    url: originalRequest.url,
                    method: originalRequest.method,
                    data: originalRequest.data
                },
                error: errorResponse
            });
        }

        return Promise.reject(errorResponse);
    }
);

// Método helper para verificar si un error es de un tipo específico
axiosInstance.isErrorType = (error, type) => {
    return error?.type === type;
};

// Método helper para verificar si un error es de validación
axiosInstance.isValidationError = (error) => {
    return error?.type === 'ValidationError';
};

// Método helper para obtener los errores de validación
axiosInstance.getValidationErrors = (error) => {
    return error?.validationErrors || {};
};

export default axiosInstance;