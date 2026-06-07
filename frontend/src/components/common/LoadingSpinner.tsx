import type { FC } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  message,
  fullPage = false,
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    gap={2}
    sx={fullPage ? { minHeight: "100vh" } : { py: 6 }}
  >
    <CircularProgress />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);
