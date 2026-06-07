import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Logout as LogoutIcon } from "@mui/icons-material";
import { AppButton, LoadingSpinner } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (!user) return <LoadingSpinner fullPage message="Loading profile…" />;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="background.default"
      px={2}
    >
      <Card sx={{ width: "100%", maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">Dashboard</Typography>
            <AppButton
              variant="outlined"
              color="error"
              size="small"
              startIcon={<LogoutIcon />}
              loading={isLoading}
              onClick={logout}
            >
              Logout
            </AppButton>
          </Stack>

          <Typography variant="body1" gutterBottom>
            Welcome back, <strong>{user.full_name}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>

          <Box mt={4}>
            <Typography variant="body2" color="text.secondary">
              Business logic will go here.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
