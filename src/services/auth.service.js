// src/services/auth.service.js

import api from '@/lib/api/axios-config';
import { ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Servicio para manejar la autenticación y autorización de usuarios
 */
class AuthService {
    constructor() {
        this.tokenKey = 'token';
        this.userKey = 'user';
    }

    /**
     * Realiza el login del usuario
     * @param {Object} credentials - Credenciales del usuario
     * @param {string} credentials.email - Email del usuario
     * @param {string} credentials.password - Contraseña del usuario
     * @returns {Promise<Object>} Datos del usuario y token
     * @throws {Error} Error de autenticación
     */
    async login(credentials) {
        try {
            const response = await api.post(ENDPOINTS.AUTH.LOGIN, credentials);

            if (response.token) {
                // Guardar token
                this.setToken(response.token);

                // Guardar datos del usuario
                this.setUser(response.user);

                return {
                    user: response.user,
                    token: response.token
                };
            }

            throw new Error('Token no recibido del servidor');
        } catch (error) {
            // Limpiar datos en caso de error
            this.clearSession();
            throw error;
        }
    }

    /**
     * Cierra la sesión del usuario
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            // Intentar hacer logout en el servidor
            await api.post(ENDPOINTS.AUTH.LOGOUT);
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar sesión local independientemente de la respuesta del servidor
            this.clearSession();
        }
    }

    /**
     * Obtiene el perfil del usuario actual
     * @returns {Promise<Object>} Datos del usuario
     */
    async getProfile() {
        try {
            const user = await api.get(ENDPOINTS.AUTH.PROFILE);
            this.setUser(user);
            return user;
        } catch (error) {
            // Si hay error al obtener el perfil, podría indicar sesión inválida
            if (error.status === 401) {
                this.clearSession();
            }
            throw error;
        }
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Verifica si el usuario actual tiene un rol específico
     * @param {string|string[]} roles - Rol o roles a verificar
     * @returns {boolean}
     */
    hasRole(roles) {
        const user = this.getUser();
        if (!user || !user.role) return false;

        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    }

    /**
     * Obtiene el token actual
     * @returns {string|null}
     */
    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.tokenKey);
        }
        return null;
    }

    /**
     * Establece el token de autenticación
     * @param {string} token
     */
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.tokenKey, token);
        }
    }

    /**
     * Obtiene los datos del usuario actual
     * @returns {Object|null}
     */
    getUser() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem(this.userKey);
            try {
                return userStr ? JSON.parse(userStr) : null;
            } catch (e) {
                console.error('Error parsing user data:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Establece los datos del usuario
     * @param {Object} user
     */
    setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.userKey, JSON.stringify(user));
        }
    }

    /**
     * Limpia todos los datos de sesión
     */
    clearSession() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
        }
    }

    /**
     * Verifica si el token actual está expirado
     * @returns {boolean}
     */
    isTokenExpired() {
        const token = this.getToken();
        if (!token) return true;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expirationTime = payload.exp * 1000; // Convertir a milisegundos
            return Date.now() >= expirationTime;
        } catch (e) {
            console.error('Error checking token expiration:', e);
            return true;
        }
    }

    /**
     * Verifica si el usuario tiene permisos activos
     * @returns {boolean}
     */
    hasValidPermissions() {
        const user = this.getUser();
        return user && user.isActive && !this.isTokenExpired();
    }
}

// Exportar una única instancia del servicio
const authService = new AuthService();
export default authService;