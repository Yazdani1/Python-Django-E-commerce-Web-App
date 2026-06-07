import { useState, FormEvent } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { AppButton, AppTextField, AlertMessage } from "@/components/common";
import { useApi } from "@/hooks/useApi";
import { userApi } from "@/api/userApi";

const EMPTY_FORM = {
  current_password: "",
  new_password: "",
  new_password_confirm: "",
};

export default function ChangePasswordPage() {
  const { execute, isLoading, error, clearError } = useApi(userApi.changePassword);
  const [form, setForm] = useState(EMPTY_FORM);
  const [success, setSuccess] = useState(false);

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setSuccess(false);
      clearError();
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await execute(form);
    if (result) {
      setForm(EMPTY_FORM);
      setSuccess(true);
    }
  };

  return (
    <Box maxWidth={480} mx="auto">
      <Typography variant="h5" mb={3}>
        Change Password
      </Typography>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <AlertMessage message={error} />
          {success && (
            <AlertMessage
              message="Password changed successfully."
              severity="success"
            />
          )}

          <Stack component="form" onSubmit={handleSubmit} spacing={2}>
            <AppTextField
              label="Current Password"
              type="password"
              value={form.current_password}
              onChange={handleChange("current_password")}
              required
              autoFocus
            />
            <AppTextField
              label="New Password"
              type="password"
              value={form.new_password}
              onChange={handleChange("new_password")}
              required
            />
            <AppTextField
              label="Confirm New Password"
              type="password"
              value={form.new_password_confirm}
              onChange={handleChange("new_password_confirm")}
              required
            />
            <AppButton
              type="submit"
              variant="contained"
              loading={isLoading}
              sx={{ alignSelf: "flex-start" }}
            >
              Update Password
            </AppButton>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
