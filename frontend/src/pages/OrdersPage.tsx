import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Chip,
  Collapse,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ListAlt as OrdersIcon,
} from "@mui/icons-material";
import { AlertMessage, AppButton } from "@/components/common";
import { orderApi } from "@/api/orderApi";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import type { Order, OrderStatus } from "@/types";

const STATUS_COLOR: Record<OrderStatus, "warning" | "info" | "primary" | "success" | "error"> = {
  PENDING: "warning",
  PROCESSING: "info",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "error",
};

const ADMIN_STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const OrdersPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff ?? false;
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
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

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    setUpdatingId(order.id);
    const result = await updateStatus(order.id, newStatus);
    if (result.data) {
      setOrders((prev) => prev.map((o) => (o.id === order.id ? result.data! : o)));
    }
    setUpdatingId(null);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {isAdmin ? "All Orders" : "My Orders"}
      </Typography>

      <AlertMessage message={error} />

      {isLoading && <Typography color="text.secondary">Loading orders…</Typography>}

      {!isLoading && orders.length === 0 && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <OrdersIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">No orders yet.</Typography>
        </Paper>
      )}

      <Stack spacing={2}>
        {orders.map((order) => (
          <Paper key={order.id} variant="outlined">
            {/* Order header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              px={2.5}
              py={2}
              sx={{ cursor: "pointer" }}
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
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
                {expanded === order.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </Stack>
            </Stack>

            {/* Expandable details */}
            <Collapse in={expanded === order.id}>
              <Divider />
              <Box px={2.5} py={2}>
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
                            <Typography variant="caption" fontFamily="monospace">
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

                {/* Admin status update */}
                {isAdmin && (
                  <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                    <Typography variant="body2" color="text.secondary" alignSelf="center">
                      Update status:
                    </Typography>
                    {ADMIN_STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                      <AppButton
                        key={s}
                        size="small"
                        variant="outlined"
                        loading={updatingId === order.id}
                        onClick={() => handleStatusChange(order, s)}
                      >
                        → {s}
                      </AppButton>
                    ))}
                  </Stack>
                )}
              </Box>
            </Collapse>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default OrdersPage;
