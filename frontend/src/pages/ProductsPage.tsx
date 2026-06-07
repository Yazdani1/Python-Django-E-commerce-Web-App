import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
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
import { Inventory2 as InventoryIcon } from "@mui/icons-material";
import {
  ActionMenu,
  AlertMessage,
  AppButton,
  ConfirmModal,
} from "@/components/common";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { useApi } from "@/hooks/useApi";
import { productApi } from "@/api/productApi";
import { useAuth } from "@/hooks/useAuth";
import type { Product } from "@/types";

const ProductsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff ?? false;

  const [products, setProducts] = useState<Product[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const { execute: fetchProducts, isLoading, error } = useApi(productApi.list);
  const { execute: removeProduct, isLoading: removing } = useApi(
    useCallback((slug: string) => productApi.remove(slug), [])
  );

  const load = useCallback(async () => {
    const result = await fetchProducts();
    if (result.data) setProducts(result.data.results);
  }, [fetchProducts]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (product: Product) => {
    setEditTarget(product);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const result = await removeProduct(deleteTarget.slug);
    if (!result.error) {
      setDeleteTarget(null);
      load();
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditTarget(null);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Products
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Manage your product catalogue." : "Browse available products."}
          </Typography>
        </Box>
        {isAdmin && (
          <AppButton
            variant="contained"
            onClick={() => {
              setEditTarget(null);
              setFormOpen(true);
            }}
          >
            + New Product
          </AppButton>
        )}
      </Stack>

      <AlertMessage message={error} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ "& th": { fontWeight: 600, bgcolor: "action.hover" } }}>
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              {isAdmin && <TableCell align="right" />}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">Loading…</Typography>
                </TableCell>
              </TableRow>
            )}
            {!isLoading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={isAdmin ? 8 : 7} align="center" sx={{ py: 6 }}>
                  <InventoryIcon sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
                  <Typography color="text.secondary">No products found.</Typography>
                </TableCell>
              </TableRow>
            )}
            {products.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Avatar
                    src={p.image_url ?? undefined}
                    variant="rounded"
                    sx={{ width: 44, height: 44, bgcolor: "action.selected" }}
                  >
                    <InventoryIcon fontSize="small" />
                  </Avatar>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {p.name}
                  </Typography>
                  {p.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace">
                    {p.sku}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {p.category?.name ?? <em style={{ color: "#9ca3af" }}>None</em>}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    ${Number(p.price).toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={p.stock_quantity === 0 ? "error.main" : "text.primary"}
                  >
                    {p.stock_quantity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={p.is_active ? "Active" : "Inactive"}
                    size="small"
                    color={p.is_active ? "success" : "default"}
                    variant="outlined"
                  />
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <ActionMenu
                      onEdit={() => handleEdit(p)}
                      onDelete={() => setDeleteTarget(p)}
                    />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductFormModal
        open={formOpen}
        onClose={handleFormClose}
        onSaved={load}
        product={editTarget}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={removing}
        confirmLabel="Delete"
      />
    </Box>
  );
};

export default ProductsPage;
