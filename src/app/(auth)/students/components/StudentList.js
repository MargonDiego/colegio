// src/app/(auth)/students/components/StudentList.js
'use client';

import { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    Box
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import studentService from '@/services/student.service';

export default function StudentList({ searchQuery, filters }) {
    const router = useRouter();
    const { hasPermission } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        const loadStudents = async () => {
            try {
                setLoading(true);
                setError(null);

                // Construir parámetros de consulta
                const params = {
                    search: searchQuery,
                    ...filters
                };

                const data = await studentService.getAll(params);
                setStudents(data);
            } catch (err) {
                console.error('Error loading students:', err);
                setError('Error al cargar los estudiantes');
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, [searchQuery, filters]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>RUT</TableCell>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Curso</TableCell>
                            <TableCell>Tipo</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.rut}</TableCell>
                                    <TableCell>
                                        {student.firstName} {student.lastName}
                                    </TableCell>
                                    <TableCell>{student.grade}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={student.studentType}
                                            color={student.studentType === 'Programa Integración' ? 'info' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={student.isActive ? 'Activo' : 'Inactivo'}
                                            color={student.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Ver detalles">
                                            <IconButton
                                                onClick={() => router.push(`/students/${student.id}`)}
                                                size="small"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                        {hasPermission('canEditStudents') && (
                                            <Tooltip title="Editar">
                                                <IconButton
                                                    onClick={() => router.push(`/students/${student.id}/edit`)}
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={students.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => {
                    setRowsPerPage(parseInt(event.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count}`
                }
            />
        </Paper>
    );
}