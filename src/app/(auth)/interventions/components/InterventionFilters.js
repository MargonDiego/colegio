// src/app/(auth)/interventions/components/InterventionFilters.js
import React from 'react';
import {
    Paper,
    Grid,
    TextField,
    MenuItem,
    IconButton,
    Box,
    Typography,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Clear as ClearIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';

const InterventionFilters = ({
                                 filters,
                                 onFilterChange,
                                 onClearFilters,
                                 loading
                             }) => {
    const handleChange = (field) => (event) => {
        onFilterChange({
            ...filters,
            [field]: event.target.value
        });
    };

    const handleDateChange = (field) => (event) => {
        onFilterChange({
            ...filters,
            [field]: event.target.value
        });
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Filtros</Typography>
                <IconButton onClick={onClearFilters} disabled={loading}>
                    <ClearIcon />
                </IconButton>
            </Box>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Estado"
                        value={filters.status || ''}
                        onChange={handleChange('status')}
                        disabled={loading}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="En Proceso">En Proceso</MenuItem>
                        <MenuItem value="Resuelto">Resuelto</MenuItem>
                        <MenuItem value="Cerrado">Cerrado</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Prioridad"
                        value={filters.priority || ''}
                        onChange={handleChange('priority')}
                        disabled={loading}
                    >
                        <MenuItem value="">Todas</MenuItem>
                        <MenuItem value={1}>Alta</MenuItem>
                        <MenuItem value={2}>Media</MenuItem>
                        <MenuItem value={3}>Baja</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        select
                        fullWidth
                        label="Tipo"
                        value={filters.type || ''}
                        onChange={handleChange('type')}
                        disabled={loading}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="Comportamiento">Comportamiento</MenuItem>
                        <MenuItem value="Académico">Académico</MenuItem>
                        <MenuItem value="Asistencia">Asistencia</MenuItem>
                        <MenuItem value="Salud">Salud</MenuItem>
                        <MenuItem value="Familiar">Familiar</MenuItem>
                        <MenuItem value="Social">Social</MenuItem>
                        <MenuItem value="Emocional">Emocional</MenuItem>
                        <MenuItem value="Otro">Otro</MenuItem>
                    </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Fecha desde"
                        type="date"
                        value={filters.dateFrom || ''}
                        onChange={handleDateChange('dateFrom')}
                        disabled={loading}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Fecha hasta"
                        type="date"
                        value={filters.dateTo || ''}
                        onChange={handleDateChange('dateTo')}
                        disabled={loading}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CalendarIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Buscar estudiante"
                        value={filters.studentSearch || ''}
                        onChange={handleChange('studentSearch')}
                        disabled={loading}
                        InputProps={{
                            endAdornment: filters.studentSearch && (
                                <IconButton
                                    size="small"
                                    onClick={() => onFilterChange({ ...filters, studentSearch: '' })}
                                >
                                    <ClearIcon />
                                </IconButton>
                            ),
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Buscar responsable"
                        value={filters.responsibleSearch || ''}
                        onChange={handleChange('responsibleSearch')}
                        disabled={loading}
                        InputProps={{
                            endAdornment: filters.responsibleSearch && (
                                <IconButton
                                    size="small"
                                    onClick={() => onFilterChange({ ...filters, responsibleSearch: '' })}
                                >
                                    <ClearIcon />
                                </IconButton>
                            ),
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default InterventionFilters;