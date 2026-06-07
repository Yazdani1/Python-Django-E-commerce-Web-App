import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingSpinner } from "@/components/common";
import { ROUTES } from "@/constants";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));

const AppRoutes = () => (
  <Suspense fallback={<LoadingSpinner fullPage />}>
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

      {/* Protected routes — all share the sidebar layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  </Suspense>
);

export default AppRoutes;
