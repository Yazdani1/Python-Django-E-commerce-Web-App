import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Inventory2 as InventoryIcon,
  LocalOffer as SkuIcon,
  ShoppingCart as CartIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { AlertMessage } from "@/components/common";
import { productApi } from "@/api/productApi";
import { useApi } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productDetailPath, ROUTES } from "@/constants";
import type { Product } from "@/types";

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState<{ text: string; success: boolean } | null>(null);

  const { execute: fetchProduct, isLoading } = useApi(
    useCallback((s: string) => productApi.retrieve(s), [])
  );
  const { execute: fetchRelated } = useApi(
    useCallback((s: string) => productApi.related(s), [])
  );
  const { addToCart, isLoading: addingToCart } = useCartStore();

  useEffect(() => {
    if (!slug) return;
    fetchProduct(slug).then((r) => {
      if (r.data) setProduct(r.data);
      else navigate(ROUTES.HOME, { replace: true });
    });
    fetchRelated(slug).then((r) => {
      if (r.data) setRelated(r.data);
    });
  }, [slug, fetchProduct, fetchRelated, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    const err = await addToCart(product.id, quantity);
    setCartMsg(err ? { text: err, success: false } : { text: "Added to cart!", success: true });
    setTimeout(() => setCartMsg(null), 3000);
  };

  return (
    <Box>
      <Navbar />
      <Box sx={{ pt: { xs: 10, md: 12 }, pb: 10, minHeight: "100vh", bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          {/* Breadcrumb */}
          <Breadcrumbs sx={{ mb: 3 }}>
            <Link component={RouterLink} to={ROUTES.HOME} underline="hover" color="inherit">
              Home
            </Link>
            <Link component={RouterLink} to={ROUTES.PRODUCTS} underline="hover" color="inherit">
              Products
            </Link>
            <Typography color="text.primary">{product?.name ?? "…"}</Typography>
          </Breadcrumbs>

          {isLoading || !product ? (
            <Grid container spacing={6}>
              <Grid item xs={12} md={5}>
                <Skeleton variant="rounded" height={400} />
              </Grid>
              <Grid item xs={12} md={7}>
                <Skeleton height={40} width="70%" sx={{ mb: 1 }} />
                <Skeleton height={24} width="40%" sx={{ mb: 2 }} />
                <Skeleton height={32} width="30%" sx={{ mb: 3 }} />
                <Skeleton height={80} sx={{ mb: 3 }} />
                <Skeleton height={48} width="60%" />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={6}>
              {/* Product image */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "grey.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 380,
                  }}
                >
                  {product.image_url ? (
                    <Box
                      component="img"
                      src={product.image_url}
                      alt={product.name}
                      sx={{ width: "100%", height: "auto", maxHeight: 460, objectFit: "contain" }}
                    />
                  ) : (
                    <InventoryIcon sx={{ fontSize: 100, color: "grey.300" }} />
                  )}
                </Box>
              </Grid>

              {/* Product info */}
              <Grid item xs={12} md={7}>
                {product.category && (
                  <Chip
                    label={product.category.name}
                    size="small"
                    component={RouterLink}
                    to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                    clickable
                    sx={{ mb: 1.5 }}
                  />
                )}
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  {product.name}
                </Typography>

                <Stack direction="row" alignItems="center" gap={1} mb={1}>
                  <SkuIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                    {product.sku}
                  </Typography>
                </Stack>

                <Typography variant="h4" color="primary.main" fontWeight={700} mb={2}>
                  ${Number(product.price).toFixed(2)}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {product.description && (
                  <Typography variant="body1" color="text.secondary" lineHeight={1.8} mb={3}>
                    {product.description}
                  </Typography>
                )}

                {/* Stock */}
                <Box mb={3}>
                  {product.stock_quantity === 0 ? (
                    <Chip label="Out of stock" color="error" variant="outlined" />
                  ) : (
                    <Chip
                      label={`${product.stock_quantity} in stock`}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>

                {/* Cart message */}
                {cartMsg && (
                  <AlertMessage
                    message={cartMsg.text}
                    severity={cartMsg.success ? "success" : "error"}
                  />
                )}

                {/* Quantity + Add to cart */}
                {product.stock_quantity > 0 && (
                  <Stack direction="row" spacing={2} alignItems="center" mt={2}>
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(
                          Math.max(1, Math.min(product.stock_quantity, Number(e.target.value)))
                        )
                      }
                      inputProps={{ min: 1, max: product.stock_quantity }}
                      sx={{ width: 80 }}
                    />
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CartIcon />}
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      sx={{ px: 4 }}
                    >
                      {isAuthenticated ? "Add to Cart" : "Login to Buy"}
                    </Button>
                  </Stack>
                )}

                <Button
                  startIcon={<BackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ mt: 3, color: "text.secondary" }}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <Box mt={8}>
              <Typography variant="h5" fontWeight={700} mb={3}>
                Related Products
              </Typography>
              <Grid container spacing={2.5}>
                {related.map((p) => (
                  <Grid item xs={12} sm={6} md={3} key={p.id}>
                    <Box
                      component={RouterLink}
                      to={productDetailPath(p.slug)}
                      sx={{
                        display: "block",
                        textDecoration: "none",
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        "&:hover": {
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.18s",
                      }}
                    >
                      <Box
                        sx={{
                          height: 160,
                          bgcolor: "grey.100",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {p.image_url ? (
                          <Box
                            component="img"
                            src={p.image_url}
                            alt={p.name}
                            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <Avatar variant="square" sx={{ width: 64, height: 64, bgcolor: "grey.200" }}>
                            <InventoryIcon sx={{ color: "grey.400" }} />
                          </Avatar>
                        )}
                      </Box>
                      <Box p={2}>
                        <Typography variant="body2" fontWeight={600} noWrap color="text.primary">
                          {p.name}
                        </Typography>
                        <Typography variant="body1" color="primary.main" fontWeight={700} mt={0.5}>
                          ${Number(p.price).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;
