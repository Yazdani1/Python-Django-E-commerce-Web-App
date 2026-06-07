import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ListAlt as OrdersIcon,
} from "@mui/icons-material";
import { AlertMessage, AppButton } from "@/components/common";
import { OrderStatusStepper } from "@/components/orders/OrderStatusStepper";
import { orderApi } from "@/api/orderApi";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderStatus } from "@/types";

const STATUS_COLOR: Record<
  OrderStatus,
  "warning" | "info" | "primary" | "success" | "error"
> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const OrdersPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff ?? false;
  const [orders, setOrders] = useState<Order[]>([]);
  // Track which orders are collapsed — all start open
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { execute: fetchOrders, isLoading, error } = useApi(
    useCallback(() => orderApi.list(), [])
  );
  const { execute: updateStatus } = useApi(
    useCallback(
      (id: number, status: OrderStatus) => orderApi.updateStatus(id, status),
      []
    )
  );

  const load = useCallback(async () => {
    const result = await fetchOrders();
    if (result.data) setOrders(result.data.results);
  }, [fetchOrders]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCollapse = (id: number) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStatusChange = async (
    order: Order,
    e: SelectChangeEvent<OrderStatus>
  ) => {
    const newStatus = e.target.value as OrderStatus;
    if (newStatus === order.status) return;
    setUpdatingId(order.id);
    const result = await updateStatus(order.id, newStatus);
    if (result.data) {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? result.data! : o))
      );
    }
    setUpdatingId(null);
  };

  const allCollapsed =
    orders.length > 0 && collapsed.size === orders.length;

  const toggleAll = () => {
    if (allCollapsed) {
      setCollapsed(new Set());
    } else {
      setCollapsed(new Set(orders.map((o) => o.id)));
    }
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight={700}>
          {isAdmin ? "All Orders" : "My Orders"}
        </Typography>
        {orders.length > 0 && (
          <AppButton size="small" variant="text" onClick={toggleAll}>
            {allCollapsed ? "Expand All" : "Collapse All"}
          </AppButton>
        )}
      </Stack>

      <AlertMessage message={error} />

      {isLoading && (
        <Typography color="text.secondary">Loading orders…</Typography>
      )}

      {!isLoading && orders.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <OrdersIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">No orders yet.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {orders.map((order) => {
          const isOpen = !collapsed.has(order.id);

          return (
            <Paper key={order.id} variant="outlined">
              {/* Order header — always visible */}
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                px={2.5}
                py={2}
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => toggleCollapse(order.id)}
              >
                <Stack spacing={0.25}>
                  <Typography variant="body1" fontWeight={600}>
                    Order #{order.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" spacing={2}>
                  <Typography fontWeight={700} color="primary.main">
                    ${Number(order.total_amount).toFixed(2)}
                  </Typography>
                  <Chip
                    label={order.status_display}
                    color={STATUS_COLOR[order.status]}
                    size="small"
                  />
                  {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Stack>
              </Stack>

              {/* Collapsible body */}
              <Collapse in={isOpen}>
                <Divider />

                <Box px={2.5} py={2.5}>
                  {/* Status stepper */}
                  <OrderStatusStepper
                    status={order.status}
                    statusHistory={order.status_history}
                  />

                  <Divider sx={{ my: 2.5 }} />

                  {/* Order items */}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ "& th": { fontWeight: 600 } }}>
                          <TableCell>Product</TableCell>
                          <TableCell>SKU</TableCell>
                          <TableCell align="right">Unit Price</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              <Typography
                                variant="caption"
                                fontFamily="monospace"
                              >
                                {item.product_sku}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              ${Number(item.unit_price).toFixed(2)}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600}>
                                ${Number(item.line_total).toFixed(2)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Admin status controls — always visible for admins */}
                  {isAdmin && (
                    <Stack
                      direction="row"
                      spacing={2}
                      mt={2.5}
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        flexShrink={0}
                      >
                        Update status:
                      </Typography>
                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          label="Status"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order, e)}
                          disabled={updatingId === order.id}
                        >
                          {ALL_STATUSES.map(({ value, label }) => (
                            <MenuItem key={value} value={value}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  )}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
};

export default OrdersPage;
