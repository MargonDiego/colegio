// src/app/(auth)/interventions/page.js
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    Breadcrumbs,
    Link as MuiLink,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import interventionService from '@/services/intervention.service';
import InterventionList from './components/InterventionList';
import InterventionFilters from './components/InterventionFilters';

const defaultFilters = {
    status: '',
    priority: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    studentSearch: '',
    responsibleSearch: ''
};

export default function InterventionsPage() {
    const router = useRouter();
    const { hasPermission } = useAuth();

    // Estados
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allInterventions, setAllInterventions] = useState([]);
    const [filters, setFilters] = useState(defaultFilters);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [orderBy, setOrderBy] = useState('dateReported');
    const [orderDirection, setOrderDirection] = useState('desc');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [interventionToDelete, setInterventionToDelete] = useState(null);

    // Cargar todas las intervenciones
    const loadInterventions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await interventionService.getAll();
            setAllInterventions(response);
        } catch (error) {
            console.error('Error loading interventions:', error);
            setError('Error al cargar las intervenciones. Por favor, intente nuevamente.');
            setAllInterventions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Filtrar intervenciones
    const filteredInterventions = useMemo(() => {
        return allInterventions.filter(intervention => {
            // Filtro por estado
            if (filters.status && intervention.status !== filters.status) {
                return false;
            }

            // Filtro por prioridad
            if (filters.priority && intervention.priority !== Number(filters.priority)) {
                return false;
            }

            // Filtro por tipo
            if (filters.type && intervention.type !== filters.type) {
                return false;
            }

            // Filtro por fecha desde
            if (filters.dateFrom) {
                const dateFrom = new Date(filters.dateFrom);
                const interventionDate = new Date(intervention.dateReported);
                if (interventionDate < dateFrom) {
                    return false;
                }
            }

            // Filtro por fecha hasta
            if (filters.dateTo) {
                const dateTo = new Date(filters.dateTo);
                dateTo.setHours(23, 59, 59);
                const interventionDate = new Date(intervention.dateReported);
                if (interventionDate > dateTo) {
                    return false;
                }
            }

            // Filtro por búsqueda de estudiante
            if (filters.studentSearch && intervention.student) {
                const searchTerm = filters.studentSearch.toLowerCase();
                const studentName = `${intervention.student.firstName} ${intervention.student.lastName}`.toLowerCase();
                if (!studentName.includes(searchTerm)) {
                    return false;
                }
            }

            // Filtro por búsqueda de responsable
            if (filters.responsibleSearch && intervention.responsible) {
                const searchTerm = filters.responsibleSearch.toLowerCase();
                const responsibleName = `${intervention.responsible.firstName} ${intervention.responsible.lastName}`.toLowerCase();
                if (!responsibleName.includes(searchTerm)) {
                    return false;
                }
            }

            return true;
        });
    }, [allInterventions, filters]);

    // Ordenar y paginar intervenciones
    const sortedAndPaginatedInterventions = useMemo(() => {
        let result = [...filteredInterventions];

        // Ordenar
        if (orderBy) {
            result.sort((a, b) => {
                let aValue = a[orderBy];
                let bValue = b[orderBy];

                // Manejo especial para fechas
                if (orderBy === 'dateReported') {
                    aValue = new Date(aValue).getTime();
                    bValue = new Date(bValue).getTime();
                }

                if (orderDirection === 'asc') {
                    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
                } else {
                    return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
                }
            });
        }

        // Paginación
        const startIndex = page * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return result.slice(startIndex, endIndex);
    }, [filteredInterventions, orderBy, orderDirection, page, rowsPerPage]);

    // Efecto inicial
    useEffect(() => {
        loadInterventions();
    }, [loadInterventions]);

    // Manejadores de eventos
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
        setPage(0);
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(defaultFilters);
        setPage(0);
    }, []);

    const handlePageChange = useCallback((event, newPage) => {
        setPage(newPage);
    }, []);

    const handleRowsPerPageChange = useCallback((event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleSort = useCallback((property, direction) => {
        setOrderBy(property);
        setOrderDirection(direction);
    }, []);

    const handleEdit = useCallback((id) => {
        router.push(`/interventions/${id}/edit`);
    }, [router]);

    const handleDeleteClick = useCallback((id) => {
        setInterventionToDelete(id);
        setDeleteDialogOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        try {
            setLoading(true);
            await interventionService.delete(interventionToDelete);
            await loadInterventions();
            setDeleteDialogOpen(false);
            setInterventionToDelete(null);
        } catch (error) {
            console.error('Error deleting intervention:', error);
            setError('Error al eliminar la intervención. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    }, [interventionToDelete, loadInterventions]);

    return (
        <Container maxWidth="xl">
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 2 }}>
                <MuiLink href="/dashboard" underline="hover" color="inherit">
                    Dashboard
                </MuiLink>
                <Typography color="text.primary">Intervenciones</Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Intervenciones
                </Typography>
                {hasPermission('canCreateInterventions') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/interventions/new')}
                    >
                        Nueva Intervención
                    </Button>
                )}
            </Box>

            {/* Mensajes de error */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Filtros */}
            <InterventionFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                loading={loading}
            />

            {/* Lista de intervenciones */}
            <InterventionList
                interventions={sortedAndPaginatedInterventions}
                loading={loading}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={filteredInterventions.length}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                orderBy={orderBy}
                orderDirection={orderDirection}
                onSort={handleSort}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
            />

            {/* Diálogo de confirmación de eliminación */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirmar eliminación</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Está seguro que desea eliminar esta intervención? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        disabled={loading}
                    >
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}