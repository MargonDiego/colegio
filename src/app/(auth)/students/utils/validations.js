// src/app/(auth)/students/utils/validations.js

import { rutValidate, formatRut, formatDateForInput } from '@/lib/utils';

/**
 * Valida los datos del formulario de estudiante
 * @param {Object} formData - Datos del formulario a validar
 * @param {boolean} isEditMode - Indica si es modo edición
 * @returns {Object} - Objeto con los errores encontrados
 */
export const validateStudentForm = (formData, isEditMode = false) => {
    const errors = {};

    // Validar campos requeridos
    const requiredFields = [
        { field: 'firstName', message: 'El nombre es requerido' },
        { field: 'lastName', message: 'El apellido es requerido' },
        { field: 'rut', message: 'El RUT es requerido' },
        { field: 'birthDate', message: 'La fecha de nacimiento es requerida' },
        { field: 'grade', message: 'El curso es requerido' },
        { field: 'academicYear', message: 'El año académico es requerido' }
    ];

    requiredFields.forEach(({ field, message }) => {
        if (!formData[field]?.toString().trim()) {
            errors[field] = message;
        }
    });

    // Validar RUT usando la función de utils
    if (formData.rut) {
        // Primero validar formato básico
        const rutRegex = /^\d{7,8}-[0-9kK]{1}$/;
        if (!rutRegex.test(formData.rut)) {
            errors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
        } else if (!rutValidate(formData.rut)) {
            errors.rut = 'RUT inválido (dígito verificador incorrecto)';
        }
    }

    // Validar fecha de nacimiento
    if (formData.birthDate) {
        const birthDate = new Date(formData.birthDate);
        const today = new Date();

        if (isNaN(birthDate.getTime())) {
            errors.birthDate = 'La fecha de nacimiento no es válida';
        } else if (birthDate > today) {
            errors.birthDate = 'La fecha de nacimiento no puede ser futura';
        } else {
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            const dayDiff = today.getDate() - birthDate.getDate();

            let adjustedAge = age;
            if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                adjustedAge--;
                adjustedAge--;
            }

            if (adjustedAge < 3 || adjustedAge > 20) {
                errors.birthDate = 'La edad debe estar entre 3 y 20 años';
            }
        }
    }

    // Validar email
    if (formData.email?.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email.trim())) {
            errors.email = 'El formato del email no es válido';
        }
    }

    // Validar año académico
    if (formData.academicYear) {
        const currentYear = new Date().getFullYear();
        const year = parseInt(formData.academicYear);
        if (isNaN(year) || year < currentYear - 1 || year > currentYear + 1) {
            errors.academicYear = 'El año académico debe estar entre el año anterior y el próximo año';
        }
    }

    // Validar contactos
    const phoneRegex = /^\+?[0-9]{9,15}$/;

    if (formData.guardian1Contact?.trim()) {
        if (!phoneRegex.test(formData.guardian1Contact.replace(/\s/g, ''))) {
            errors.guardian1Contact = 'Formato de contacto inválido (solo números y + inicial)';
        }
    }

    if (formData.guardian2Contact?.trim()) {
        if (!phoneRegex.test(formData.guardian2Contact.replace(/\s/g, ''))) {
            errors.guardian2Contact = 'Formato de contacto inválido (solo números y + inicial)';
        }
    }

    // Validar longitudes máximas
    const maxLengths = {
        firstName: 100,
        lastName: 100,
        email: 100,
        guardian1Name: 100,
        guardian2Name: 100,
        guardian1Contact: 20,
        guardian2Contact: 20,
        address: 255,
        healthInfo: 1000,
        medicalConditions: 500,
        allergies: 500,
        scholarshipDetails: 500
    };

    Object.entries(maxLengths).forEach(([field, maxLength]) => {
        if (formData[field]?.length > maxLength) {
            errors[field] = `Este campo no puede exceder los ${maxLength} caracteres`;
        }
    });

    return errors;
};

/**
 * Formatea los datos del formulario para enviar al servidor
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Datos formateados
 */
export const formatStudentData = (formData) => {
    return {
        ...formData,
        // Usar el RUT sin puntos pero con guión
        rut: formData.rut
            ?.replace(/\./g, '')
            .replace(/^(\d+)([kK\d])$/, '$1-$2')
            .toUpperCase() || null,
        // Normalizar email
        email: formData.email?.toLowerCase().trim() || null,
        // Formatear fecha
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : null,
        // Formatear fecha
        enrollmentDate: formData.enrollmentDate ? new Date(formData.enrollmentDate).toISOString() : null,
        // Convertir a número
        academicYear: parseInt(formData.academicYear),
        // Asegurar booleanos
        hasScholarship: Boolean(formData.hasScholarship),
        isActive: Boolean(formData.isActive),
        // Limpiar espacios en campos de texto
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        guardian1Name: formData.guardian1Name?.trim(),
        guardian2Name: formData.guardian2Name?.trim(),
        guardian1Contact: formData.guardian1Contact?.trim(),
        guardian2Contact: formData.guardian2Contact?.trim(),
        address: formData.address?.trim(),
        healthInfo: formData.healthInfo?.trim(),
        medicalConditions: formData.medicalConditions?.trim(),
        allergies: formData.allergies?.trim(),
        scholarshipDetails: formData.scholarshipDetails?.trim()
    };
};

/**
 * Prepara los datos del servidor para mostrar en el formulario
 * @param {Object} studentData - Datos del estudiante desde el servidor
 * @returns {Object} - Datos preparados para el formulario
 */
export const prepareFormData = (studentData) => {
    if (!studentData) return null;

    return {
        ...studentData,
        // Mantener el RUT sin puntos pero con guión
        rut: studentData.rut
            ?.replace(/\./g, '')
            .replace(/^(\d+)([kK\d])$/, '$1-$2')
            .toUpperCase(),
        // Formatear fecha para el input
        birthDate: formatDateForInput(studentData.birthDate),
        // Formatear fecha para el input
        enrollmentDate: formatDateForInput(studentData.enrollmentDate),
        // Asegurar string para academicYear
        academicYear: studentData.academicYear?.toString() || new Date().getFullYear().toString(),
        // Asegurar booleanos
        hasScholarship: Boolean(studentData.hasScholarship),
        isActive: Boolean(studentData.isActive)
    };
};