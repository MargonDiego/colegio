// src/components/guards/AuthGuard.js

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress } from '@mui/material';

/**
 * Componente para proteger rutas que requieren autenticación
 * Verifica la autenticación y los roles permitidos
 */
export function AuthGuard({
                              children,
                              allowedRoles = [], // Roles permitidos para acceder a la ruta
                              requireAuth = true // Si la ruta requiere autenticación
                          }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (requireAuth && !isAuthenticated) {
                // Guardar la ruta actual para redireccionar después del login
                sessionStorage.setItem('returnUrl', pathname);
                router.push('/auth/login');
                return;
            }

            if (isAuthenticated && pathname === '/auth/login') {
                // Si está autenticado y trata de acceder al login, redirigir
                router.push('/dashboard');
                return;
            }

            // Verificar roles si se especifican
            if (allowedRoles.length > 0 && user) {
                const hasRequiredRole = allowedRoles.includes(user.role);
                if (!hasRequiredRole) {
                    router.push('/unauthorized');
                    return;
                }
            }

            setVerified(true);
        }
    }, [loading, isAuthenticated, user, router, pathname, allowedRoles, requireAuth]);

    // Mostrar loading mientras se verifica
    if (loading || !verified) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <CircularProgress />
            </div>
        );
    }

    // Renderizar children solo si pasa todas las verificaciones
    return <>{children}</>;
}
