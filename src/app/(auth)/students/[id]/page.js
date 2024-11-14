// src/app/(auth)/students/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    Divider,
    Button,
    Chip,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import {
    Edit as EditIcon,
    Person as PersonIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    MedicalServices as MedicalIcon,
    Contacts as ContactsIcon
} from '@mui/icons-material';
import { useAuth } from '@/contexts/AuthContext';
import studentService from '@/services/student.service';

// Componente de Panel para las pestañas
function TabPanel({ children, value, index, ...other }) {
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`student-tabpanel-${index}`}
            aria-labelledby={`student-tab-${index}`}
            {...other}
            sx={{ py: 3 }}
        >
            {value === index && children}
        </Box>
    );
}

export default function StudentDetailPage() {
    const { id } = useParams();
    const { hasPermission } = useAuth();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const loadStudentDetails = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await studentService.getWithInterventions(id);
                setStudent(data);
            } catch (err) {
                console.error('Error loading student details:', err);
                setError('Error al cargar los detalles del estudiante');
            } finally {
                setLoading(false);
            }
        };

        loadStudentDetails();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
            </Container>
        );
    }

    if (!student) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 2 }}>
                    No se encontró el estudiante solicitado
                </Alert>
            </Container>
        );
    }

    // Componente de información básica del estudiante
    const BasicInfo = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información Personal
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">RUT</Typography>
                        <Typography>{student.rut}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography>{student.email || 'No registrado'}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Fecha de Nacimiento</Typography>
                        <Typography>
                            {new Date(student.birthDate).toLocaleDateString('es-CL')}
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Estado</Typography>
                        <Chip
                            label={student.isActive ? 'Activo' : 'Inactivo'}
                            color={student.isActive ? 'success' : 'default'}
                            size="small"
                        />
                    </Box>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        Información Académica
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Curso</Typography>
                        <Typography>{student.grade}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Tipo de Estudiante</Typography>
                        <Chip
                            label={student.studentType}
                            color={student.studentType === 'Programa Integración' ? 'info' : 'default'}
                            size="small"
                        />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Año Académico</Typography>
                        <Typography>{student.academicYear}</Typography>
                    </Box>
                    {student.hasScholarship && (
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Beca</Typography>
                            <Typography>{student.scholarshipDetails}</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );

    // Componente de información de contacto
    const ContactInfo = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Información de Contacto
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Apoderado Principal</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                            <Typography>{student.guardian1Name || 'No registrado'}</Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Contacto</Typography>
                            <Typography>{student.guardian1Contact || 'No registrado'}</Typography>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Apoderado Suplente</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Nombre</Typography>
                            <Typography>{student.guardian2Name || 'No registrado'}</Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">Contacto</Typography>
                            <Typography>{student.guardian2Contact || 'No registrado'}</Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );

    // Componente de información médica
    const MedicalInfo = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Información Médica
            </Typography>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Información de Salud</Typography>
                <Typography>{student.healthInfo || 'Sin información registrada'}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Condiciones Médicas</Typography>
                <Typography>{student.medicalConditions || 'Sin condiciones registradas'}</Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Alergias</Typography>
                <Typography>{student.allergies || 'Sin alergias registradas'}</Typography>
            </Box>
        </Paper>
    );

    // Componente de intervenciones
    const InterventionsInfo = () => (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Intervenciones
                </Typography>
                {hasPermission('canCreateInterventions') && (
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<AssignmentIcon />}
                    >
                        Nueva Intervención
                    </Button>
                )}
            </Box>
            {student.interventions?.length > 0 ? (
                student.interventions.map((intervention) => (
                    <Paper key={intervention.id} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1">
                            {intervention.title}
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Estado:
                                    <Chip
                                        label={intervention.status}
                                        size="small"
                                        sx={{ ml: 1 }}
                                        color={
                                            intervention.status === 'En Proceso' ? 'primary' :
                                                intervention.status === 'Completada' ? 'success' : 'default'
                                        }
                                    />
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Fecha: {new Date(intervention.dateReported).toLocaleDateString('es-CL')}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                ))
            ) : (
                <Typography color="text.secondary">
                    No hay intervenciones registradas
                </Typography>
            )}
        </Paper>
    );

    return (
        <Container maxWidth="xl">
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
                <MuiLink href="/dashboard" underline="hover" color="inherit">
                    Dashboard
                </MuiLink>
                <MuiLink href="/students" underline="hover" color="inherit">
                    Estudiantes
                </MuiLink>
                <Typography color="text.primary">Detalle</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" component="h1">
                        {student.firstName} {student.lastName}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        {student.grade} · {student.studentType}
                    </Typography>
                </Box>
                {hasPermission('canEditStudents') && (
                    <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        href={`/students/${id}/edit`}
                    >
                        Editar
                    </Button>
                )}
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={tabValue}
                    onChange={(e, newValue) => setTabValue(newValue)}
                    aria-label="student details tabs"
                >
                    <Tab icon={<PersonIcon />} label="Información Básica" />
                    <Tab icon={<ContactsIcon />} label="Contactos" />
                    <Tab icon={<MedicalIcon />} label="Información Médica" />
                    <Tab icon={<AssignmentIcon />} label="Intervenciones" />
                </Tabs>
            </Box>

            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
                <BasicInfo />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ContactInfo />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <MedicalInfo />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <InterventionsInfo />
            </TabPanel>
        </Container>
    );
}