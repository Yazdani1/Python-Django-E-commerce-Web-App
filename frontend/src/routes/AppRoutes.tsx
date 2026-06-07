import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoadingSpinner } from "@/components/common";
import { ROUTES } from "@/constants";

// Public pages — wrapped in top-level Suspense (no sidebar, full-page spinner is fine)
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const ProductDetailPage = lazy(() => import("@/pages/ProductDetailPage"));

// Protected pages — Suspense is handled inside AuthLayout (content area only)
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const ChangePasswordPage = lazy(() => import("@/pages/ChangePasswordPage"));
const CategoriesPage = lazy(() => import("@/pages/CategoriesPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));

const AppRoutes = () => (
  <Routes>
    {/* Public routes — full-page Suspense is fine here */}
    <Route
      path={ROUTES.HOME}
      element={
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <HomePage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.LOGIN}
      element={
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <LoginPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.REGISTER}
      element={
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <RegisterPage />
        </Suspense>
      }
    />
    <Route
      path={ROUTES.PRODUCT_DETAIL}
      element={
        <Suspense fallback={<LoadingSpinner fullPage />}>
          <ProductDetailPage />
        </Suspense>
      }
    />

    {/* Protected routes — AuthLayout contains its own Suspense for the content area */}
    <Route element={<ProtectedRoute />}>
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />
        <Route path={ROUTES.ORDERS} element={<OrdersPage />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
  </Routes>
);

export default AppRoutes;
