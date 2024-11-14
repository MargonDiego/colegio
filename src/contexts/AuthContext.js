// src/contexts/AuthContext.js
'use client'

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import AUTH_CONFIG, { AuthHelpers } from '@/config/auth.config';

/**
 * Contexto para manejar el estado de autenticación global
 */
export const AuthContext = createContext(null);

/**
 * Proveedor del contexto de autenticación
 */
export function AuthProvider({ children }) {
    // Estados principales
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();

    /**
     * Inicialización del estado de autenticación
     */
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);
                setError(null);

                // Si hay un token almacenado, intentar recuperar la sesión
                if (authService.isAuthenticated()) {
                    const userData = await authService.getProfile();
                    if (userData && AuthHelpers.isValidRole(userData.role)) {
                        console.log('Sesión recuperada:', userData.email);
                        setUser(userData);
                    } else {
                        console.warn('Rol no válido o datos de usuario incorrectos');
                        throw new Error('Sesión inválida');
                    }
                }
            } catch (error) {
                console.error('Error al inicializar autenticación:', error);
                setError(error);
                authService.clearSession();
                router.push(AUTH_CONFIG.ROUTES.DEFAULT);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [router]);

    /**
     * Maneja el proceso de inicio de sesión
     * @param {Object} credentials Credenciales del usuario
     * @returns {Promise<Object>} Datos del usuario y token
     */
    const login = async (credentials) => {
        try {
            setLoading(true);
            setError(null);

            // Intentar login
            const response = await authService.login(credentials);

            // Validar el rol del usuario
            if (!AuthHelpers.isValidRole(response.user.role)) {
                throw new Error('Rol de usuario no válido');
            }

            // Establecer el usuario en el contexto
            setUser(response.user);

            // Obtener la ruta de redirección según el rol
            const redirectPath = AuthHelpers.getDefaultRoute(response.user.role);

            console.log(`Login exitoso - Usuario: ${response.user.email} (${response.user.role})`);
            console.log(`Redirigiendo a: ${redirectPath}`);

            // Redirigir al usuario
            router.push(redirectPath);

            return response;

        } catch (error) {
            console.error('Error en login:', error);
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Maneja el proceso de cierre de sesión
     */
    const logout = async () => {
        try {
            setLoading(true);
            await authService.logout();
            setUser(null);
            router.push(AUTH_CONFIG.ROUTES.DEFAULT);
        } catch (error) {
            console.error('Error en logout:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Actualiza los datos del usuario en el contexto
     * @param {Object} userData Nuevos datos del usuario
     */
    const updateUser = (userData) => {
        setUser(prevUser => ({
            ...prevUser,
            ...userData
        }));
    };

    // Valores y funciones expuestas por el contexto
    const value = {
        // Estados
        user,
        loading,
        error,
        isAuthenticated: !!user,

        // Acciones de autenticación
        login,
        logout,
        updateUser,

        // Helpers de rol y permisos
        hasRole: (role) => user?.role === role,
        hasPermission: (permission) => AuthHelpers.hasPermission(user?.role, permission),
        roleLabel: user ? AuthHelpers.getRoleLabel(user.role) : '',

        // Datos computados
        isAdmin: user?.role === AUTH_CONFIG.ROLES.ADMIN,
        isTeacher: user?.role === AUTH_CONFIG.ROLES.PROFESOR,
        isProfessional: user?.role === AUTH_CONFIG.ROLES.PROFESIONAL,

        // Meta información
        userFullName: user ? `${user.firstName} ${user.lastName}` : '',
        userEmail: user?.email || ''
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook personalizado para usar el contexto de autenticación
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};