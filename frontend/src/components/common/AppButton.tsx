import type { FC } from "react";
import { Button, CircularProgress } from "@mui/material";
import type { ButtonProps } from "@mui/material";

interface AppButtonProps extends ButtonProps {
  loading?: boolean;
}

export const AppButton: FC<AppButtonProps> = ({
  loading = false,
  disabled,
  children,
  ...rest
}) => (
  <Button
    disabled={disabled || loading}
    startIcon={
      loading ? <CircularProgress size={16} color="inherit" /> : rest.startIcon
    }
    {...rest}
  >
    {children}
  </Button>
);
