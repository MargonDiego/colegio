    // src/services/student.service.js

    import api from '@/lib/api/axios-config';
    import { ENDPOINTS } from '@/lib/api/endpoints';

    /**
     * Servicio para la gestión de estudiantes
     */
    class StudentService {
        /**
         * Obtiene la lista de estudiantes con opciones de filtrado y paginación
         * @param {Object} options - Opciones de consulta
         * @param {string} [options.search] - Término de búsqueda (nombre o RUT)
         * @param {string} [options.grade] - Filtro por grado
         * @param {string} [options.studentType] - Tipo de estudiante
         * @param {boolean} [options.isActive] - Estado del estudiante
         * @param {string} [options.orderBy] - Campo de ordenamiento
         * @param {string} [options.order] - Dirección del ordenamiento (ASC/DESC)
         * @returns {Promise<Object>} Lista de estudiantes y metadata
         */
        async getAll(options = {}) {
            try {
                const queryParams = this._buildQueryParams(options);
                const response = await api.get(ENDPOINTS.STUDENTS.BASE, { params: queryParams });
                return this._processStudentList(response);
            } catch (error) {
                console.error('Error fetching students:', error);
                throw this._handleError(error);
            }
        }

        /**
         * Obtiene un estudiante por su ID
         * @param {number} id - ID del estudiante
         * @returns {Promise<Object>} Datos del estudiante
         */
        async getById(id) {
            try {
                const response = await api.get(ENDPOINTS.STUDENTS.DETAIL(id));
                return this._processStudentData(response);
            } catch (error) {
                console.error(`Error fetching student ${id}:`, error);
                throw this._handleError(error);
            }
        }

        /**
         * Obtiene un estudiante con sus intervenciones
         * @param {number} id - ID del estudiante
         * @returns {Promise<Object>} Estudiante con sus intervenciones
         */
        async getWithInterventions(id) {
            try {
                const response = await api.get(ENDPOINTS.STUDENTS.WITH_INTERVENTIONS(id));
                return {
                    ...this._processStudentData(response),
                    interventions: response.interventions?.map(this._processInterventionData) || []
                };
            } catch (error) {
                console.error(`Error fetching student ${id} with interventions:`, error);
                throw this._handleError(error);
            }
        }

        /**
         * Crea un nuevo estudiante
         * @param {Object} studentData - Datos del estudiante
         * @returns {Promise<Object>} Estudiante creado
         */
        async create(studentData) {
            try {
                // Validar RUT antes de enviar
                if (!this._validateRut(studentData.rut)) {
                    throw {
                        message: 'El formato del RUT no es válido',
                        status: 400,
                        type: 'ValidationError'
                    };
                }

                // Formatear datos
                const formattedData = this._formatStudentData(studentData);

                // Verificar existencia de RUT
                try {
                    const students = await this.getAll();
                    const rutExists = students.some(student =>
                        this._normalizeRut(student.rut) === this._normalizeRut(formattedData.rut)
                    );

                    if (rutExists) {
                        throw {
                            message: 'Ya existe un estudiante con ese RUT',
                            status: 409,
                            type: 'DuplicateError'
                        };
                    }
                } catch (error) {
                    if (error.type !== 'DuplicateError') {
                        console.error('Error checking RUT existence:', error);
                    }
                    throw error;
                }

                const response = await api.post(ENDPOINTS.STUDENTS.CREATE, formattedData);
                return this._processStudentData(response);
            } catch (error) {
                console.error('Error creating student:', error);
                throw this._handleError(error);
            }
        }
        /**
         * Actualiza un estudiante existente
         * @param {number} id - ID del estudiante
         * @param {Object} studentData - Datos a actualizar
         * @returns {Promise<Object>} Estudiante actualizado
         */
        async update(id, studentData) {
            try {
                // Validar RUT antes de enviar
                if (!this._validateRut(studentData.rut)) {
                    throw {
                        message: 'El formato del RUT no es válido',
                        status: 400,
                        type: 'ValidationError'
                    };
                }
                this._validateStudentData(studentData, true);
                // Formatear datos
                const formattedData = this._formatStudentData(studentData);

                // Verificar existencia de RUT en otros estudiantes
                const students = await this.getAll();
                const normalizedNewRut = formattedData.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
                const rutExists = students.some(student => {
                    // Convertir los IDs a número para comparación
                    const studentId = parseInt(student.id);
                    const currentId = parseInt(id);

                    // Normalizar el RUT para comparación
                    const studentRut = student.rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

                    // Verificar si existe otro estudiante (diferente ID) con el mismo RUT
                    return studentId !== currentId && studentRut === normalizedNewRut;
                });

                if (rutExists) {
                    throw {
                        message: 'Ya existe otro estudiante con ese RUT',
                        status: 409,
                        type: 'DuplicateError'
                    };
                }

                const response = await api.put(ENDPOINTS.STUDENTS.UPDATE(id), formattedData);
                return this._processStudentData(response);
            } catch (error) {
                console.error(`Error updating student ${id}:`, error);
                if (error.type) {
                    throw error;
                }
                throw this._handleError(error);
            }
        }


        /**
         * Elimina un estudiante
         * @param {number} id - ID del estudiante
         * @returns {Promise<void>}
         */
        async delete(id) {
            try {
                await api.delete(ENDPOINTS.STUDENTS.DELETE(id));
            } catch (error) {
                console.error(`Error deleting student ${id}:`, error);
                throw this._handleError(error);
            }
        }

        /**
         * Normaliza un RUT para comparaciones
         * @private
         */
        _normalizeRut(rut) {
            return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
        }

        /**
         * Construye los parámetros de consulta
         * @private
         */
        _buildQueryParams(options) {
            const params = {};

            if (options.search) {
                params.search = options.search;
            }

            if (options.grade) {
                params.grade = options.grade;
            }

            if (options.studentType) {
                params.studentType = options.studentType;
            }

            if (options.isActive !== undefined) {
                params.isActive = options.isActive;
            }

            if (options.orderBy) {
                params.orderBy = options.orderBy;
                params.order = options.order || 'ASC';
            }

            return params;
        }

        /**
         * Valida el formato y dígito verificador de un RUT chileno
         * @private
         * @param {string} rut - RUT a validar
         * @returns {boolean} true si el RUT es válido
         */
        _validateRut(rut) {
            if (!rut) return false;

            // Verificar formato básico (debe incluir guión)
            if (!/^\d{7,8}-[0-9Kk]{1}$/.test(rut)) {
                return false;
            }

            // Limpiar el RUT y convertir a mayúsculas
            const rutLimpio = rut.replace(/\./g, '').toUpperCase();
            const [numero, dv] = rutLimpio.split('-');

            if (!numero || !dv) return false;

            // Calcular dígito verificador
            let suma = 0;
            let multiplicador = 2;

            // Recorrer cada dígito del número de derecha a izquierda
            for (let i = numero.length - 1; i >= 0; i--) {
                suma += parseInt(numero.charAt(i)) * multiplicador;
                multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
            }

            let dvCalculado = 11 - (suma % 11);
            dvCalculado = dvCalculado === 11 ? '0' :
                dvCalculado === 10 ? 'K' :
                    dvCalculado.toString();

            return dv === dvCalculado;
        }

        /**
         * Formatea los datos del estudiante para la API
         * @private
         */
        _formatStudentData(data) {
            // Formatear RUT
            const rutFormateado = data.rut ?
                data.rut.replace(/\./g, '')
                    .replace(/^(\d{1,8})([kK\d])$/, '$1-$2')
                    .toUpperCase() : null;

            return {
                ...data,
                rut: rutFormateado,
                email: data.email?.toLowerCase().trim() || null,
                birthDate: data.birthDate ? new Date(data.birthDate).toISOString() : undefined,
                enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate).toISOString() : undefined,
                academicYear: parseInt(data.academicYear),
                hasScholarship: !!data.hasScholarship,
                isActive: data.isActive !== undefined ? data.isActive : true,
                firstName: data.firstName?.trim(),
                lastName: data.lastName?.trim(),
                guardian1Name: data.guardian1Name?.trim(),
                guardian2Name: data.guardian2Name?.trim(),
                guardian1Contact: data.guardian1Contact?.trim(),
                guardian2Contact: data.guardian2Contact?.trim(),
                address: data.address?.trim(),
                healthInfo: data.healthInfo?.trim(),
                medicalConditions: data.medicalConditions?.trim(),
                allergies: data.allergies?.trim(),
                scholarshipDetails: data.scholarshipDetails?.trim()
            };
        }

        /**
         * Procesa los datos de un estudiante
         * @private
         */
        _processStudentData(data) {
            if (!data) return null;

            return {
                ...data,
                fullName: `${data.firstName} ${data.lastName}`,
                displayRut: this._formatRut(data.rut),
                birthDate: data.birthDate ? new Date(data.birthDate) : null,
                enrollmentDate: data.enrollmentDate ? new Date(data.enrollmentDate) : null,
                createdAt: data.createdAt ? new Date(data.createdAt) : null,
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : null
            };
        }
        /**
         * Valida los datos del estudiante
         * @private
         */
        _validateStudentData(data, isUpdate = false) {
            const requiredFields = ['firstName', 'lastName', 'rut', 'grade', 'academicYear'];

            if (!isUpdate) {
                // Validar campos requeridos solo en creación
                for (const field of requiredFields) {
                    if (!data[field]) {
                        throw new Error(`El campo ${field} es requerido`);
                    }
                }
            }

            // Validar RUT si está presente
            if (data.rut && !this._validateRut(data.rut)) {
                throw new Error('El RUT proporcionado no es válido');
            }
        }

        /**
         * Formatea un RUT para mostrar
         * @private
         */
        _formatRut(rut) {
            if (!rut) return '';

            // Limpiar y convertir a mayúsculas
            const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();

            if (rutLimpio.length < 2) return rutLimpio;

            // Separar número y DV
            const dv = rutLimpio.slice(-1);
            const numero = rutLimpio.slice(0, -1);

            // Formatear con puntos
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
         * Procesa una lista de estudiantes
         * @private
         */
        _processStudentList(response) {
            const students = Array.isArray(response) ? response : response.data || [];
            return students.map(student => this._processStudentData(student));
        }

        /**
         * Procesa los datos de una intervención
         * @private
         */
        _processInterventionData(intervention) {
            if (!intervention) return null;

            return {
                ...intervention,
                dateReported: intervention.dateReported ? new Date(intervention.dateReported) : null,
                dateResolved: intervention.dateResolved ? new Date(intervention.dateResolved) : null,
                createdAt: intervention.createdAt ? new Date(intervention.createdAt) : null,
                updatedAt: intervention.updatedAt ? new Date(intervention.updatedAt) : null
            };
        }

        /**
         * Maneja los errores del servicio
         * @private
         */
        _handleError(error) {
            if (error.type && error.message) {
                return error;
            }

            if (error.response) {
                return {
                    message: error.response.data.error || 'Error del servidor',
                    status: error.response.status,
                    type: error.response.data.type || 'Error',
                    details: error.response.data.details || {}
                };
            }

            return {
                message: error.message || 'Error desconocido',
                status: 500,
                type: 'Error',
                details: {}
            };
        }
    }

    export default new StudentService();