import { useCallback, useEffect, useState } from "react";
import { Box, Card, Chip, Divider, Grid, Skeleton, Typography } from "@mui/material";
import {
  AttachMoney as RevenueIcon,
  Category as CategoryIcon,
  Inventory2 as InventoryIcon,
  ListAlt as OrdersIcon,
  Lock as LockIcon,
  People as UsersIcon,
  Person as PersonIcon,
  PendingActions as PendingIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common";
import { dashboardApi } from "@/api/dashboardApi";
import { useApi } from "@/hooks/useApi";
import { ROUTES } from "@/constants";
import type { AdminStats } from "@/types";

const QUICK_LINKS = [
  { label: "Products", description: "Browse and manage the product catalogue.", to: ROUTES.PRODUCTS, icon: <InventoryIcon />, color: "warning.main" },
  { label: "Categories", description: "Browse and manage product categories.", to: ROUTES.CATEGORIES, icon: <CategoryIcon />, color: "primary.main" },
  { label: "My Orders", description: "View and track your orders.", to: ROUTES.ORDERS, icon: <OrdersIcon />, color: "info.main" },
  { label: "My Profile", description: "Update your name and phone number.", to: ROUTES.PROFILE, icon: <PersonIcon />, color: "secondary.main" },
  { label: "Change Password", description: "Update your account password.", to: ROUTES.CHANGE_PASSWORD, icon: <LockIcon />, color: "success.main" },
];

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
  <Card variant="outlined" sx={{ p: 2.5 }}>
    <Box display="flex" alignItems="flex-start" justifyContent="space-between">
      <Box>
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={700}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
        }}
      >
        {icon}
      </Box>
    </Box>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  const { execute: fetchStats, isLoading: statsLoading } = useApi(
    useCallback(() => dashboardApi.getStats(), [])
  );

  useEffect(() => {
    if (user?.is_staff) {
      fetchStats().then((r) => {
        if (r.data) setStats(r.data);
      });
    }
  }, [user?.is_staff, fetchStats]);

  if (!user) return <LoadingSpinner message="Loading…" />;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back{user.first_name ? `, ${user.first_name}` : ""}!
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          {user.is_staff && (
            <Chip label="Admin" size="small" color="primary" variant="outlined" />
          )}
        </Box>
      </Box>

      {/* Admin stats */}
      {user.is_staff && (
        <>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Store Overview
          </Typography>
          {statsLoading ? (
            <Grid container spacing={2} mb={4}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rounded" height={90} />
                </Grid>
              ))}
            </Grid>
          ) : stats ? (
            <Grid container spacing={2} mb={4}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Total Users" value={stats.total_users} icon={<UsersIcon />} color="#2563eb" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Total Products" value={stats.total_products} icon={<InventoryIcon />} color="#f59e0b" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Total Orders" value={stats.total_orders} icon={<OrdersIcon />} color="#8b5cf6" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Total Revenue" value={`$${Number(stats.total_revenue).toFixed(2)}`} icon={<RevenueIcon />} color="#10b981" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Pending Orders" value={stats.pending_orders} icon={<PendingIcon />} color="#ef4444" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard label="Active Carts" value={stats.active_carts} icon={<CartIcon />} color="#06b6d4" />
              </Grid>
            </Grid>
          ) : null}
          <Divider sx={{ mb: 4 }} />
        </>
      )}

      <Typography variant="h6" fontWeight={600} mb={2}>
        Quick Access
      </Typography>

      <Grid container spacing={2.5}>
        {QUICK_LINKS.map(({ label, description, to, icon, color }) => (
          <Grid item xs={12} sm={6} md={4} key={to}>
            <Card
              component={RouterLink}
              to={to}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                p: 3,
                textDecoration: "none",
                color: "inherit",
                border: "1px solid",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0 4px 20px rgba(37,99,235,0.12)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.18s ease",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: `${color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color,
                }}
              >
                {icon}
              </Box>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  {label}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                  {description}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
