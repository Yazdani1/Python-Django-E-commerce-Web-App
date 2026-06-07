/**
 * Thin wrapper around MUI Button that adds a built-in loading state.
 * Use this everywhere instead of raw MUI Button to stay consistent.
 */
import { Button, ButtonProps, CircularProgress } from "@mui/material";

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

export function AppButton({ loading = false, disabled, children, ...rest }: AppButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : rest.startIcon}
      {...rest}
    >
      {children}
    </Button>
  );
}
