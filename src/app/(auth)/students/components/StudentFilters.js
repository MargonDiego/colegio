// src/app/(auth)/students/components/StudentFilters.js
'use client';

import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';

export default function StudentFilters({ filters, onFilterChange }) {
    const grades = [
        'Pre-Kinder',
        'Kinder',
        '1° Básico',
        '2° Básico',
        '3° Básico',
        '4° Básico',
        '5° Básico',
        '6° Básico',
        '7° Básico',
        '8° Básico',
        'I Medio',
        'II Medio',
        'III Medio',
        'IV Medio'
    ];

    const studentTypes = [
        { value: 'Regular', label: 'Regular' },
        { value: 'Programa Integración', label: 'Programa Integración' }
    ];

    const handleChange = (field) => (event) => {
        onFilterChange({ [field]: event.target.value });
    };

    return (
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Curso</InputLabel>
                <Select
                    value={filters.grade}
                    label="Curso"
                    onChange={handleChange('grade')}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {grades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                            {grade}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Tipo de Estudiante</InputLabel>
                <Select
                    value={filters.studentType}
                    label="Tipo de Estudiante"
                    onChange={handleChange('studentType')}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {studentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                            {type.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                    value={filters.isActive}
                    label="Estado"
                    onChange={handleChange('isActive')}
                >
                    <MenuItem value={true}>Activos</MenuItem>
                    <MenuItem value={false}>Inactivos</MenuItem>
                    <MenuItem value="">Todos</MenuItem>
                </Select>
            </FormControl>
        </Box>
    );
}