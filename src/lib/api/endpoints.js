// src/lib/api/endpoints.js

/**
 * Definición de endpoints de la API
 * Basado en la configuración del backend (routes.js)
 */
export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/profile'
    },

    USERS: {
        BASE: '/users',
        DETAIL: (id) => `/users/${id}`,
        CREATE: '/users',
        UPDATE: (id) => `/users/${id}`,
        DELETE: (id) => `/users/${id}`
    },

    STUDENTS: {
        BASE: '/students',
        DETAIL: (id) => `/students/${id}`,
        WITH_INTERVENTIONS: (id) => `/students/${id}/with-interventions`,
        CREATE: '/students',
        UPDATE: (id) => `/students/${id}`,
        DELETE: (id) => `/students/${id}`
    },

    INTERVENTIONS: {
        BASE: '/interventions',
        DETAIL: (id) => `/interventions/${id}`,
        WITH_DETAILS: (id) => `/interventions/${id}/details`,
        CREATE: '/interventions',
        UPDATE: (id) => `/interventions/${id}`,
        DELETE: (id) => `/interventions/${id}`,
        COMMENTS: {
            BASE: '/intervention-comments',
            CREATE: '/intervention-comments',
            UPDATE: (id) => `/intervention-comments/${id}`,
            DELETE: (id) => `/intervention-comments/${id}`
        }
    }
};

/**
 * Constantes para valores utilizados en las peticiones
 */
export const API_CONSTANTS = {
    ROLES: {
        ADMIN: 'admin',
        PROFESOR: 'profesor',
        PROFESIONAL: 'profesional'
    },

    INTERVENTION_STATUS: {
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En Proceso',
        RESOLVED: 'Resuelto',
        CLOSED: 'Cerrado'
    },

    INTERVENTION_PRIORITY: {
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3
    },

    INTERVENTION_TYPES: [
        'Comportamiento',
        'Académico',
        'Asistencia',
        'Salud',
        'Familiar',
        'Social',
        'Emocional',
        'Otro'
    ],

    STUDENT_TYPES: {
        REGULAR: 'Regular',
        INTEGRATION: 'Programa Integración'
    },

    INTERVENTION_SCOPE: {
        INDIVIDUAL: 'Individual',
        GROUP: 'Grupal',
        FAMILY: 'Familiar'
    }
};

/**
 * Helper functions para construcción de URLs
 */
export const API_HELPERS = {
    /**
     * Construye una URL con query params
     * @param {string} endpoint - Endpoint base
     * @param {Object} params - Objeto con los query params
     * @returns {string} URL completa con query params
     */
    buildUrl: (endpoint, params = {}) => {
        const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_URL);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        return url.pathname + url.search;
    },

    /**
     * Verifica si un usuario tiene un rol específico
     * @param {Object} user - Usuario actual
     * @param {string|string[]} roles - Rol o roles a verificar
     * @returns {boolean}
     */
    hasRole: (user, roles) => {
        if (!user || !user.role) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    },

    /**
     * Verifica si un usuario puede realizar acciones sobre una intervención
     * @param {Object} user - Usuario actual
     * @param {Object} intervention - Intervención a verificar
     * @returns {boolean}
     */
    canManageIntervention: (user, intervention) => {
        if (!user || !intervention) return false;

        // Admins y directores pueden gestionar todas las intervenciones
        if ([API_CONSTANTS.ROLES.ADMIN, API_CONSTANTS.ROLES.DIRECTOR].includes(user.role)) {
            return true;
        }

        // Profesionales y profesores solo pueden gestionar sus propias intervenciones
        return intervention.responsibleId === user.id || intervention.informerId === user.id;
    }
};