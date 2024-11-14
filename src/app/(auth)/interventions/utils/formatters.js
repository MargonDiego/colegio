/**
 * Utilidades de formateo para el módulo de intervenciones
 * Alineadas con la estructura de la base de datos
 */

import {
    LABELS,
    INTERVENTION_STATUS,
    PRIORITY_LEVELS,
    CHAR_LIMITS,
    INTERVENTION_TYPES,
    INTERVENTION_SCOPES
} from './constants';

/**
 * Formatea los datos de intervención para enviar al API
 * @param {Object} data - Datos del formulario
 * @returns {Object} Datos formateados
 */
export const formatInterventionData = (data) => {
    if (!data) return null;

    const formatTextField = (text, limit) => {
        return text ? text.trim().substring(0, limit) : '';
    };

    return {
        title: formatTextField(data.title, CHAR_LIMITS.TITLE),
        description: formatTextField(data.description, CHAR_LIMITS.DESCRIPTION),
        type: INTERVENTION_TYPES.includes(data.type) ? data.type : 'Otro',
        status: data.status || INTERVENTION_STATUS.PENDING,
        priority: Number(data.priority),
        dateReported: data.dateReported ? new Date(data.dateReported).toISOString() : new Date().toISOString(),
        dateResolved: data.dateResolved ? new Date(data.dateResolved).toISOString() : null,
        interventionScope: Object.values(INTERVENTION_SCOPES).includes(data.interventionScope)
            ? data.interventionScope
            : INTERVENTION_SCOPES.INDIVIDUAL,
        // Arrays y campos opcionales
        actionsTaken: Array.isArray(data.actionsTaken)
            ? data.actionsTaken
                .filter(Boolean)
                .map(action => formatTextField(action, CHAR_LIMITS.ACTIONS_TAKEN))
            : [],
        outcomeEvaluation: formatTextField(data.outcomeEvaluation, CHAR_LIMITS.OUTCOME_EVALUATION),
        followUpDate: data.followUpDate ? new Date(data.followUpDate).toISOString() : null,
        parentFeedback: formatTextField(data.parentFeedback, CHAR_LIMITS.PARENT_FEEDBACK),
        requiresExternalReferral: Boolean(data.requiresExternalReferral),
        externalReferralDetails: data.requiresExternalReferral
            ? formatTextField(data.externalReferralDetails, CHAR_LIMITS.REFERRAL_DETAILS)
            : null,
        // Relaciones
        studentId: data.studentId,
        responsibleId: data.responsibleId,
        informerId: data.informerId
    };
};

/**
 * Formatea los datos de un comentario
 * @param {Object} data - Datos del comentario
 * @returns {Object} Datos formateados
 */
export const formatCommentData = (data) => {
    if (!data) return null;

    return {
        content: data.content?.trim().substring(0, CHAR_LIMITS.COMMENT),
        interventionId: data.interventionId,
        userId: data.userId,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
    };
};

/**
 * Formatea una intervención para mostrar en la UI
 * @param {Object} intervention - Datos de la intervención
 * @param {Object} options - Opciones de formateo
 * @returns {Object} Datos formateados para UI
 */
export const formatInterventionForDisplay = (intervention, options = {}) => {
    if (!intervention) return null;

    const { includeRelations = true } = options;

    const baseData = {
        id: intervention.id,
        title: intervention.title,
        description: intervention.description,
        type: intervention.type,
        status: intervention.status,
        priority: intervention.priority,
        interventionScope: intervention.interventionScope,
        requiresExternalReferral: intervention.requiresExternalReferral,
        // Fechas formateadas
        dateReported: formatDate(intervention.dateReported),
        dateResolved: formatDate(intervention.dateResolved),
        followUpDate: formatDate(intervention.followUpDate),
        createdAt: formatDate(intervention.createdAt, { includeTime: true }),
        updatedAt: formatDate(intervention.updatedAt, { includeTime: true }),
        // Etiquetas para UI
        statusLabel: LABELS.status[intervention.status] || intervention.status,
        priorityLabel: LABELS.priority[intervention.priority] || 'No definida',
        typeLabel: LABELS.type[intervention.type] || intervention.type,
        scopeLabel: LABELS.scope[intervention.interventionScope] || intervention.interventionScope
    };

    if (includeRelations) {
        return {
            ...baseData,
            student: intervention.student ? formatStudent(intervention.student) : null,
            responsible: intervention.responsible ? formatUser(intervention.responsible) : null,
            informer: intervention.informer ? formatUser(intervention.informer) : null,
            comments: Array.isArray(intervention.comments)
                ? intervention.comments.map(formatComment)
                : []
        };
    }

    return baseData;
};

/**
 * Formatea una fecha para mostrar en la interfaz
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, { includeTime = false, locale = 'es-CL' } = {}) => {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(includeTime && {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        })
    };

    return new Intl.DateTimeFormat(locale, options).format(d);
};

/**
 * Formatea los datos de un estudiante
 * @param {Object} student - Datos del estudiante
 * @returns {Object} Datos formateados
 */
const formatStudent = (student) => {
    if (!student) return null;

    return {
        id: student.id,
        fullName: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        rut: student.rut,
        type: student.studentType
    };
};

/**
 * Formatea los datos de un usuario
 * @param {Object} user - Datos del usuario
 * @returns {Object} Datos formateados
 */
const formatUser = (user) => {
    if (!user) return null;

    return {
        id: user.id,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email,
        position: user.position
    };
};

/**
 * Formatea un comentario
 * @param {Object} comment - Datos del comentario
 * @returns {Object} Comentario formateado
 */
const formatComment = (comment) => {
    if (!comment) return null;

    return {
        id: comment.id,
        content: comment.content,
        createdAt: formatDate(comment.createdAt, { includeTime: true }),
        user: comment.user ? formatUser(comment.user) : null
    };
};