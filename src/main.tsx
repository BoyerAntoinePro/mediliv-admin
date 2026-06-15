import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './assets/index.scss';

import { AuthProvider } from './Context/AuthContext';
import { ProtectedRoute } from './Components/Auth/ProtectedRoute';
import { PublicRoute } from './Components/Auth/PublicRoute';
import { AppLayout } from './Components/Layout/AppLayout';
import { LoginPage } from './Pages/Auth/Login/Login.page';
import { PaymentsPage } from './Pages/Payments/Payments.page';

const myColor: [string, string, string, string, string, string, string, string, string, string] = [
  '#f2eefb',
  '#e0d9f2',
  '#beaee7',
  '#9b81dd',
  '#7d5bd4',
  '#6a43cf',
  '#6137ce',
  '#512ab6',
  '#4825a3',
  '#412099',
];

const accentGreen: [string, string, string, string, string, string, string, string, string, string] = [
  '#e8f5e9',
  '#c8e6c9',
  '#a5d6a7',
  '#81c784',
  '#66bb6a',
  '#4caf50',
  '#43a047',
  '#388e3c',
  '#2e7d32',
  '#1b5e20',
];

const theme = createTheme({
  colors: { myColor, accentGreen },
  primaryColor: 'myColor',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/payments" replace />} />
              <Route path="/payments" element={<PaymentsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
