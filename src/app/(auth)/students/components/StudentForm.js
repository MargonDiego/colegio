// src/app/(auth)/students/components/StudentForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Paper,
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Typography,
    Breadcrumbs,
    Link as MuiLink,
    Alert,
    FormControlLabel,
    Switch,
    CircularProgress,
    Divider
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import studentService from '@/services/student.service';
import { validateStudentForm, formatStudentData, prepareFormData } from '../utils/validations';

// Constantes para las opciones de los select
const GRADES = [
    'Pre-Kinder', 'Kinder',
    '1° Básico', '2° Básico', '3° Básico', '4° Básico',
    '5° Básico', '6° Básico', '7° Básico', '8° Básico',
    'I Medio', 'II Medio', 'III Medio', 'IV Medio'
];

const STUDENT_TYPES = [
    { value: 'Regular', label: 'Regular' },
    { value: 'Programa Integración', label: 'Programa Integración' }
];

export default function StudentForm({ studentId = null }) {
    const router = useRouter();
    const isEditMode = !!studentId;

    // Estados del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        rut: '',
        email: '',
        birthDate: '',
        enrollmentDate: '', // Agregar campo de fecha
        grade: '',
        studentType: 'Regular',
        academicYear: new Date().getFullYear().toString(),
        guardian1Name: '',
        guardian1Contact: '',
        guardian2Name: '',
        guardian2Contact: '',
        address: '',
        healthInfo: '',
        medicalConditions: '',
        allergies: '',
        hasScholarship: false,
        scholarshipDetails: '',
        isActive: true
    });

    // Estados de UI
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    // Cargar datos si estamos en modo edición
    useEffect(() => {
        const loadStudent = async () => {
            if (!isEditMode) return;

            try {
                setLoading(true);
                setError(null);
                const data = await studentService.getById(studentId);
                const preparedData = prepareFormData(data);
                setFormData(preparedData);
            } catch (err) {
                console.error('Error loading student:', err);
                setError('Error al cargar los datos del estudiante');
            } finally {
                setLoading(false);
            }
        };

        loadStudent();
    }, [studentId, isEditMode]);

    // Manejadores de cambios en el formulario
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Limpiar error del campo modificado
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    // Validación y envío del formulario
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validar formulario
        const validationErrors = validateStudentForm(formData, isEditMode);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            const firstErrorField = Object.keys(validationErrors)[0];
            const element = document.querySelector(`[name="${firstErrorField}"]`);
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setErrors({});

            const formattedData = formatStudentData(formData);

            if (isEditMode) {
                await studentService.update(studentId, formattedData);
            } else {
                await studentService.create(formattedData);
            }

            router.push('/students');
        } catch (err) {
            console.error('Error saving student:', err);
            setError('Error al guardar los datos: ' + (err.message || 'Error desconocido'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Breadcrumbs sx={{ mb: 2 }}>
                <MuiLink href="/dashboard" underline="hover" color="inherit">
                    Dashboard
                </MuiLink>
                <MuiLink href="/students" underline="hover" color="inherit">
                    Estudiantes
                </MuiLink>
                <Typography color="text.primary">
                    {isEditMode ? 'Editar' : 'Nuevo'} Estudiante
                </Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    {isEditMode ? 'Editar' : 'Nuevo'} Estudiante
                </Typography>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                >
                    Volver
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información Personal
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Nombres"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Apellidos"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="RUT"
                                name="rut"
                                value={formData.rut}
                                onChange={handleChange}
                                error={!!errors.rut}
                                helperText={errors.rut || 'Formato: 12345678-9'}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Fecha de Nacimiento"
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleChange}
                                error={!!errors.birthDate}
                                helperText={errors.birthDate}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información Académica
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Curso"
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                error={!!errors.grade}
                                helperText={errors.grade}
                            >
                                {GRADES.map((grade) => (
                                    <MenuItem key={grade} value={grade}>
                                        {grade}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Tipo de Estudiante"
                                name="studentType"
                                value={formData.studentType}
                                onChange={handleChange}
                                error={!!errors.studentType}
                                helperText={errors.studentType}
                            >
                                {STUDENT_TYPES.map((type) => (
                                    <MenuItem key={type.value} value={type.value}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Año Académico"
                                name="academicYear"
                                type="number"
                                value={formData.academicYear}
                                onChange={handleChange}
                                error={!!errors.academicYear}
                                helperText={errors.academicYear}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Fecha de Matricula"
                                name="enrollmentDate"
                                type="date"
                                value={formData.enrollmentDate}
                                onChange={handleChange}
                                error={!!errors.enrollmentDate}
                                helperText={errors.enrollmentDate}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{
                                    max: new Date().toISOString().split('T')[0]
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.hasScholarship}
                                    onChange={handleChange}
                                    name="hasScholarship"
                                />
                            }
                            label="Tiene Beca"
                        />
                        {formData.hasScholarship && (
                            <TextField
                                fullWidth
                                label="Detalles de la Beca"
                                name="scholarshipDetails"
                                value={formData.scholarshipDetails}
                                onChange={handleChange}
                                error={!!errors.scholarshipDetails}
                                helperText={errors.scholarshipDetails}
                                sx={{ mt: 2 }}
                            />
                        )}
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información de Contacto
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre Apoderado Principal"
                                name="guardian1Name"
                                value={formData.guardian1Name}
                                onChange={handleChange}
                                error={!!errors.guardian1Name}
                                helperText={errors.guardian1Name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contacto Apoderado Principal"
                                name="guardian1Contact"
                                value={formData.guardian1Contact}
                                onChange={handleChange}
                                error={!!errors.guardian1Contact}
                                helperText={errors.guardian1Contact}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre Apoderado Suplente"
                                name="guardian2Name"
                                value={formData.guardian2Name}
                                onChange={handleChange}
                                error={!!errors.guardian2Name}
                                helperText={errors.guardian2Name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contacto Apoderado Suplente"
                                name="guardian2Contact"
                                value={formData.guardian2Contact}
                                onChange={handleChange}
                                error={!!errors.guardian2Contact}
                                helperText={errors.guardian2Contact}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Dirección"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                error={!!errors.address}
                                helperText={errors.address}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información Médica
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Información de Salud"
                                name="healthInfo"
                                value={formData.healthInfo}
                                onChange={handleChange}
                                error={!!errors.healthInfo}
                                helperText={errors.healthInfo}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Condiciones Médicas"
                                name="medicalConditions"
                                value={formData.medicalConditions}
                                onChange={handleChange}
                                error={!!errors.medicalConditions}
                                helperText={errors.medicalConditions}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Alergias"
                                name="allergies"
                                value={formData.allergies}
                                onChange={handleChange}
                                error={!!errors.allergies}
                                helperText={errors.allergies}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={formData.isActive}
                                onChange={handleChange}
                                name="isActive"
                            />
                        }
                        label="Estudiante Activo"
                    />
                </Paper>

                <Box sx={{
                    mt: 3,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={saving}
                        sx={{ minWidth: 120 }}
                    >
                        {saving ? (
                            <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Guardando...
                            </>
                        ) : (
                            isEditMode ? 'Actualizar' : 'Crear'
                        )}
                    </Button>
                </Box>
            </form>
        </Container>
    );
}
