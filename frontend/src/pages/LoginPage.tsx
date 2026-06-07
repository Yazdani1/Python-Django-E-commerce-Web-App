import { useState, FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import {
  ShoppingBag as ShoppingBagIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, ROUTES } from "@/constants";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = await login({ email, password });
    if (err) setError(err);
    else navigate(ROUTES.DASHBOARD);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Left decorative panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(145deg, #1d4ed8 0%, #7c3aed 100%)",
          color: "white",
          p: 6,
          gap: 3,
        }}
      >
        <ShoppingBagIcon sx={{ fontSize: 72 }} />
        <Typography variant="h3" fontWeight={700} textAlign="center">
          {APP_NAME}
        </Typography>
        <Typography variant="h6" textAlign="center" sx={{ opacity: 0.85, maxWidth: 320 }}>
          Your one-stop marketplace for everything you need.
        </Typography>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", width: 80 }} />
        <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
          Thousands of products &bull; Fast delivery &bull; Secure checkout
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          width: { xs: "100%", md: 480 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { md: "none" }, textAlign: "center", mb: 4 }}>
            <ShoppingBagIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700} mt={1}>
              {APP_NAME}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3.5}>
            Sign in to your account to continue.
          </Typography>

          <AlertMessage message={error} />

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <AppTextField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              autoComplete="email"
            />
            <AppTextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <AppButton
              type="submit"
              variant="contained"
              fullWidth
              loading={isLoading}
              size="large"
              sx={{ mt: 0.5 }}
            >
              Sign In
            </AppButton>
          </Stack>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Don&apos;t have an account?{" "}
            <Link component={RouterLink} to={ROUTES.REGISTER} fontWeight={600}>
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
