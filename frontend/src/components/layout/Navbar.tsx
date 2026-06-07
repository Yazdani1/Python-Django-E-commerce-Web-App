import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  InputBase,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Search as SearchIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { APP_NAME, ROUTES } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

export const Navbar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const totalItems = useCartStore((s) => s.totalItems);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(10px)",
        borderBottom: 1,
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2, py: 0.5 }}>
          {/* ── Logo ─────────────────────────────────────────────────── */}
          <Box
            component={RouterLink}
            to={ROUTES.HOME}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <ShoppingBagIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography variant="h6" fontWeight={800} color="text.primary">
              {APP_NAME}
            </Typography>
          </Box>

          {/* ── Search bar ───────────────────────────────────────────── */}
          <Box
            sx={{
              flex: 1,
              mx: { xs: 1, md: 4 },
              bgcolor: "grey.100",
              borderRadius: 3,
              border: "1.5px solid transparent",
              display: "flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              "&:focus-within": {
                bgcolor: "white",
                border: "1.5px solid",
                borderColor: "primary.main",
                boxShadow: "0 0 0 3px rgba(37,99,235,0.1)",
              },
              transition: "all 0.18s",
            }}
          >
            <InputAdornment position="start" sx={{ mr: 0.5 }}>
              <SearchIcon sx={{ color: "text.disabled", fontSize: 20 }} />
            </InputAdornment>
            <InputBase
              placeholder="Search for products…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              fullWidth
              sx={{ fontSize: 14, "& input": { py: 0.25 } }}
              inputProps={{ "aria-label": "search products" }}
            />
          </Box>

          {/* ── Nav links ────────────────────────────────────────────── */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  component={RouterLink}
                  to={ROUTES.CART}
                  size="small"
                  sx={{ color: "text.primary" }}
                >
                  <Badge badgeContent={totalItems} color="primary" max={99}>
                    <CartIcon />
                  </Badge>
                </IconButton>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

                <Button
                  component={RouterLink}
                  to={ROUTES.DASHBOARD}
                  variant="contained"
                  size="small"
                  startIcon={<DashboardIcon />}
                  sx={{ px: 2.5, fontWeight: 700, borderRadius: 2 }}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to={ROUTES.LOGIN}
                  variant="text"
                  size="small"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    fontSize: 14,
                    fontWeight: 600,
                    color: "text.primary",
                  }}
                >
                  Login
                </Button>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />

                <Button
                  component={RouterLink}
                  to={ROUTES.REGISTER}
                  variant="contained"
                  size="small"
                  sx={{ px: 2.5, fontWeight: 700, borderRadius: 2 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
