import { useState } from "react";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Lock as LockIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES, APP_NAME } from "@/constants";

export const AuthLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() ||
      user.email[0].toUpperCase()
    : "?";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Toolbar>
          <StoreIcon sx={{ mr: 1 }} />
          <Typography
            variant="h6"
            component={RouterLink}
            to={ROUTES.DASHBOARD}
            sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
          >
            {APP_NAME}
          </Typography>

          <Tooltip title="Account">
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.dark", fontSize: 14 }}>
                {initials}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem disabled sx={{ opacity: "1 !important" }}>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem
              component={RouterLink}
              to={ROUTES.PROFILE}
              onClick={handleMenuClose}
            >
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              component={RouterLink}
              to={ROUTES.CHANGE_PASSWORD}
              onClick={handleMenuClose}
            >
              <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
              Change Password
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
