// src/App.tsx

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/auth/auth.thunks';

import Index from '@/pages/Index';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import NotFound from '@/pages/NotFound';

import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';

/* =========================
   ROUTE GUARDS
========================= */

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const user = useAppSelector((state) => state.auth.user);
  return user ? <Navigate to="/" replace /> : <>{children}</>;
}

/* =========================
   ROUTES
========================= */

function AppRoutes() {
  return (
    <Routes>
      {/* ---------- AUTH ---------- */}
      <Route
        path="/login"
        element={
          <AuthRoute>
            <LoginPage />
          </AuthRoute>
        }
      />

      <Route
        path="/register"
        element={
          <AuthRoute>
            <RegisterPage />
          </AuthRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <AuthRoute>
            <ForgotPasswordPage />
          </AuthRoute>
        }
      />

      {/* ---------- MAIN CHAT ---------- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

      {/* ---------- DESKTOP / TABLET PAGES ---------- */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* ---------- FALLBACK ---------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/* =========================
   APP ROOT
========================= */

export default function App() {
  const dispatch = useAppDispatch();
  const { status } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(checkAuth());
    }
  }, [status, dispatch]);

  if (status === 'idle') {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  );
}
