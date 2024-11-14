// src/app/auth/login/page.js

'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
    const { login, error: authError, loading } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    /**
     * Maneja los cambios en los campos del formulario
     * @param {Object} e - Evento del input
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormError(''); // Limpiar errores al modificar campos
    };

    /**
     * Maneja el envío del formulario
     * @param {Object} e - Evento del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
        if (!formData.email || !formData.password) {
            setFormError('Todos los campos son requeridos');
            return;
        }

        try {
            await login(formData);
        } catch (error) {
            setFormError(error.message || 'Error al iniciar sesión');
        }
    };

    return (
        <Box className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md w-full">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <Typography variant="h4" component="h1" gutterBottom>
                            Iniciar Sesión
                        </Typography>
                        <Typography color="textSecondary">
                            Sistema de Convivencia Escolar
                        </Typography>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                        {(formError || authError) && (
                            <Alert severity="error" className="mb-4">
                                {formError || authError?.message}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            disabled={loading}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Contraseña"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            variant="outlined"
                            disabled={loading}
                            required
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={loading}
                            className="mt-6"
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
}