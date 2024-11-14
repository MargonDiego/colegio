// src/services/intervention.service.js

import api from '@/lib/api/axios-config';
import { ENDPOINTS, API_CONSTANTS } from '@/lib/api/endpoints';

/**
 * Servicio para la gestión de intervenciones y sus comentarios
 */
class InterventionService {
    /**
     * Obtiene la lista de intervenciones con opciones de filtrado
     * @param {Object} options - Opciones de consulta
     * @param {string} [options.status] - Estado de la intervención
     * @param {number} [options.priority] - Prioridad de la intervención
     * @param {number} [options.studentId] - ID del estudiante
     * @param {number} [options.responsibleId] - ID del responsable
     * @param {string} [options.type] - Tipo de intervención
     * @param {string} [options.dateFrom] - Fecha inicial
     * @param {string} [options.dateTo] - Fecha final
     * @returns {Promise<Array>} Lista de intervenciones
     */
    async getAll(options = {}) {
        try {
            const queryParams = this._buildQueryParams(options);
            const response = await api.get(ENDPOINTS.INTERVENTIONS.BASE, { params: queryParams });
            return this._processInterventionList(response);
        } catch (error) {
            console.error('Error fetching interventions:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene una intervención por su ID
     * @param {number} id - ID de la intervención
     * @returns {Promise<Object>} Datos de la intervención
     */
    async getById(id) {
        try {
            const response = await api.get(ENDPOINTS.INTERVENTIONS.DETAIL(id));
            return this._processInterventionData(response);
        } catch (error) {
            console.error(`Error fetching intervention ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Obtiene una intervención con todos sus detalles relacionados
     * @param {number} id - ID de la intervención
     * @returns {Promise<Object>} Intervención con detalles completos
     */
    async getWithDetails(id) {
        try {
            const response = await api.get(ENDPOINTS.INTERVENTIONS.WITH_DETAILS(id));
            return {
                ...this._processInterventionData(response),
                student: response.student,
                informer: response.informer,
                responsible: response.responsible,
                comments: this._processCommentList(response.comments)
            };
        } catch (error) {
            console.error(`Error fetching intervention ${id} with details:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Crea una nueva intervención
     * @param {Object} data - Datos de la intervención
     * @returns {Promise<Object>} Intervención creada
     */
    async create(data) {
        try {
            this._validateInterventionData(data);
            const formattedData = this._formatInterventionData(data);

            const response = await api.post(ENDPOINTS.INTERVENTIONS.CREATE, formattedData);
            return this._processInterventionData(response);
        } catch (error) {
            console.error('Error creating intervention:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Actualiza una intervención existente
     * @param {number} id - ID de la intervención
     * @param {Object} data - Datos a actualizar
     * @returns {Promise<Object>} Intervención actualizada
     */
    async update(id, data) {
        try {
            this._validateInterventionData(data, true);
            const formattedData = this._formatInterventionData(data);

            const response = await api.put(ENDPOINTS.INTERVENTIONS.UPDATE(id), formattedData);
            return this._processInterventionData(response);
        } catch (error) {
            console.error(`Error updating intervention ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Elimina una intervención
     * @param {number} id - ID de la intervención
     * @returns {Promise<void>}
     */
    async delete(id) {
        try {
            await api.delete(ENDPOINTS.INTERVENTIONS.DELETE(id));
        } catch (error) {
            console.error(`Error deleting intervention ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Añade un comentario a una intervención
     * @param {Object} data - Datos del comentario
     * @returns {Promise<Object>} Comentario creado
     */
    async addComment(data) {
        try {
            this._validateCommentData(data);

            const response = await api.post(ENDPOINTS.INTERVENTIONS.COMMENTS.CREATE, {
                content: data.content,
                interventionId: data.interventionId,
                userId: data.userId
            });

            return this._processCommentData(response);
        } catch (error) {
            console.error('Error adding comment:', error);
            throw this._handleError(error);
        }
    }

    /**
     * Actualiza un comentario existente
     * @param {number} id - ID del comentario
     * @param {Object} data - Datos del comentario
     * @returns {Promise<Object>} Comentario actualizado
     */
    async updateComment(id, data) {
        try {
            this._validateCommentData(data);

            const response = await api.put(
                ENDPOINTS.INTERVENTIONS.COMMENTS.UPDATE(id),
                { content: data.content }
            );

            return this._processCommentData(response);
        } catch (error) {
            console.error(`Error updating comment ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Elimina un comentario
     * @param {number} id - ID del comentario
     * @returns {Promise<void>}
     */
    async deleteComment(id) {
        try {
            await api.delete(ENDPOINTS.INTERVENTIONS.COMMENTS.DELETE(id));
        } catch (error) {
            console.error(`Error deleting comment ${id}:`, error);
            throw this._handleError(error);
        }
    }

    /**
     * Procesa los datos de una intervención
     * @private
     */
    _processInterventionData(data) {
        if (!data) return null;

        return {
            ...data,
            dateReported: data.dateReported ? new Date(data.dateReported) : null,
            dateResolved: data.dateResolved ? new Date(data.dateResolved) : null,
            followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
            statusLabel: this._getStatusLabel(data.status),
            priorityLabel: this._getPriorityLabel(data.priority),
            isActive: ['Pendiente', 'En Proceso'].includes(data.status)
        };
    }

    /**
     * Procesa los datos de un comentario
     * @private
     */
    _processCommentData(data) {
        if (!data) return null;

        return {
            ...data,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            formattedDate: data.createdAt ?
                new Date(data.createdAt).toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }) : ''
        };
    }

    /**
     * Construye los parámetros de consulta
     * @private
     */
    _buildQueryParams(options) {
        const params = {};

        if (options.status) params.status = options.status;
        if (options.priority) params.priority = options.priority;
        if (options.studentId) params.studentId = options.studentId;
        if (options.responsibleId) params.responsibleId = options.responsibleId;
        if (options.type) params.type = options.type;
        if (options.dateFrom) params.dateFrom = options.dateFrom;
        if (options.dateTo) params.dateTo = options.dateTo;

        return params;
    }

    /**
     * Valida los datos de la intervención
     * @private
     */
    _validateInterventionData(data, isUpdate = false) {
        const requiredFields = ['title', 'description', 'type', 'priority'];
        if (!isUpdate) {
            requiredFields.push('studentId', 'responsibleId');
        }

        for (const field of requiredFields) {
            if (data[field] === undefined) {
                throw new Error(`El campo ${field} es requerido`);
            }
        }

        if (data.priority && ![1, 2, 3].includes(Number(data.priority))) {
            throw new Error('La prioridad debe ser 1, 2 o 3');
        }

        if (data.status && !Object.values(API_CONSTANTS.INTERVENTION_STATUS).includes(data.status)) {
            throw new Error('Estado de intervención no válido');
        }
    }

    /**
     * Valida los datos de un comentario
     * @private
     */
    _validateCommentData(data) {
        if (!data.content?.trim()) {
            throw new Error('El contenido del comentario es requerido');
        }

        if (!data.interventionId) {
            throw new Error('El ID de la intervención es requerido');
        }
    }

    /**
     * Formatea los datos de la intervención para la API
     * @private
     */
    _formatInterventionData(data) {
        return {
            ...data,
            priority: Number(data.priority),
            dateReported: data.dateReported ? new Date(data.dateReported).toISOString() : new Date().toISOString(),
            dateResolved: data.dateResolved ? new Date(data.dateResolved).toISOString() : null,
            followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null
        };
    }

    /**
     * Obtiene la etiqueta del estado
     * @private
     */
    _getStatusLabel(status) {
        const labels = {
            'Pendiente': 'Pendiente',
            'En Proceso': 'En Proceso',
            'Resuelto': 'Resuelto',
            'Cerrado': 'Cerrado'
        };
        return labels[status] || status;
    }

    /**
     * Obtiene la etiqueta de prioridad
     * @private
     */
    _getPriorityLabel(priority) {
        const labels = {
            1: 'Alta',
            2: 'Media',
            3: 'Baja'
        };
        return labels[priority] || priority;
    }

    /**
     * Procesa una lista de intervenciones
     * @private
     */
    _processInterventionList(response) {
        const interventions = Array.isArray(response) ? response : response.data || [];
        return interventions.map(intervention => this._processInterventionData(intervention));
    }

    /**
     * Procesa una lista de comentarios
     * @private
     */
    _processCommentList(comments = []) {
        return comments.map(comment => this._processCommentData(comment));
    }

    /**
     * Maneja los errores del servicio
     * @private
     */
    _handleError(error) {
        if (error.type === 'ValidationError') {
            return new Error(error.message || 'Error de validación en los datos de la intervención');
        }

        return error;
    }
}

// Exportar una única instancia del servicio
const interventionService = new InterventionService();
export default interventionService;