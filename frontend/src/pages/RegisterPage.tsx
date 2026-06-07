import { useState, FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, ROUTES } from "@/constants";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await register(form);
      navigate(ROUTES.LOGIN, { state: { registered: true } });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Registration failed.";
      setError(msg);
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Card sx={{ width: "100%", maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" textAlign="center" mb={1}>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Join {APP_NAME} today
          </Typography>

          <AlertMessage message={error} />

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <AppTextField
                label="First Name"
                value={form.first_name}
                onChange={handleChange("first_name")}
              />
              <AppTextField
                label="Last Name"
                value={form.last_name}
                onChange={handleChange("last_name")}
              />
            </Stack>
            <AppTextField
              label="Email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
            <AppTextField
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
            <AppTextField
              label="Confirm Password"
              type="password"
              value={form.password_confirm}
              onChange={handleChange("password_confirm")}
              required
            />
            <AppButton
              type="submit"
              variant="contained"
              fullWidth
              loading={isLoading}
              size="medium"
            >
              Create Account
            </AppButton>
          </Stack>

          <Typography variant="body2" textAlign="center" mt={3}>
            Already have an account?{" "}
            <Link component={RouterLink} to={ROUTES.LOGIN}>
              Sign In
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RegisterPage;
