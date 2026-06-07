import { Box, Card, Chip, Grid, Typography } from "@mui/material";
import {
  Category as CategoryIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common";
import { ROUTES } from "@/constants";

const quickLinks = [
  { label: "Categories", description: "Browse and manage product categories.", to: ROUTES.CATEGORIES, icon: <CategoryIcon />, color: "primary.main" },
  { label: "My Profile", description: "Update your name and phone number.", to: ROUTES.PROFILE, icon: <PersonIcon />, color: "secondary.main" },
  { label: "Change Password", description: "Update your account password.", to: ROUTES.CHANGE_PASSWORD, icon: <LockIcon />, color: "success.main" },
];

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) return <LoadingSpinner message="Loading…" />;

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back{user.first_name ? `, ${user.first_name}` : ""}! 👋
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

      <Typography variant="h6" fontWeight={600} mb={2}>
        Quick Access
      </Typography>

      <Grid container spacing={2.5}>
        {quickLinks.map(({ label, description, to, icon, color }) => (
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
