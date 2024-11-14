// src/lib/utils.js

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar (formato: XXXXXXXX-X)
 * @returns {boolean} - true si el RUT es válido, false si no
 */
function rutValidate(rut) {
    if (!rut) return false;

    // Limpiar el RUT y convertir a mayúsculas
    const rutLimpio = rut.toUpperCase().replace(/\./g, '').replace(/-/g, '');

    // Validar formato básico
    if (!/^[0-9]{7,8}[0-9K]$/.test(rutLimpio)) {
        return false;
    }

    // Obtener dígito verificador y número
    const dv = rutLimpio.charAt(rutLimpio.length - 1);
    const rutNumero = rutLimpio.slice(0, -1);
    const rutNumeroReversado = rutNumero.split('').reverse();

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let digito of rutNumeroReversado) {
        suma += parseInt(digito) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    let dvCalculado = 11 - (suma % 11);

    // Convertir dígito verificador calculado a string
    dvCalculado = dvCalculado === 11 ? '0' :
        dvCalculado === 10 ? 'K' :
            dvCalculado.toString();

    // Comparar con el dígito verificador proporcionado
    return dv === dvCalculado;
}

/**
 * Formatea un RUT al formato chileno estándar
 * @param {string} rut - RUT a formatear
 * @returns {string} - RUT formateado (ej: 12.345.678-9)
 */
function formatRut(rut) {
    if (!rut) return '';

    // Limpiar el RUT y convertir a mayúsculas
    const rutLimpio = rut.toUpperCase().replace(/\./g, '').replace(/-/g, '');

    // Si el RUT no tiene el largo mínimo, retornar sin formatear
    if (rutLimpio.length < 2) return rutLimpio;

    // Separar número y dígito verificador
    const dv = rutLimpio.charAt(rutLimpio.length - 1);
    const numero = rutLimpio.slice(0, -1);

    // Formatear número con puntos
    let numeroFormateado = '';
    for (let i = numero.length - 1, j = 0; i >= 0; i--, j++) {
        numeroFormateado = numero.charAt(i) + numeroFormateado;
        if ((j + 1) % 3 === 0 && i !== 0) {
            numeroFormateado = '.' + numeroFormateado;
        }
    }

    return `${numeroFormateado}-${dv}`;
}

/**
 * Formatea una fecha al formato chileno
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Fecha formateada (DD/MM/YYYY)
 */
function formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
}

/**
 * Obtiene las opciones de cursos disponibles
 * @returns {string[]} - Array con los cursos disponibles
 */
function getGradeOptions() {
    return [
        'Pre-Kinder',
        'Kinder',
        '1° Básico',
        '2° Básico',
        '3° Básico',
        '4° Básico',
        '5° Básico',
        '6° Básico',
        '7° Básico',
        '8° Básico',
        'I Medio',
        'II Medio',
        'III Medio',
        'IV Medio'
    ];
}

/**
 * Obtiene los tipos de estudiantes disponibles
 * @returns {Array<{value: string, label: string}>} - Array con los tipos de estudiantes
 */
function getStudentTypes() {
    return [
        { value: 'Regular', label: 'Regular' },
        { value: 'Programa Integración', label: 'Programa Integración' }
    ];
}

/**
 * Normaliza un string removiendo acentos y convirtiendo a minúsculas
 * @param {string} str - String a normalizar
 * @returns {string} - String normalizado
 */
function normalizeString(str) {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Formatea una fecha para inputs tipo date
 * @param {Date|string} dateString - Fecha a formatear
 * @returns {string} - Fecha formateada (YYYY-MM-DD)
 */
function formatDateForInput(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toISOString().split('T')[0];
}

module.exports = {
    rutValidate,
    formatRut,
    formatDate,
    getGradeOptions,
    getStudentTypes,
    normalizeString,
    formatDateForInput
};