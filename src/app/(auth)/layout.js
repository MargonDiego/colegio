// src/app/(auth)/layout.js
'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Divider,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    School as SchoolIcon,
    Assignment as AssignmentIcon,
    Logout as LogoutIcon,
    AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

// Componente para el menú de usuario
const UserMenu = ({ anchorEl, onClose, user, roleLabel, onLogout }) => {
    const handleLogout = useCallback(() => {
        onClose();
        onLogout();
    }, [onClose, onLogout]);

    return (
        <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            onClick={onClose}
            PaperProps={{
                sx: {
                    minWidth: 200,
                    mt: 1.5
                }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <MenuItem disabled>
                <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                    primary={user?.email}
                    secondary={roleLabel}
                    primaryTypographyProps={{
                        variant: 'body2'
                    }}
                    secondaryTypographyProps={{
                        variant: 'caption'
                    }}
                />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Cerrar Sesión" />
            </MenuItem>
        </Menu>
    );
};

// Navegación principal
const mainNavigation = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />
    },
    {
        name: 'Estudiantes',
        path: '/students',
        icon: <SchoolIcon />
    },
    {
        name: 'Intervenciones',
        path: '/interventions',
        icon: <AssignmentIcon />
    }
];

export default function AuthLayout({ children }) {
    const pathname = usePathname();
    const { user, logout, roleLabel } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleMenuOpen = useCallback((event) => {
        setMenuAnchor(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setMenuAnchor(null);
    }, []);

    const handleDrawerToggle = useCallback(() => {
        setDrawerOpen(prev => !prev);
    }, []);

    return (
        <AuthGuard>
            <Box sx={{ display: 'flex' }}>
                {/* Barra superior */}
                <AppBar
                    position="fixed"
                    sx={{
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                        bgcolor: 'background.paper',
                        color: 'text.primary'
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            onClick={handleDrawerToggle}
                            edge="start"
                            sx={{ mr: 2, display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            Sistema de Convivencia Escolar
                        </Typography>

                        {/* Perfil de usuario */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    display: { xs: 'none', sm: 'block' }
                                }}
                            >
                                {user?.firstName} {user?.lastName}
                            </Typography>
                            <IconButton
                                onClick={handleMenuOpen}
                                size="small"
                                sx={{ ml: 1 }}
                                aria-controls={Boolean(menuAnchor) ? 'user-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={Boolean(menuAnchor) ? 'true' : undefined}
                            >
                                <Avatar sx={{ width: 32, height: 32 }}>
                                    {user?.firstName?.[0]}
                                </Avatar>
                            </IconButton>
                        </Box>

                        {/* Menú de usuario como componente separado */}
                        <UserMenu
                            anchorEl={menuAnchor}
                            onClose={handleMenuClose}
                            user={user}
                            roleLabel={roleLabel}
                            onLogout={logout}
                        />
                    </Toolbar>
                </AppBar>

                {/* Sidebar */}
                <Drawer
                    variant={isMobile ? "temporary" : "permanent"}
                    open={drawerOpen}
                    onClose={handleDrawerToggle}
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: '1px solid',
                            borderColor: 'divider'
                        },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto', py: 2 }}>
                        <List>
                            {mainNavigation.map((item) => (
                                <ListItem key={item.path} disablePadding>
                                    <ListItemButton
                                        component={Link}
                                        href={item.path}
                                        selected={pathname.startsWith(item.path)}
                                        sx={{
                                            '&.Mui-selected': {
                                                bgcolor: 'primary.light',
                                                '&:hover': {
                                                    bgcolor: 'primary.light',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: 'primary.main',
                                                },
                                                '& .MuiListItemText-primary': {
                                                    color: 'primary.main',
                                                    fontWeight: 'bold',
                                                },
                                            },
                                        }}
                                    >
                                        <ListItemIcon>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText primary={item.name} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Drawer>

                {/* Contenido principal */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: 3,
                        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
                        minHeight: '100vh',
                        bgcolor: 'grey.50',
                        mt: '64px'
                    }}
                >
                    {children}
                </Box>
            </Box>
        </AuthGuard>
    );
}