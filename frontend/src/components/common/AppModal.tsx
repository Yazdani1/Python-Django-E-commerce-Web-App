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

interface AppModalProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  /** Called when Save is clicked. Omit when using formId instead. */
  onSave?: () => void;
  /** If provided, Save button submits this form id instead of calling onSave. */
  formId?: string;
  saveLabel?: string;
  cancelLabel?: string;
  saveLoading?: boolean;
  saveDisabled?: boolean;
  maxWidth?: number | string;
}

export const AppModal: FC<AppModalProps> = ({
  open,
  title,
  children,
  onClose,
  onSave,
  formId,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  saveLoading = false,
  saveDisabled = false,
  maxWidth = 520,
}) => (
  <Modal
      open={open}
      onClose={(_, reason) => { if (reason !== "backdropClick") onClose(); }}
      disableEscapeKeyDown
    >
    <Paper
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: { xs: "92vw", sm: maxWidth },
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column",
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
        <IconButton size="small" onClick={onClose} aria-label="close modal">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* ── Content ─────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 3 }}>
        {children}
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
          onClick={onClose}
          disabled={saveLoading}
        >
          {cancelLabel}
        </AppButton>

        <AppButton
          variant="contained"
          type={formId ? "submit" : "button"}
          form={formId}
          onClick={!formId ? onSave : undefined}
          loading={saveLoading}
          disabled={saveDisabled}
        >
          {saveLabel}
        </AppButton>
      </Box>
    </Paper>
  </Modal>
);
