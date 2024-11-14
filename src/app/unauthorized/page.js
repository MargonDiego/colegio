// src/app/unauthorized/page.js
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Button,
    Container,
    Typography,
    Paper,
    ThemeProvider,
    createTheme
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Crear una instancia del tema
const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3',
        },
        background: {
            default: '#f5f5f5',
        },
    },
});

export default function UnauthorizedPage() {
    const router = useRouter();

    const handleGoToDashboard = () => {
        router.push('/dashboard');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    bgcolor: 'background.default',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Container component="main" maxWidth="sm">
                    <Paper
                        elevation={2}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 4,
                            borderRadius: 2,
                        }}
                    >
                        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                        <Typography component="h1" variant="h4" gutterBottom>
                            Unauthorized Access
                        </Typography>
                        <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{ mb: 3 }}>
                            You don't have permission to access this page.
                            Please return to the dashboard or contact an administrator if you believe this is an error.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleGoToDashboard}
                            sx={{
                                minWidth: 200,
                                fontWeight: 'bold',
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </Paper>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
