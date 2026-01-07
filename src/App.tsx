import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { checkAuth } from "@/store/auth/auth.thunks";

import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import NotFound from "@/pages/NotFound";

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
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        }
      />

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

  // Run once on app boot (refresh-safe login)
  useEffect(() => {
    if (status === "idle") {
      dispatch(checkAuth());
    }
  }, [status, dispatch]);

  // Global auth bootstrap loading
  if (status === "idle" || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
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
