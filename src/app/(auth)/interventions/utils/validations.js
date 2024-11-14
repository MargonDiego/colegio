/**
 * Utilidades de validación para el módulo de intervenciones
 * Alineadas con la estructura de la base de datos
 */

import {
    INTERVENTION_STATUS,
    PRIORITY_LEVELS,
    INTERVENTION_TYPES,
    INTERVENTION_SCOPES,
    VALID_STATUS_TRANSITIONS,
    CHAR_LIMITS,
    REQUIRED_FIELDS,
    STATUS_PERMISSIONS
} from './constants';

/**
 * Valida los datos de una intervención
 * @param {Object} data - Datos a validar
 * @param {boolean} isUpdate - Indica si es una actualización
 * @returns {Object} Errores encontrados
 */
export const validateInterventionData = (data, isUpdate = false) => {
    const errors = {};

    // Validar campos requeridos
    const requiredFields = isUpdate ? REQUIRED_FIELDS.UPDATE : REQUIRED_FIELDS.CREATE;

    requiredFields.forEach(field => {
        if (!data[field]?.toString().trim()) {
            errors[field] = `El campo ${field} es requerido`;
        }
    });

    // Validar longitud de campos de texto
    if (data.title && data.title.length > CHAR_LIMITS.TITLE) {
        errors.title = `El título no puede exceder ${CHAR_LIMITS.TITLE} caracteres`;
    }

    if (data.description && data.description.length > CHAR_LIMITS.DESCRIPTION) {
        errors.description = `La descripción no puede exceder ${CHAR_LIMITS.DESCRIPTION} caracteres`;
    }

    // Validar tipo de intervención
    if (data.type && !INTERVENTION_TYPES.includes(data.type)) {
        errors.type = 'Tipo de intervención no válido';
    }

    // Validar prioridad
    if (data.priority && !Object.values(PRIORITY_LEVELS).includes(Number(data.priority))) {
        errors.priority = 'Prioridad no válida';
    }

    // Validar estado y transiciones
    if (data.status) {
        if (!Object.values(INTERVENTION_STATUS).includes(data.status)) {
            errors.status = 'Estado no válido';
        } else if (isUpdate && data.currentStatus) {
            const validTransitions = VALID_STATUS_TRANSITIONS[data.currentStatus];
            if (!validTransitions.includes(data.status)) {
                errors.status = 'Transición de estado no válida';
            }
        }
    }

    // Validar ámbito
    if (data.interventionScope && !Object.values(INTERVENTION_SCOPES).includes(data.interventionScope)) {
        errors.interventionScope = 'Ámbito de intervención no válido';
    }

    // Validar fechas
    if (data.followUpDate) {
        const followUp = new Date(data.followUpDate);
        const now = new Date();
        if (followUp < now) {
            errors.followUpDate = 'La fecha de seguimiento no puede ser anterior a hoy';
        }
    }

    // Validar campos condicionales
    if (data.requiresExternalReferral) {
        if (!data.externalReferralDetails?.trim()) {
            errors.externalReferralDetails = 'Los detalles de la derivación son requeridos';
        } else if (data.externalReferralDetails.length > CHAR_LIMITS.REFERRAL_DETAILS) {
            errors.externalReferralDetails = `Los detalles no pueden exceder ${CHAR_LIMITS.REFERRAL_DETAILS} caracteres`;
        }
    }

    // Validar arrays
    if (data.actionsTaken) {
        if (!Array.isArray(data.actionsTaken)) {
            errors.actionsTaken = 'El formato de las acciones tomadas no es válido';
        } else {
            const invalidActions = data.actionsTaken.some(
                action => action.length > CHAR_LIMITS.ACTIONS_TAKEN
            );
            if (invalidActions) {
                errors.actionsTaken = `Cada acción no puede exceder ${CHAR_LIMITS.ACTIONS_TAKEN} caracteres`;
            }
        }
    }

    return errors;
};

/**
 * Valida un comentario
 * @param {Object} data - Datos del comentario
 * @returns {Object} Errores encontrados
 */
export const validateComment = (data) => {
    const errors = {};

    if (!data.content?.trim()) {
        errors.content = 'El contenido es requerido';
    } else if (data.content.length > CHAR_LIMITS.COMMENT) {
        errors.content = `El comentario no puede exceder ${CHAR_LIMITS.COMMENT} caracteres`;
    }

    if (!data.interventionId) {
        errors.interventionId = 'El ID de la intervención es requerido';
    }

    if (!data.userId) {
        errors.userId = 'El ID del usuario es requerido';
    }

    return errors;
};

/**
 * Verifica si un usuario puede modificar una intervención
 * @param {Object} intervention - Intervención a verificar
 * @param {Object} user - Usuario actual
 * @returns {boolean}
 */
export const canModifyIntervention = (intervention, user) => {
    if (!intervention || !user) return false;

    // Verificar permisos según estado
    const statePermissions = STATUS_PERMISSIONS[intervention.status];
    if (!statePermissions) return false;

    // Verificar si el usuario tiene el rol adecuado
    if (Array.isArray(statePermissions.canEdit)) {
        if (!statePermissions.canEdit.includes(user.role)) {
            return false;
        }
    }

    // El usuario debe ser el responsable o el informante
    return (
        user.role === 'admin' ||
        intervention.responsibleId === user.id ||
        intervention.informerId === user.id
    );
};

/**
 * Verifica si un usuario puede añadir comentarios
 * @param {Object} intervention - Intervención a verificar
 * @param {Object} user - Usuario actual
 * @returns {boolean}
 */
export const canAddComments = (intervention, user) => {
    if (!intervention || !user) return false;

    const permissions = STATUS_PERMISSIONS[intervention.status];
    return permissions?.canAddComments === true;
};

/**
 * Verifica si un cambio de estado es válido
 * @param {string} currentStatus - Estado actual
 * @param {string} newStatus - Nuevo estado
 * @param {Object} user - Usuario que intenta el cambio
 * @returns {boolean}
 */
export const isValidStatusChange = (currentStatus, newStatus, user) => {
    if (!currentStatus || !newStatus || !user) return false;

    // Verificar si la transición es válida
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!validTransitions.includes(newStatus)) return false;

    // Verificar permisos del usuario
    const permissions = STATUS_PERMISSIONS[currentStatus];
    if (!permissions) return false;

    if (Array.isArray(permissions.canChangeStatus)) {
        return permissions.canChangeStatus.includes(user.role);
    }

    return permissions.canChangeStatus === true;
};