import type { FC } from "react";
import { Suspense, useEffect, useState } from "react";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
  AppBar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Badge,
  Category as CategoryIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Inventory2 as InventoryIcon,
  ListAlt as OrdersIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common";
import { useCartStore } from "@/store/cartStore";
import { APP_NAME, ROUTES } from "@/constants";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

// Cart icon gets a badge — must be built dynamically inside the component
const STATIC_NAV_ITEMS = [
  { label: "Home", icon: <HomeIcon />, path: ROUTES.HOME },
  { label: "Dashboard", icon: <DashboardIcon />, path: ROUTES.DASHBOARD },
  { label: "Products", icon: <InventoryIcon />, path: ROUTES.PRODUCTS },
  { label: "Categories", icon: <CategoryIcon />, path: ROUTES.CATEGORIES },
  { label: "My Orders", icon: <OrdersIcon />, path: ROUTES.ORDERS },
  { label: "Profile", icon: <PersonIcon />, path: ROUTES.PROFILE },
  { label: "Change Password", icon: <LockIcon />, path: ROUTES.CHANGE_PASSWORD },
];

interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  path: string;
  active: boolean;
  collapsed: boolean;
}

const NavItem: FC<NavItemProps> = ({ label, icon, path, active, collapsed }) => (
  <Tooltip title={collapsed ? label : ""} placement="right">
    <ListItemButton
      component={RouterLink}
      to={path}
      selected={active}
      sx={{
        mx: 1,
        borderRadius: 2,
        mb: 0.5,
        justifyContent: collapsed ? "center" : "flex-start",
        px: collapsed ? 1 : 2,
        "&.Mui-selected": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          "& .MuiListItemIcon-root": { color: "primary.contrastText" },
          "&:hover": { bgcolor: "primary.dark" },
        },
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: collapsed ? 0 : 36,
          color: active ? "inherit" : "grey.400",
          justifyContent: "center",
        }}
      >
        {icon}
      </ListItemIcon>
      {!collapsed && (
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }}
        />
      )}
    </ListItemButton>
  </Tooltip>
);

export const AuthLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { totalItems, fetchCart, resetCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Insert Cart between Categories (index 3) and My Orders (index 4)
  const NAV_ITEMS = [
    ...STATIC_NAV_ITEMS.slice(0, 4),
    {
      label: "Cart",
      icon: (
        <Badge badgeContent={totalItems} color="primary" max={99}>
          <CartIcon />
        </Badge>
      ),
      path: ROUTES.CART,
    },
    ...STATIC_NAV_ITEMS.slice(4),
  ];

  const handleLogout = async () => {
    setAnchorEl(null);
    resetCart();
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : "?";

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            transition: "width 0.22s ease",
            overflowX: "hidden",
            bgcolor: "#0f172a",
            color: "white",
            borderRight: "none",
            boxSizing: "border-box",
          },
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 2.5,
            py: 2,
            minHeight: 64,
          }}
        >
          <ShoppingBagIcon sx={{ color: "primary.light", fontSize: 28 }} />
          {!collapsed && (
            <Typography
              variant="h6"
              sx={{ ml: 1.5, color: "white", fontWeight: 700, whiteSpace: "nowrap" }}
            >
              {APP_NAME}
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Nav items */}
        <List sx={{ flex: 1, pt: 1.5 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              active={location.pathname === item.path}
              collapsed={collapsed}
            />
          ))}
        </List>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        {/* Collapse toggle */}
        <Box sx={{ py: 1 }}>
          <Tooltip title={collapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right">
            <ListItemButton
              onClick={() => setCollapsed((v) => !v)}
              sx={{
                mx: 1,
                borderRadius: 2,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
              }}
            >
              <ListItemIcon
                sx={{ minWidth: collapsed ? 0 : 36, color: "grey.400", justifyContent: "center" }}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Collapse"
                  primaryTypographyProps={{ fontSize: 14, color: "grey.400" }}
                />
              )}
            </ListItemButton>
          </Tooltip>

          {/* Logout */}
          <Tooltip title={collapsed ? "Logout" : ""} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                mx: 1,
                borderRadius: 2,
                justifyContent: collapsed ? "center" : "flex-start",
                px: collapsed ? 1 : 2,
                "&:hover": { bgcolor: "rgba(239,68,68,0.15)" },
              }}
            >
              <ListItemIcon
                sx={{ minWidth: collapsed ? 0 : 36, color: "error.light", justifyContent: "center" }}
              >
                <LogoutIcon />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ fontSize: 14, color: "error.light" }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}
        >
          <Toolbar sx={{ justifyContent: "flex-end", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {user?.full_name || user?.email}
            </Typography>
            <Tooltip title="Account">
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13 }}>
                  {initials}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled sx={{ opacity: "1 !important" }}>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </MenuItem>
          <Divider />
          <MenuItem component={RouterLink} to={ROUTES.PROFILE} onClick={() => setAnchorEl(null)}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
            <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>

        {/* Page content — Suspense here so only the content area shows a spinner,
            not the entire layout including the sidebar */}
        <Box component="main" sx={{ flex: 1, p: 3, overflow: "auto" }}>
          <Suspense fallback={<LoadingSpinner message="Loading…" />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
};
