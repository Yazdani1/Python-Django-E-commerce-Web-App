import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Inventory2 as InventoryIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { AlertMessage, AppButton, ConfirmModal } from "@/components/common";
import { orderApi } from "@/api/orderApi";
import { useApi } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { productDetailPath, ROUTES } from "@/constants";
import { Link as RouterLink } from "react-router-dom";
import type { CartItem } from "@/types";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, isLoading, fetchCart, updateItem, removeItem } = useCartStore();
  const [checkoutTarget, setCheckoutTarget] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const { execute: checkout, isLoading: checkingOut } = useApi(orderApi.checkout);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQtyChange = async (item: CartItem, newQty: number) => {
    if (newQty < 1) return;
    await updateItem(item.id, newQty);
  };

  const handleRemove = async (item: CartItem) => {
    await removeItem(item.id);
  };

  const handleCheckout = async () => {
    setCheckoutError(null);
    const result = await checkout();
    if (result.error) {
      setCheckoutError(result.error);
      setCheckoutTarget(false);
      return;
    }
    setCheckoutTarget(false);
    navigate(ROUTES.ORDERS);
  };

  const items = cart?.items ?? [];
  const isEmpty = !isLoading && items.length === 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        My Cart
      </Typography>

      <AlertMessage message={checkoutError} />

      {isLoading && (
        <Typography color="text.secondary">Loading cart…</Typography>
      )}

      {isEmpty && (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center" }}>
          <CartIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.PRODUCTS}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Browse Products
          </Button>
        </Paper>
      )}

      {!isEmpty && cart && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          {/* Cart items */}
          <Box flex={1}>
            <Paper variant="outlined">
              {items.map((item, idx) => (
                <Box key={item.id}>
                  <Stack direction="row" spacing={2} p={2} alignItems="center">
                    <Box
                      component={RouterLink}
                      to={productDetailPath(item.product.slug)}
                      sx={{ flexShrink: 0, textDecoration: "none" }}
                    >
                      <Avatar
                        src={item.product.image_url ?? undefined}
                        variant="rounded"
                        sx={{ width: 72, height: 72, bgcolor: "grey.100" }}
                      >
                        <InventoryIcon />
                      </Avatar>
                    </Box>
                    <Box flex={1} minWidth={0}>
                      <Typography
                        component={RouterLink}
                        to={productDetailPath(item.product.slug)}
                        variant="body1"
                        fontWeight={600}
                        noWrap
                        sx={{ textDecoration: "none", color: "text.primary" }}
                      >
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${Number(item.product.price).toFixed(2)} each
                      </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item, Number(e.target.value))}
                        inputProps={{ min: 1, max: item.product.stock_quantity }}
                        sx={{ width: 72 }}
                      />
                      <Typography variant="body2" fontWeight={600} sx={{ minWidth: 72, textAlign: "right" }}>
                        ${Number(item.line_total).toFixed(2)}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemove(item)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {idx < items.length - 1 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Box>

          {/* Order summary */}
          <Paper variant="outlined" sx={{ p: 3, minWidth: 280 }}>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Order Summary
            </Typography>
            <Stack spacing={1} mb={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Items ({cart.total_items})</Typography>
                <Typography fontWeight={500}>${Number(cart.subtotal).toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Shipping</Typography>
                <Typography color="success.main" fontWeight={500}>Free</Typography>
              </Stack>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" mb={3}>
              <Typography fontWeight={700}>Total</Typography>
              <Typography fontWeight={700} color="primary.main" variant="h6">
                ${Number(cart.subtotal).toFixed(2)}
              </Typography>
            </Stack>
            <AppButton
              variant="contained"
              fullWidth
              onClick={() => setCheckoutTarget(true)}
              loading={checkingOut}
            >
              Place Order
            </AppButton>
          </Paper>
        </Stack>
      )}

      <ConfirmModal
        open={checkoutTarget}
        title="Confirm Order"
        message={`Place order for $${Number(cart?.subtotal ?? 0).toFixed(2)}? Your cart will be cleared and stock reserved.`}
        onConfirm={handleCheckout}
        onCancel={() => setCheckoutTarget(false)}
        confirmLabel="Place Order"
        loading={checkingOut}
      />
    </Box>
  );
};

export default CartPage;
