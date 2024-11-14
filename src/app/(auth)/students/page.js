// src/app/(auth)/students/page.js
'use client';

import { useState, useCallback } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    Box,
    IconButton,
    TextField,
    InputAdornment,
    Breadcrumbs,
    Link as MuiLink
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/guards/AuthGuard'; // Importar AuthGuard
import StudentList from './components/StudentList';
import StudentFilters from './components/StudentFilters';

export default function StudentsPage() {
    const router = useRouter();
    const { hasPermission } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        grade: '',
        studentType: '',
        isActive: true
    });

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return (
        <AuthGuard allowedRoles={['admin', 'profesor', 'profesional']}>
            <Container maxWidth="xl">
                <Breadcrumbs sx={{ mb: 2 }}>
                    <MuiLink href="/dashboard" underline="hover" color="inherit">
                        Dashboard
                    </MuiLink>
                    <Typography color="text.primary">Estudiantes</Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Estudiantes
                    </Typography>
                    {hasPermission('canCreateStudents') && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/students/new')}
                        >
                            Nuevo Estudiante
                        </Button>
                    )}
                </Box>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Buscar estudiante..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ flexGrow: 1, maxWidth: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery && (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={clearSearch}>
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <StudentFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />
                    </Box>
                </Paper>

                <StudentList searchQuery={searchQuery} filters={filters} />
            </Container>
        </AuthGuard>
    );
}
