import type { FC } from "react";
import {
  Box,
  Stack,
  Step,
  StepConnector,
  StepLabel,
  Stepper,
  Typography,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { CancelOutlined as CancelIcon } from "@mui/icons-material";
import type { OrderStatus, OrderStatusHistory } from "@/types";

// ── Green connector line between steps ────────────────────────────────────────
const GreenConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 12,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.success.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.success.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: theme.palette.grey[300],
    borderRadius: 2,
  },
}));

const FLOW_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Pending" },
  { status: "PROCESSING", label: "Processing" },
  { status: "SHIPPED", label: "Shipped" },
  { status: "DELIVERED", label: "Delivered" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

interface OrderStatusStepperProps {
  status: OrderStatus;
  statusHistory: OrderStatusHistory[];
}

export const OrderStatusStepper: FC<OrderStatusStepperProps> = ({
  status,
  statusHistory,
}) => {
  const isCancelled = status === "CANCELLED";

  // Map status → timestamp for quick lookup
  const historyMap = Object.fromEntries(
    statusHistory.map((h) => [h.status, h.changed_at])
  );

  const cancelledAt = historyMap["CANCELLED"];

  // activeStep = FLOW_STEPS.length marks all 4 steps completed (DELIVERED)
  const activeStep =
    status === "DELIVERED"
      ? FLOW_STEPS.length
      : FLOW_STEPS.findIndex((s) => s.status === status);

  const stepIconSx = {
    "&.Mui-completed": { color: "success.main" },
    "&.Mui-active": { color: "success.main" },
  };

  if (isCancelled) {
    return (
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <CancelIcon color="error" fontSize="small" />
          <Typography variant="body2" color="error.main" fontWeight={600}>
            Order cancelled
            {cancelledAt && (
              <Typography
                component="span"
                variant="caption"
                color="text.secondary"
                ml={1}
              >
                {formatDateTime(cancelledAt)}
              </Typography>
            )}
          </Typography>
        </Stack>

        {/* Show completed steps before cancellation, rest greyed */}
        <Box sx={{ opacity: 0.45 }}>
          <Stepper alternativeLabel connector={<GreenConnector />}>
            {FLOW_STEPS.map((step) => (
              <Step key={step.status} completed={!!historyMap[step.status]}>
                <StepLabel
                  StepIconProps={{ sx: stepIconSx }}
                  optional={
                    historyMap[step.status] ? (
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(historyMap[step.status])}
                      </Typography>
                    ) : undefined
                  }
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Stack>
    );
  }

  return (
    <Stepper activeStep={activeStep} alternativeLabel connector={<GreenConnector />}>
      {FLOW_STEPS.map((step) => (
        <Step key={step.status}>
          <StepLabel
            StepIconProps={{ sx: stepIconSx }}
            optional={
              historyMap[step.status] ? (
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(historyMap[step.status])}
                </Typography>
              ) : undefined
            }
          >
            {step.label}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
};
