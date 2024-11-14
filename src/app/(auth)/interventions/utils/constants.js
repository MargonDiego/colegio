/**
 * Constantes para el módulo de intervenciones
 */

// Estados posibles de una intervención
export const INTERVENTION_STATUS = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En Proceso',
    RESOLVED: 'Resuelto',
    CLOSED: 'Cerrado'
};

// Niveles de prioridad
export const PRIORITY_LEVELS = {
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3
};

// Tipos de intervención
export const INTERVENTION_TYPES = [
    'Comportamiento',
    'Académico',
    'Asistencia',
    'Salud',
    'Familiar',
    'Social',
    'Emocional',
    'Otro'
];

// Ámbitos de intervención
export const INTERVENTION_SCOPES = {
    INDIVIDUAL: 'Individual',
    GROUP: 'Grupal',
    FAMILY: 'Familiar'
};

// Configuración de colores por estado
export const STATUS_COLORS = {
    [INTERVENTION_STATUS.PENDING]: 'warning',
    [INTERVENTION_STATUS.IN_PROGRESS]: 'info',
    [INTERVENTION_STATUS.RESOLVED]: 'success',
    [INTERVENTION_STATUS.CLOSED]: 'default'
};

// Configuración de colores por prioridad
export const PRIORITY_COLORS = {
    [PRIORITY_LEVELS.HIGH]: 'error',
    [PRIORITY_LEVELS.MEDIUM]: 'warning',
    [PRIORITY_LEVELS.LOW]: 'info'
};

// Etiquetas para mostrar en la interfaz
export const LABELS = {
    status: {
        [INTERVENTION_STATUS.PENDING]: 'Pendiente',
        [INTERVENTION_STATUS.IN_PROGRESS]: 'En Proceso',
        [INTERVENTION_STATUS.RESOLVED]: 'Resuelto',
        [INTERVENTION_STATUS.CLOSED]: 'Cerrado'
    },
    priority: {
        [PRIORITY_LEVELS.HIGH]: 'Alta',
        [PRIORITY_LEVELS.MEDIUM]: 'Media',
        [PRIORITY_LEVELS.LOW]: 'Baja'
    },
    scope: {
        [INTERVENTION_SCOPES.INDIVIDUAL]: 'Individual',
        [INTERVENTION_SCOPES.GROUP]: 'Grupal',
        [INTERVENTION_SCOPES.FAMILY]: 'Familiar'
    }
};

// Configuración de permisos por estado
export const STATUS_PERMISSIONS = {
    [INTERVENTION_STATUS.PENDING]: {
        canEdit: true,
        canDelete: true,
        canAddComments: true,
        canChangeStatus: true,
        canAddAttachments: true
    },
    [INTERVENTION_STATUS.IN_PROGRESS]: {
        canEdit: true,
        canDelete: false,
        canAddComments: true,
        canChangeStatus: true,
        canAddAttachments: true
    },
    [INTERVENTION_STATUS.RESOLVED]: {
        canEdit: false,
        canDelete: false,
        canAddComments: true,
        canChangeStatus: true,
        canAddAttachments: false
    },
    [INTERVENTION_STATUS.CLOSED]: {
        canEdit: false,
        canDelete: false,
        canAddComments: false,
        canChangeStatus: false,
        canAddAttachments: false
    }
};

// Transiciones válidas de estado
export const VALID_STATUS_TRANSITIONS = {
    [INTERVENTION_STATUS.PENDING]: [
        INTERVENTION_STATUS.IN_PROGRESS,
        INTERVENTION_STATUS.RESOLVED
    ],
    [INTERVENTION_STATUS.IN_PROGRESS]: [
        INTERVENTION_STATUS.RESOLVED
    ],
    [INTERVENTION_STATUS.RESOLVED]: [
        INTERVENTION_STATUS.CLOSED,
        INTERVENTION_STATUS.IN_PROGRESS
    ],
    [INTERVENTION_STATUS.CLOSED]: []
};

// Límites de caracteres para campos
export const CHAR_LIMITS = {
    TITLE: 100,
    DESCRIPTION: 2000,
    COMMENT: 1000,
    REFERRAL_DETAILS: 500,
    ACTION_TAKEN: 500,
    OUTCOME_EVALUATION: 1000
};

// Intervalos de tiempo (en milisegundos)
export const TIME_INTERVALS = {
    RESPONSE_REQUIRED: 24 * 60 * 60 * 1000,    // 24 horas para respuesta inicial
    UPDATE_REQUIRED: 72 * 60 * 60 * 1000,      // 72 horas para actualización
    FOLLOW_UP_DEFAULT: 7 * 24 * 60 * 60 * 1000, // 7 días para seguimiento por defecto
    RESOLUTION_TARGET: 30 * 24 * 60 * 60 * 1000 // 30 días objetivo para resolución
};

// Estados de actualización
export const UPDATE_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// Tipos de notificación
export const NOTIFICATION_TYPES = {
    NEW_INTERVENTION: 'new_intervention',
    STATUS_CHANGE: 'status_change',
    COMMENT_ADDED: 'comment_added',
    FOLLOW_UP_REQUIRED: 'follow_up_required',
    DEADLINE_APPROACHING: 'deadline_approaching',
    ASSIGNMENT_CHANGE: 'assignment_change'
};

// Configuración de priorización automática
export const AUTO_PRIORITY_RULES = {
    ATTENDANCE: {
        threshold: 3,  // Número de inasistencias
        priority: PRIORITY_LEVELS.HIGH
    },
    BEHAVIOR: {
        threshold: 2,  // Número de incidentes
        priority: PRIORITY_LEVELS.HIGH
    },
    ACADEMIC: {
        threshold: 4,  // Número de asignaturas bajo el promedio
        priority: PRIORITY_LEVELS.MEDIUM
    }
};

// Roles que pueden intervenir
export const INTERVENTION_ROLES = {
    INFORMER: 'informer',      // Quien reporta
    RESPONSIBLE: 'responsible', // Responsable principal
    SUPPORTER: 'supporter',     // Apoyo adicional
    SUPERVISOR: 'supervisor'    // Supervisor
};

// Estado de seguimiento
export const FOLLOW_UP_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
    CANCELLED: 'cancelled'
};

// Tipos de archivos adjuntos permitidos
export const ALLOWED_ATTACHMENT_TYPES = {
    DOCUMENT: ['pdf', 'doc', 'docx'],
    IMAGE: ['jpg', 'jpeg', 'png'],
    SPREADSHEET: ['xls', 'xlsx'],
    MAX_SIZE: 5 * 1024 * 1024  // 5MB
};

// Acciones disponibles
export const AVAILABLE_ACTIONS = {
    START: 'start',
    PAUSE: 'pause',
    RESUME: 'resume',
    COMPLETE: 'complete',
    CANCEL: 'cancel',
    REOPEN: 'reopen'
};

// Tipos de eventos para el timeline
export const TIMELINE_EVENT_TYPES = {
    CREATION: 'creation',
    STATUS_CHANGE: 'status_change',
    COMMENT: 'comment',
    ASSIGNMENT: 'assignment',
    FOLLOW_UP: 'follow_up',
    ATTACHMENT: 'attachment',
    ACTION_TAKEN: 'action_taken'
};