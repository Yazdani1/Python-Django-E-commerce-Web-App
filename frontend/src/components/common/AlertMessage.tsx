import type { FC } from "react";
import { Alert, Collapse } from "@mui/material";
import type { AlertProps } from "@mui/material";

interface AlertMessageProps extends AlertProps {
  message: string | null;
}

export const AlertMessage: FC<AlertMessageProps> = ({
  message,
  severity = "error",
  ...rest
}) => (
  <Collapse in={!!message}>
    <Alert severity={severity} sx={{ mb: 2 }} {...rest}>
      {message}
    </Alert>
  </Collapse>
);
