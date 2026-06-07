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

type FormState = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirm: string;
};

const EMPTY: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
  password_confirm: "",
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const err = await register(form);
    if (err) setError(err);
    else navigate(ROUTES.LOGIN, { state: { registered: true } });
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
          background: "linear-gradient(145deg, #7c3aed 0%, #1d4ed8 100%)",
          color: "white",
          p: 6,
          gap: 3,
        }}
      >
        <ShoppingBagIcon sx={{ fontSize: 72 }} />
        <Typography variant="h3" fontWeight={700} textAlign="center">
          Join {APP_NAME}
        </Typography>
        <Typography variant="h6" textAlign="center" sx={{ opacity: 0.85, maxWidth: 320 }}>
          Create your account and start shopping today.
        </Typography>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.2)", width: 80 }} />
        <Typography variant="body2" textAlign="center" sx={{ opacity: 0.7 }}>
          Free to join &bull; No hidden fees &bull; Cancel anytime
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          width: { xs: "100%", md: 500 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
          bgcolor: "background.default",
          overflowY: "auto",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { md: "none" }, textAlign: "center", mb: 4 }}>
            <ShoppingBagIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Typography variant="h5" fontWeight={700} mt={1}>
              {APP_NAME}
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} mb={0.5}>
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3.5}>
            Fill in your details to get started.
          </Typography>

          <AlertMessage message={error} />

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <AppTextField
                label="First Name"
                value={form.first_name}
                onChange={handleChange("first_name")}
                autoFocus
              />
              <AppTextField
                label="Last Name"
                value={form.last_name}
                onChange={handleChange("last_name")}
              />
            </Stack>

            <AppTextField
              label="Email address"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
              autoComplete="email"
            />

            <AppTextField
              label="Phone Number (optional)"
              type="tel"
              value={form.phone_number}
              onChange={handleChange("phone_number")}
              placeholder="+1-555-000-0000"
            />

            <AppTextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange("password")}
              required
              autoComplete="new-password"
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

            <AppTextField
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={form.password_confirm}
              onChange={handleChange("password_confirm")}
              required
              autoComplete="new-password"
            />

            <AppButton
              type="submit"
              variant="contained"
              fullWidth
              loading={isLoading}
              size="large"
              sx={{ mt: 0.5 }}
            >
              Create Account
            </AppButton>
          </Stack>

          <Typography variant="body2" textAlign="center" mt={3} color="text.secondary">
            Already have an account?{" "}
            <Link component={RouterLink} to={ROUTES.LOGIN} fontWeight={600}>
              Sign in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
