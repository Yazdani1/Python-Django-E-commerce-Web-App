import type { FC } from "react";
import {
  Box,
  Divider,
  IconButton,
  Modal,
  Paper,
  Typography,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { AppButton } from "./AppButton";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
}) => (
  <Modal
      open={open}
      onClose={(_, reason) => { if (reason !== "backdropClick") onCancel(); }}
      disableEscapeKeyDown
    >
    <Paper
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92vw", sm: 420 },
        borderRadius: 0.5,
        outline: "none",
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <IconButton size="small" onClick={onCancel} aria-label="close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* ── Message ─────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, py: 3.5, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
          {message}
        </Typography>
      </Box>

      <Divider />

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 1.5,
          px: 3,
          py: 2,
        }}
      >
        <AppButton
          variant="outlined"
          color="error"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </AppButton>

        <AppButton
          variant="contained"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </AppButton>
      </Box>
    </Paper>
  </Modal>
);
