// src/app/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Box,
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress, Button, Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    Warning as WarningIcon
} from '@mui/icons-material';

import StudentService from '@/services/student.service';
import InterventionService from '@/services/intervention.service';

/**
 * Dashboard principal con métricas y accesos rápidos
 */
export default function DashboardPage() {
    const { user, loading: authLoading, hasPermission, roleLabel } = useAuth();
    const [metrics, setMetrics] = useState({
        totalStudents: 0,
        activeInterventions: 0,
        pendingInterventions: 0,
        highPriorityInterventions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Cargar métricas de estudiantes
                const students = await StudentService.getAll();
                const interventions = await InterventionService.getAll();

                // Calcular métricas
                const activeInterventions = interventions.filter(
                    int => int.status === 'En Proceso'
                );
                const pendingInterventions = interventions.filter(
                    int => int.status === 'Pendiente'
                );
                const highPriorityInterventions = interventions.filter(
                    int => int.priority === 1
                );

                setMetrics({
                    totalStudents: students.length,
                    activeInterventions: activeInterventions.length,
                    pendingInterventions: pendingInterventions.length,
                    highPriorityInterventions: highPriorityInterventions.length
                });

            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setError('Error al cargar los datos del dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            loadDashboardData();
        }
    }, [authLoading, user]);

    if (authLoading || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const MetricCard = ({ title, value, icon: Icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                    <Icon sx={{ color: color, mr: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" component="div">
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                    Bienvenido, {user.firstName} ({roleLabel})
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {hasPermission('canViewAllStudents') && (
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard
                            title="Total Estudiantes"
                            value={metrics.totalStudents}
                            icon={SchoolIcon}
                            color="primary.main"
                        />
                    </Grid>
                )}

                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Intervenciones Activas"
                        value={metrics.activeInterventions}
                        icon={AssignmentIcon}
                        color="success.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Intervenciones Pendientes"
                        value={metrics.pendingInterventions}
                        icon={PersonIcon}
                        color="warning.main"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard
                        title="Alta Prioridad"
                        value={metrics.highPriorityInterventions}
                        icon={WarningIcon}
                        color="error.main"
                    />
                </Grid>

                {/* Lista de últimas intervenciones */}
                <Grid item xs={12}>
                    <RecentInterventions />
                </Grid>

                {/* Panel de acciones rápidas */}
                <Grid item xs={12} md={4}>
                    <QuickActions />
                </Grid>
            </Grid>
        </Container>
    );
}

// Componente para mostrar intervenciones recientes
function RecentInterventions() {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInterventions = async () => {
            try {
                setLoading(true);
                const data = await InterventionService.getAll({ limit: 5 });
                setInterventions(data);
            } catch (error) {
                console.error('Error loading recent interventions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadInterventions();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Últimas Intervenciones
                </Typography>
                {interventions.map((intervention) => (
                    <Box key={intervention.id} mb={2}>
                        <Typography variant="subtitle1">
                            {intervention.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {new Date(intervention.dateReported).toLocaleDateString()}
                        </Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
}

// Componente para acciones rápidas según el rol
function QuickActions() {
    const { hasPermission } = useAuth();

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                </Typography>
                <Grid container spacing={2}>
                    {hasPermission('canCreateInterventions') && (
                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<AssignmentIcon />}
                            >
                                Nueva Intervención
                            </Button>
                        </Grid>
                    )}

                    {hasPermission('canCreateStudents') && (
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                startIcon={<PersonIcon />}
                            >
                                Nuevo Estudiante
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}