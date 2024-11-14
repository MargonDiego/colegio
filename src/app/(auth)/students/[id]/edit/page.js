// src/app/(auth)/students/[id]/edit/page.js
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Container, Typography, Breadcrumbs, Link as MuiLink, Paper, Box } from '@mui/material';
import { AuthGuard } from '@/components/guards/AuthGuard';
import StudentForm from '../../components/StudentForm';

export default function EditStudentPage({ params }) {
    const router = useRouter();
    const [studentId, setStudentId] = useState(null);

    useEffect(() => {
        // Desempaquetar params.id como promesa
        params.then((resolvedParams) => {
            setStudentId(resolvedParams.id);
        });
    }, [params]);

    if (!studentId) {
        return <p>Cargando...</p>; // Placeholder para cuando el ID aún no está listo
    }

    return (
        <AuthGuard allowedRoles={['admin', 'profesor']} requiredPermission="canEditStudents">
            <Container maxWidth="md">
                <Breadcrumbs sx={{ mb: 2 }}>
                    <MuiLink href="/dashboard" underline="hover" color="inherit">
                        Dashboard
                    </MuiLink>
                    <MuiLink href="/students" underline="hover" color="inherit">
                        Estudiantes
                    </MuiLink>
                    <Typography color="text.primary">Editar Estudiante</Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Editar Estudiante
                    </Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <StudentForm studentId={studentId} onSuccess={() => router.push('/students')} />
                </Paper>
            </Container>
        </AuthGuard>
    );
}
