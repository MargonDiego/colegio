// src/app/(auth)/students/new/page.js
'use client';

import { useRouter } from 'next/navigation';
import { Container, Typography, Breadcrumbs, Link as MuiLink, Paper, Box } from '@mui/material';
import { AuthGuard } from '@/components/guards/AuthGuard';
import StudentForm from '../components/StudentForm';

export default function NewStudentPage() {
    const router = useRouter();

    return (
        <AuthGuard allowedRoles={['admin', 'profesor']} requiredPermission="canCreateStudents">
            <Container maxWidth="md">
                <Breadcrumbs sx={{ mb: 2 }}>
                    <MuiLink href="/dashboard" underline="hover" color="inherit">
                        Dashboard
                    </MuiLink>
                    <MuiLink href="/students" underline="hover" color="inherit">
                        Estudiantes
                    </MuiLink>
                    <Typography color="text.primary">Nuevo Estudiante</Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Crear Estudiante
                    </Typography>
                </Box>

                <Paper sx={{ p: 3 }}>
                    <StudentForm onSuccess={() => router.push('/students')} />
                </Paper>
            </Container>
        </AuthGuard>
    );
}
