// src/app/layout.js
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }) {
    return (
        <html lang="es">
        <body>
        <AuthProvider>
            {children}
        </AuthProvider>
        </body>
        </html>
    );
}