import { useState, FormEvent } from "react";
import { Box, Card, CardContent, Stack, Typography, Divider } from "@mui/material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useAuth } from "@/hooks/useAuth";
import { useApi } from "@/hooks/useApi";
import { userApi } from "@/api/userApi";
import { useAuthStore } from "@/store/authStore";

const ProfilePage = () => {
  const { user } = useAuth();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { execute, isLoading, error } = useApi(userApi.updateMe);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
  });

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSuccess(false);
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await execute(form);
    if (result) {
      await fetchMe();
      setSuccess(true);
    }
  };

  return (
    <Box maxWidth={520} mx="auto">
      <Typography variant="h5" mb={3}>
        My Profile
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Account
          </Typography>
          <Typography variant="body2">
            <strong>Email:</strong> {user?.email}
          </Typography>
          <Typography variant="body2" mt={0.5}>
            <strong>Member since:</strong>{" "}
            {user ? new Date(user.created_at).toLocaleDateString() : "—"}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Edit Name
          </Typography>

          <AlertMessage message={error} />
          {success && (
            <AlertMessage message="Profile updated successfully." severity="success" />
          )}

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
            <AppButton
              type="submit"
              variant="contained"
              loading={isLoading}
              sx={{ alignSelf: "flex-start" }}
            >
              Save Changes
            </AppButton>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProfilePage;
