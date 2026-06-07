/**
 * Reusable error / success alert banner.
 * Centralises the "show API error to user" pattern.
 */
import { Alert, AlertProps, Collapse } from "@mui/material";

interface AlertMessageProps extends AlertProps {
  message: string | null;
}

export function AlertMessage({ message, severity = "error", ...rest }: AlertMessageProps) {
  return (
    <Collapse in={!!message}>
      <Alert severity={severity} sx={{ mb: 2 }} {...rest}>
        {message}
      </Alert>
    </Collapse>
  );
}
