// src/app/(auth)/interventions/components/InterventionList.js
import React, { useCallback } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    TableSortLabel,
    Chip,
    IconButton,
    Tooltip,
    Box
} from '@mui/material';
import {
    Edit as EditIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PRIORITY_COLORS = {
    1: 'error',    // Alta
    2: 'warning',  // Media
    3: 'info'      // Baja
};

const STATUS_COLORS = {
    'Pendiente': 'warning',
    'En Proceso': 'info',
    'Resuelto': 'success',
    'Cerrado': 'default'
};

const InterventionList = ({
                              interventions = [],
                              onEdit,
                              onDelete,
                              loading = false,
                              page = 0,
                              rowsPerPage = 10,
                              totalCount = 0,
                              onPageChange,
                              onRowsPerPageChange,
                              orderBy = 'dateReported',
                              orderDirection = 'desc',
                              onSort
                          }) => {
    const router = useRouter();
    const { hasPermission } = useAuth();

    const handleViewDetails = useCallback((id) => {
        router.push(`/interventions/${id}`);
    }, [router]);

    const getPriorityLabel = (priority) => {
        const labels = { 1: 'Alta', 2: 'Media', 3: 'Baja' };
        return labels[priority] || 'N/A';
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && orderDirection === 'asc';
        onSort(property, isAsc ? 'desc' : 'asc');
    };

    console.log('Rendering InterventionList with:', {
        interventionsCount: interventions.length,
        loading,
        page,
        rowsPerPage,
        totalCount
    });

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'dateReported'}
                                    direction={orderBy === 'dateReported' ? orderDirection : 'asc'}
                                    onClick={() => handleSort('dateReported')}
                                >
                                    Fecha
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'title'}
                                    direction={orderBy === 'title' ? orderDirection : 'asc'}
                                    onClick={() => handleSort('title')}
                                >
                                    Título
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'type'}
                                    direction={orderBy === 'type' ? orderDirection : 'asc'}
                                    onClick={() => handleSort('type')}
                                >
                                    Tipo
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Estudiante</TableCell>
                            <TableCell>Responsable</TableCell>
                            <TableCell align="center">Prioridad</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Cargando...
                                </TableCell>
                            </TableRow>
                        ) : interventions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No se encontraron intervenciones
                                </TableCell>
                            </TableRow>
                        ) : (
                            interventions.map((intervention) => (
                                <TableRow key={intervention.id} hover>
                                    <TableCell>
                                        {intervention.dateReported ?
                                            new Date(intervention.dateReported).toLocaleDateString('es-CL') :
                                            'Sin fecha'
                                        }
                                    </TableCell>
                                    <TableCell>{intervention.title}</TableCell>
                                    <TableCell>{intervention.type}</TableCell>
                                    <TableCell>
                                        {intervention.student ?
                                            `${intervention.student.firstName} ${intervention.student.lastName}` :
                                            'No asignado'
                                        }
                                    </TableCell>
                                    <TableCell>
                                        {intervention.responsible ?
                                            `${intervention.responsible.firstName} ${intervention.responsible.lastName}` :
                                            'No asignado'
                                        }
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={getPriorityLabel(intervention.priority)}
                                            color={PRIORITY_COLORS[intervention.priority]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={intervention.status}
                                            color={STATUS_COLORS[intervention.status]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ '& > button': { m: 0.5 } }}>
                                            <Tooltip title="Ver detalles">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleViewDetails(intervention.id)}
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </Tooltip>

                                            {hasPermission('canEditInterventions') && (
                                                <Tooltip title="Editar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(intervention.id)}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {hasPermission('canDeleteInterventions') && (
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onDelete(intervention.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={onPageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 25, 50]}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count}`
                }
            />
        </Paper>
    );
};

export default InterventionList;