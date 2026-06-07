import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  Grid,
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
  TextField,
  Typography,
} from "@mui/material";
import { Inventory2 as InventoryIcon } from "@mui/icons-material";
import {
  ActionMenu,
  AlertMessage,
  AppButton,
  AppTextField,
  ConfirmModal,
} from "@/components/common";
import { ProductFormModal } from "@/components/products/ProductFormModal";
import { useApi } from "@/hooks/useApi";
import { productApi } from "@/api/productApi";
import { categoryApi } from "@/api/categoryApi";
import { useAuth } from "@/hooks/useAuth";
import { productDetailPath } from "@/constants";
import { Link as RouterLink } from "react-router-dom";
import type { Category, Product } from "@/types";

const ORDERING_OPTIONS = [
  { value: "name", label: "Name A–Z" },
  { value: "-name", label: "Name Z–A" },
  { value: "price", label: "Price: Low to High" },
  { value: "-price", label: "Price: High to Low" },
  { value: "-created_at", label: "Newest First" },
] as const;

const ProductsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_staff ?? false;
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Filter state — init from URL params
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [ordering, setOrdering] = useState(searchParams.get("ordering") ?? "-created_at");

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { execute: fetchProducts, isLoading, error } = useApi(productApi.list);
  const { execute: fetchCategories } = useApi(categoryApi.list);
  const { execute: removeProduct, isLoading: removing } = useApi(
    useCallback((slug: string) => productApi.remove(slug), [])
  );

  const load = useCallback(async () => {
    const params: Record<string, string | number> = { ordering };
    if (search) params.search = search;
    if (categorySlug) params.category = categorySlug;
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);

    // Sync URL
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (categorySlug) sp.set("category", categorySlug);
    if (minPrice) sp.set("min_price", minPrice);
    if (maxPrice) sp.set("max_price", maxPrice);
    if (ordering) sp.set("ordering", ordering);
    setSearchParams(sp, { replace: true });

    const result = await fetchProducts(params as never);
    if (result.data) setProducts(result.data.results);
  }, [search, categorySlug, minPrice, maxPrice, ordering, fetchProducts, setSearchParams]);

  // Debounce search
  useEffect(() => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => load(), 350);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [search, categorySlug, minPrice, maxPrice, ordering, load]);

  useEffect(() => {
    fetchCategories().then((r) => {
      if (r.data) setCategories(r.data.results);
    });
  }, [fetchCategories]);

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
          <Typography variant="h5" fontWeight={700}>Products</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Manage your product catalogue." : "Browse available products."}
          </Typography>
        </Box>
        {isAdmin && (
          <AppButton variant="contained" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            + New Product
          </AppButton>
        )}
      </Stack>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={3}>
            <AppTextField
              label="Search"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or description…"
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.slug}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <TextField
              label="Min Price"
              size="small"
              type="number"
              fullWidth
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <TextField
              label="Max Price"
              size="small"
              type="number"
              fullWidth
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              inputProps={{ min: 0, step: "0.01" }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort</InputLabel>
              <Select
                label="Sort"
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
              >
                {ORDERING_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

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
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    component={RouterLink}
                    to={productDetailPath(p.slug)}
                    sx={{ textDecoration: "none", color: "text.primary", "&:hover": { color: "primary.main" } }}
                  >
                    {p.name}
                  </Typography>
                  {p.description && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                    >
                      {p.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="caption" fontFamily="monospace">{p.sku}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{p.category?.name ?? <em style={{ color: "#9ca3af" }}>None</em>}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>${Number(p.price).toFixed(2)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={p.stock_quantity === 0 ? "error.main" : "text.primary"}>
                    {p.stock_quantity}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={p.is_active ? "Active" : "Inactive"} size="small" color={p.is_active ? "success" : "default"} variant="outlined" />
                </TableCell>
                {isAdmin && (
                  <TableCell align="right">
                    <ActionMenu onEdit={() => handleEdit(p)} onDelete={() => setDeleteTarget(p)} />
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ProductFormModal open={formOpen} onClose={handleFormClose} onSaved={load} product={editTarget} />

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
