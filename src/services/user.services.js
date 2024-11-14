// src/services/user.service.js

import api from '@/lib/api/axios-config';
import { ENDPOINTS, API_CONSTANTS } from '@/lib/api/endpoints';

/**
 * Servicio para la gestión de usuarios del sistema
 */
class UserService {
    /**
     * Obtiene la lista de usuarios con opciones de filtrado
     * @param {Object} options - Opciones de consulta
     * @param {string} [options.search] - Búsqueda por nombre o email
     * @param {string} [options.role] - Filtro por rol
     * @param {string} [options.staffType] - Tipo de personal
     * @param {boolean} [options.isActive] - Estado del usuario
     * @param {string} [options.department] - Departamento
     * @returns {Promise<Array>} Lista de usuarios
     */
    async getAll(options = {}) {
        try {
            const queryParams = this._buildQueryParams(options);
            const response = await api.get(ENDPOINTS.USERS.BASE, { params: queryParams });
            return this._processUserList(response);
        } catch (error) {
            console.error('Error fetching users:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene un usuario por su ID
     * @param {number} id - ID del usuario
     * @returns {Promise<Object>} Datos del usuario
     */
    async getById(id) {
        try {
            const response = await api.get(ENDPOINTS.USERS.DETAIL(id));
            return this._processUserData(response);
        } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Crea un nuevo usuario
     * @param {Object} userData - Datos del usuario
     * @returns {Promise<Object>} Usuario creado
     */
    async create(userData) {
        try {
            this._validateUserData(userData);
            const formattedData = this._formatUserData(userData);

            const response = await api.post(ENDPOINTS.USERS.CREATE, formattedData);
            return this._processUserData(response);
        } catch (error) {
            console.error('Error creating user:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Actualiza un usuario existente
     * @param {number} id - ID del usuario
     * @param {Object} userData - Datos a actualizar
     * @returns {Promise<Object>} Usuario actualizado
     */
    async update(id, userData) {
        try {
            this._validateUserData(userData, true);
            const formattedData = this._formatUserData(userData);

            const response = await api.put(ENDPOINTS.USERS.UPDATE(id), formattedData);
            return this._processUserData(response);
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Elimina un usuario
     * @param {number} id - ID del usuario
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await api.delete(ENDPOINTS.USERS.DELETE(id));
        } catch (error) {
            console.error(`Error deleting user ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene los profesionales disponibles para asignar intervenciones
     * @returns {Promise<Array>} Lista de profesionales
     */
    async getProfessionals() {
        try {
            const response = await this.getAll({
                role: ['profesional', 'profesor'],
                isActive: true
            });
            return response;
        } catch (error) {
            console.error('Error fetching professionals:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene los profesores activos
     * @returns {Promise<Array>} Lista de profesores
     */
    async getTeachers() {
        try {
            const response = await this.getAll({
                role: 'profesor',
                isActive: true
            });
            return response;
        } catch (error) {
            console.error('Error fetching teachers:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Actualiza el estado activo/inactivo de un usuario
     * @param {number} id - ID del usuario
     * @param {boolean} isActive - Nuevo estado
     * @returns {Promise<Object>} Usuario actualizado
     */
    async updateStatus(id, isActive) {
        try {
            const response = await this.update(id, { isActive });
            return this._processUserData(response);
        } catch (error) {
            console.error(`Error updating user status ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Construye los parámetros de consulta
     * @private
     */
    _buildQueryParams(options) {
        const params = {};

        if (options.search) params.search = options.search;
        if (options.role) params.role = options.role;
        if (options.staffType) params.staffType = options.staffType;
        if (options.isActive !== undefined) params.isActive = options.isActive;
        if (options.department) params.department = options.department;

        return params;
    }

    /**
     * Valida los datos del usuario
     * @private
     */
    _validateUserData(data, isUpdate = false) {
        const requiredFields = ['firstName', 'lastName', 'email', 'rut', 'role'];

        if (!isUpdate) {
            requiredFields.push('password');
        }

        // Validar campos requeridos
        for (const field of requiredFields) {
            if (data[field] !== undefined && data[field] !== null) {
                if (typeof data[field] === 'string' && !data[field].trim()) {
                    throw new Error(`El campo ${field} no puede estar vacío`);
                }
            } else if (!isUpdate) {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        // Validar email
        if (data.email && !this._validateEmail(data.email)) {
            throw new Error('El formato del email no es válido');
        }

        // Validar RUT
        if (data.rut && !this._validateRut(data.rut)) {
            throw new Error('El formato del RUT no es válido');
        }

        // Validar rol
        if (data.role && !this._isValidRole(data.role)) {
            throw new Error('El rol especificado no es válido');
        }

        // Validar contraseña si se proporciona
        if (data.password && data.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
        }
    }

    /**
     * Formatea los datos del usuario para la API
     * @private
     */
    _formatUserData(data) {
        return {
            ...data,
            rut: data.rut?.replace(/\./g, '').replace(/-/g, ''),
            email: data.email?.toLowerCase().trim(),
            birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
            hireDate: data.hireDate ? new Date(data.hireDate).toISOString() : undefined,
            isActive: data.isActive !== undefined ? data.isActive : true
        };
    }

    /**
     * Procesa los datos de un usuario
     * @private
     */
    _processUserData(data) {
        if (!data) return null;

        return {
            ...data,
            fullName: `${data.firstName} ${data.lastName}`,
            displayRut: this._formatRut(data.rut),
            roleLabel: this._getRoleLabel(data.role),
            birthDate: data.birthDate ? new Date(data.birthDate) : null,
            hireDate: data.hireDate ? new Date(data.hireDate) : null,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : null
        };
    }

    /**
     * Procesa una lista de usuarios
     * @private
     */
    _processUserList(response) {
        const users = Array.isArray(response) ? response : response.data || [];
        return users.map(user => this._processUserData(user));
    }

    /**
     * Valida un email
     * @private
     */
    _validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Valida un RUT chileno
     * @private
     */
    _validateRut(rut) {
        return /^[0-9]{7,8}-[0-9Kk]{1}$/.test(rut);
    }

    /**
     * Formatea un RUT
     * @private
     */
    _formatRut(rut) {
        if (!rut) return '';
        // Implementar lógica de formateo de RUT (XX.XXX.XXX-X)
        return rut;
    }

    /**
     * Verifica si un rol es válido
     * @private
     */
    _isValidRole(role) {
        return Object.values(API_CONSTANTS.ROLES).includes(role);
    }

    /**
     * Obtiene la etiqueta de un rol
     * @private
     */
    _getRoleLabel(role) {
        const labels = {
            'admin': 'Administrador',
            'director': 'Director',
            'profesor': 'Profesor',
            'profesional': 'Profesional'
        };
        return labels[role] || role;
    }

    /**
     * Maneja los errores del servicio
     * @private
     */
    _handleError(error) {
        if (error.type === 'ValidationError') {
            return new Error(error.message || 'Error de validación en los datos del usuario');
        }

        // Error de email duplicado
        if (error.message?.includes('email')) {
            return new Error('Ya existe un usuario con ese email');
        }

        // Error de RUT duplicado
        if (error.message?.includes('RUT')) {
            return new Error('Ya existe un usuario con ese RUT');
        }

        return error;
    }
}

// Exportar una única instancia del servicio
const userService = new UserService();
export default userService;