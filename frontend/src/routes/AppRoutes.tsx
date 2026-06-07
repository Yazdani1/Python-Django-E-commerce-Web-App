import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingSpinner } from "@/components/common";
import { ROUTES } from "@/constants";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected routes — all share the AuthLayout (AppBar + nav) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
            <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
          </Route>
        </Route>

        <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
