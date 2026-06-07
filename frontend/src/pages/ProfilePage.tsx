import { useState, FormEvent } from "react";
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { userApi } from "@/api/userApi";
import { useAuthStore } from "@/store/authStore";

const ProfilePage = () => {
  const { user } = useAuth();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { execute, isLoading, error, clearError } = useApi(userApi.updateMe);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    phone_number: user?.phone_number ?? "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSuccess(false);
      clearError();
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await execute(form);
    if (!result.error) {
      await fetchMe();
      setSuccess(true);
    }
  };

  return (
    <Box maxWidth={540} mx="auto">
      <Typography variant="h5" fontWeight={700} mb={3}>
        My Profile
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
            <Typography variant="overline" color="text.secondary" letterSpacing={1}>
              Account Info
            </Typography>
            {user?.is_staff && (
              <Chip label="Admin" size="small" color="primary" />
            )}
          </Stack>
          <Box mt={1} mb={0.5}>
            <Typography variant="body2">
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography variant="body2" mt={0.5}>
              <strong>Role:</strong>{" "}
              {user?.is_staff ? "Administrator" : "Customer"}
            </Typography>
            <Typography variant="body2" mt={0.5}>
              <strong>Member since:</strong>{" "}
              {user ? new Date(user.created_at).toLocaleDateString() : "—"}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="overline" color="text.secondary" letterSpacing={1}>
            Edit Details
          </Typography>

          <Box mt={2}>
            <AlertMessage message={error} />
            {success && (
              <AlertMessage message="Profile updated successfully." severity="success" />
            )}

            <Stack component="form" onSubmit={handleSubmit} spacing={2} mt={1}>
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
                label="Phone Number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange("phone_number")}
                placeholder="+1-555-000-0000"
              />
              <AppButton
                type="submit"
                variant="contained"
                loading={isLoading}
                sx={{ alignSelf: "flex-start" }}
              >
                Save Changes
              </AppButton>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
