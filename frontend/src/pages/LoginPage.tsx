import { useState, FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Card, CardContent, Link, Stack, Typography } from "@mui/material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME, ROUTES } from "@/constants";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      navigate(ROUTES.DASHBOARD);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Login failed. Check your credentials.";
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
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" textAlign="center" mb={1}>
            {APP_NAME}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Sign in to your account
          </Typography>

          <AlertMessage message={error} />

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <AppTextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <AppTextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <AppButton
              type="submit"
              variant="contained"
              fullWidth
              loading={isLoading}
              size="medium"
            >
              Sign In
            </AppButton>
          </Stack>

          <Typography variant="body2" textAlign="center" mt={3}>
            Don&apos;t have an account?{" "}
            <Link component={RouterLink} to={ROUTES.REGISTER}>
              Register
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
