import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { Person as PersonIcon, Lock as LockIcon } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common";
import { ROUTES } from "@/constants";

const quickLinks = [
  { label: "My Profile", to: ROUTES.PROFILE, icon: <PersonIcon /> },
  { label: "Change Password", to: ROUTES.CHANGE_PASSWORD, icon: <LockIcon /> },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return <LoadingSpinner message="Loading…" />;

  return (
    <Box>
      <Typography variant="h5" mb={1}>
        Welcome back, {user.full_name || user.email}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        {user.email}
      </Typography>

      <Grid container spacing={2}>
        {quickLinks.map(({ label, to, icon }) => (
          <Grid item xs={12} sm={6} md={4} key={to}>
            <Card
              component={RouterLink}
              to={to}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2.5,
                textDecoration: "none",
                color: "inherit",
                "&:hover": { bgcolor: "action.hover" },
                transition: "background 0.15s",
              }}
            >
              <Box color="primary.main">{icon}</Box>
              <Typography variant="body1" fontWeight={500}>
                {label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
