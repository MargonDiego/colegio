// src/config/auth.config.js

/**
 * Configuración del sistema de autenticación y autorización
 */
const AUTH_CONFIG = {
    /**
     * Roles disponibles en el sistema
     * Corresponden exactamente con los roles definidos en la base de datos
     */
    ROLES: {
        ADMIN: 'admin',
        PROFESOR: 'profesor',
        PROFESIONAL: 'profesional'
    },

    /**
     * Configuración de rutas por defecto según rol
     * Define a dónde será redirigido cada usuario después del login
     */
    ROUTES: {
        // Ruta por defecto para usuarios no autenticados
        DEFAULT: '/auth/login',

        // Rutas específicas por rol
        ROLE_PATHS: {
            admin: '/dashboard',      // Panel principal para administradores
            profesor: '/dashboard',   // Panel principal para profesores
            profesional: '/dashboard' // Panel principal para profesionales
        }
    },

    /**
     * Configuración de permisos por rol
     * Define las capacidades de cada rol en el sistema
     */
    PERMISSIONS: {
        admin: {
            // Usuarios
            canCreateUsers: true,
            canEditUsers: true,
            canDeleteUsers: true,
            canViewAllUsers: true,

            // Estudiantes
            canCreateStudents: true,
            canEditStudents: true,
            canDeleteStudents: true,
            canViewAllStudents: true,

            // Intervenciones
            canCreateInterventions: true,
            canEditInterventions: true,
            canDeleteInterventions: true,
            canViewAllInterventions: true
        },

        profesor: {
            // Estudiantes
            canCreateStudents: true,
            canEditStudents: true,
            canViewAllStudents: true,

            // Intervenciones
            canCreateInterventions: true,
            canEditInterventions: true,
            canViewOwnInterventions: true,
            canViewAssignedInterventions: true
        },

        profesional: {
            // Estudiantes
            canViewAllStudents: true,

            // Intervenciones
            canCreateInterventions: true,
            canEditInterventions: true,
            canViewOwnInterventions: true,
            canViewAssignedInterventions: true
        }
    },

    /**
     * Etiquetas descriptivas para los roles
     * Utilizadas para mostrar en la interfaz de usuario
     */
    ROLE_LABELS: {
        admin: 'Administrador',
        profesor: 'Profesor',
        profesional: 'Profesional'
    },

    /**
     * Configuración de tokens y sesión
     */
    TOKEN: {
        STORAGE_KEY: 'token',
        HEADER_NAME: 'Authorization',
        PREFIX: 'Bearer'
    },

    /**
     * Rutas públicas que no requieren autenticación
     */
    PUBLIC_PATHS: [
        '/auth/login',
        '/auth/forgot-password'
    ]
};

/**
 * Helpers para manejar roles y permisos
 */
export const AuthHelpers = {
    /**
     * Obtiene la ruta por defecto para un rol específico
     * @param {string} role - Rol del usuario
     * @returns {string} Ruta por defecto
     */
    getDefaultRoute(role) {
        return AUTH_CONFIG.ROUTES.ROLE_PATHS[role] || AUTH_CONFIG.ROUTES.DEFAULT;
    },

    /**
     * Verifica si un rol es válido
     * @param {string} role - Rol a verificar
     * @returns {boolean}
     */
    isValidRole(role) {
        return Object.values(AUTH_CONFIG.ROLES).includes(role);
    },

    /**
     * Obtiene la etiqueta descriptiva de un rol
     * @param {string} role - Rol del usuario
     * @returns {string} Etiqueta del rol
     */
    getRoleLabel(role) {
        return AUTH_CONFIG.ROLE_LABELS[role] || role;
    },

    /**
     * Verifica si un rol tiene un permiso específico
     * @param {string} role - Rol del usuario
     * @param {string} permission - Permiso a verificar
     * @returns {boolean}
     */
    hasPermission(role, permission) {
        return !!AUTH_CONFIG.PERMISSIONS[role]?.[permission];
    },

    /**
     * Verifica si una ruta es pública
     * @param {string} path - Ruta a verificar
     * @returns {boolean}
     */
    isPublicPath(path) {
        return AUTH_CONFIG.PUBLIC_PATHS.some(publicPath =>
            path.startsWith(publicPath)
        );
    }
};

export default AUTH_CONFIG;