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
    CircularProgress,
    FormHelperText,
    FormControl,
    InputLabel,
    Select,
    Autocomplete
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import interventionService from '@/services/intervention.service';
import studentService from '@/services/student.service';
import userService from '@/services/user.service';
import { API_CONSTANTS } from '@/lib/api/endpoints';

export default function InterventionForm({ interventionId = null }) {
    const router = useRouter();
    const { user } = useAuth();
    const isEditMode = !!interventionId;

    // Estados
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        priority: '',
        studentId: '',
        responsibleId: '',
        status: isEditMode ? '' : 'Pendiente',
        interventionScope: 'Individual',
        actionsTaken: [],
        outcomeEvaluation: '',
        followUpDate: null,
        requiresExternalReferral: false,
        externalReferralDetails: ''
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});

    // Estados para las opciones de selección
    const [students, setStudents] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    // Cargar datos iniciales
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingOptions(true);
                const [studentsData, professionalsData] = await Promise.all([
                    studentService.getAll({ isActive: true }),
                    userService.getProfessionals()
                ]);

                setStudents(studentsData);
                setProfessionals(professionalsData);

                // Si estamos en modo edición, cargar los datos de la intervención
                if (isEditMode) {
                    const interventionData = await interventionService.getById(interventionId);
                    setFormData(prev => ({
                        ...prev,
                        ...interventionData,
                        studentId: interventionData.student?.id || '',
                        responsibleId: interventionData.responsible?.id || ''
                    }));
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
                setError('Error al cargar los datos iniciales');
            } finally {
                setLoadingOptions(false);
                setLoading(false);
            }
        };

        loadInitialData();
    }, [isEditMode, interventionId]);

    // Validación del formulario
    const validateForm = () => {
        const newErrors = {};

        // Validaciones básicas
        if (!formData.title?.trim()) newErrors.title = 'El título es requerido';
        if (!formData.description?.trim()) newErrors.description = 'La descripción es requerida';
        if (!formData.type) newErrors.type = 'El tipo es requerido';
        if (!formData.priority) newErrors.priority = 'La prioridad es requerida';
        if (!formData.studentId) newErrors.studentId = 'El estudiante es requerido';
        if (!formData.responsibleId) newErrors.responsibleId = 'El responsable es requerido';

        // Validaciones específicas
        if (formData.title?.length > 100) {
            newErrors.title = 'El título no puede exceder los 100 caracteres';
        }

        if (formData.requiresExternalReferral && !formData.externalReferralDetails?.trim()) {
            newErrors.externalReferralDetails = 'Los detalles de la derivación son requeridos';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejadores de eventos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const data = {
                ...formData,
                informerId: user.id // El usuario actual es el informante
            };

            if (isEditMode) {
                await interventionService.update(interventionId, data);
            } else {
                await interventionService.create(data);
            }

            router.push('/interventions');
        } catch (err) {
            console.error('Error saving intervention:', err);
            setError(err.message || 'Error al guardar la intervención');
        } finally {
            setSaving(false);
        }
    };

    if (loading || loadingOptions) {
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
                <MuiLink href="/interventions" underline="hover" color="inherit">
                    Intervenciones
                </MuiLink>
                <Typography color="text.primary">
                    {isEditMode ? 'Editar' : 'Nueva'} Intervención
                </Typography>
            </Breadcrumbs>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1">
                    {isEditMode ? 'Editar' : 'Nueva'} Intervención
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
                        Información Básica
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Título"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                error={!!errors.title}
                                helperText={errors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                multiline
                                rows={4}
                                label="Descripción"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.type}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    required
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    label="Tipo"
                                >
                                    {API_CONSTANTS.INTERVENTION_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth error={!!errors.priority}>
                                <InputLabel>Prioridad</InputLabel>
                                <Select
                                    required
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    label="Prioridad"
                                >
                                    <MenuItem value={1}>Alta</MenuItem>
                                    <MenuItem value={2}>Media</MenuItem>
                                    <MenuItem value={3}>Baja</MenuItem>
                                </Select>
                                {errors.priority && <FormHelperText>{errors.priority}</FormHelperText>}
                            </FormControl>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Asignación
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={students}
                                getOptionLabel={(option) =>
                                    `${option.firstName} ${option.lastName} - ${option.grade}`
                                }
                                value={students.find(s => s.id === formData.studentId) || null}
                                onChange={(_, newValue) => {
                                    handleChange({
                                        target: {
                                            name: 'studentId',
                                            value: newValue?.id || ''
                                        }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Estudiante"
                                        required
                                        error={!!errors.studentId}
                                        helperText={errors.studentId}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={professionals}
                                getOptionLabel={(option) =>
                                    `${option.firstName} ${option.lastName} - ${option.position || option.role}`
                                }
                                value={professionals.find(p => p.id === formData.responsibleId) || null}
                                onChange={(_, newValue) => {
                                    handleChange({
                                        target: {
                                            name: 'responsibleId',
                                            value: newValue?.id || ''
                                        }
                                    });
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Responsable"
                                        required
                                        error={!!errors.responsibleId}
                                        helperText={errors.responsibleId}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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