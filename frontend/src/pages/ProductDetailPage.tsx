import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
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
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Inventory2 as InventoryIcon,
  LocalOffer as SkuIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  VerifiedUser as VerifiedIcon,
  LocalShipping as ShippingIcon,
  Autorenew as ReturnIcon,
} from "@mui/icons-material";
import { Navbar } from "@/components/layout/Navbar";
import { AlertMessage } from "@/components/common";
import { productApi } from "@/api/productApi";
import { useApi } from "@/hooks/useApi";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { productDetailPath, ROUTES } from "@/constants";
import type { Product } from "@/types";

// ── Image Gallery ──────────────────────────────────────────────────────────

interface GalleryProps {
  primaryUrl: string | null;
  galleryUrls: string[];
  name: string;
}

const ImageGallery = ({ primaryUrl, galleryUrls, name }: GalleryProps) => {
  const allImages = [
    ...(primaryUrl ? [primaryUrl] : []),
    ...galleryUrls,
  ].filter(Boolean);

  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [primaryUrl]);

  const goNext = () => setActive((c) => (c + 1) % allImages.length);
  const goPrev = () => setActive((c) => (c - 1 + allImages.length) % allImages.length);

  if (allImages.length === 0) {
    return (
      <Box
        sx={{
          borderRadius: 3,
          bgcolor: "#f1f5f9",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 420,
        }}
      >
        <InventoryIcon sx={{ fontSize: 100, color: "#cbd5e1" }} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Main image */}
      <Box
        sx={{
          position: "relative",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 420,
        }}
      >
        <Box
          component="img"
          src={allImages[active]}
          alt={name}
          sx={{
            width: "100%",
            maxHeight: 460,
            objectFit: "contain",
            display: "block",
          }}
        />

        {allImages.length > 1 && (
          <>
            <Box
              onClick={goPrev}
              sx={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
                transition: "all 0.15s",
              }}
            >
              <PrevIcon sx={{ fontSize: 20, color: "text.primary" }} />
            </Box>
            <Box
              onClick={goNext}
              sx={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" },
                transition: "all 0.15s",
              }}
            >
              <NextIcon sx={{ fontSize: 20, color: "text.primary" }} />
            </Box>

            {/* Image counter */}
            <Box
              sx={{
                position: "absolute",
                bottom: 12,
                right: 12,
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                px: 1.5,
                py: 0.25,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {active + 1} / {allImages.length}
            </Box>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1.5,
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {allImages.map((url, idx) => (
            <Box
              key={idx}
              onClick={() => setActive(idx)}
              sx={{
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: 1.5,
                overflow: "hidden",
                border: "2px solid",
                borderColor: idx === active ? "primary.main" : "divider",
                cursor: "pointer",
                opacity: idx === active ? 1 : 0.65,
                transition: "all 0.15s",
                "&:hover": { opacity: 1 },
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`${name} ${idx + 1}`}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────

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
    if (!isAuthenticated) { navigate(ROUTES.LOGIN); return; }
    const err = await addToCart(product.id, quantity);
    setCartMsg(err ? { text: err, success: false } : { text: "Added to cart!", success: true });
    setTimeout(() => setCartMsg(null), 3000);
  };

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Navbar />
      <Box sx={{ pt: { xs: 10, md: 12 }, pb: 10, minHeight: "100vh" }}>
        <Container maxWidth="lg">
          {/* Breadcrumb */}
          <Breadcrumbs sx={{ mb: 4, fontSize: 13 }}>
            <Link
              component={RouterLink}
              to={ROUTES.HOME}
              underline="hover"
              color="inherit"
              sx={{ fontSize: 13 }}
            >
              Home
            </Link>
            <Link
              component={RouterLink}
              to={ROUTES.PRODUCTS}
              underline="hover"
              color="inherit"
              sx={{ fontSize: 13 }}
            >
              Products
            </Link>
            {product?.category && (
              <Link
                component={RouterLink}
                to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                underline="hover"
                color="inherit"
                sx={{ fontSize: 13 }}
              >
                {product.category.name}
              </Link>
            )}
            <Typography color="text.primary" sx={{ fontSize: 13 }}>
              {product?.name ?? "…"}
            </Typography>
          </Breadcrumbs>

          {isLoading || !product ? (
            <Grid container spacing={6}>
              <Grid item xs={12} md={5}>
                <Skeleton variant="rounded" height={420} sx={{ borderRadius: 3 }} />
                <Stack direction="row" spacing={1} mt={1.5}>
                  {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" width={72} height={72} />)}
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Skeleton height={20} width="30%" sx={{ mb: 1 }} />
                <Skeleton height={44} width="80%" sx={{ mb: 1 }} />
                <Skeleton height={24} width="25%" sx={{ mb: 2 }} />
                <Skeleton height={40} width="35%" sx={{ mb: 3 }} />
                <Skeleton height={80} sx={{ mb: 3 }} />
                <Skeleton height={52} width="60%" />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={{ xs: 4, md: 7 }}>
              {/* Left: Image Gallery */}
              <Grid item xs={12} md={5}>
                <ImageGallery
                  primaryUrl={product.image_url}
                  galleryUrls={product.images?.map((img) => img.image_url) ?? []}
                  name={product.name}
                />
              </Grid>

              {/* Right: Product Info */}
              <Grid item xs={12} md={7}>
                {product.category && (
                  <Chip
                    label={product.category.name}
                    size="small"
                    component={RouterLink}
                    to={`${ROUTES.PRODUCTS}?category=${product.category.slug}`}
                    clickable
                    sx={{ mb: 1.5, fontWeight: 600 }}
                  />
                )}

                <Typography variant="h4" fontWeight={800} gutterBottom lineHeight={1.25}>
                  {product.name}
                </Typography>

                {/* Rating */}
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <Stack direction="row" gap={0.25}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} sx={{ fontSize: 16, color: "#f59e0b" }} />
                    ))}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    4.8 · 128 reviews
                  </Typography>
                </Stack>

                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <SkuIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                  <Typography variant="caption" color="text.disabled" fontFamily="monospace">
                    SKU: {product.sku}
                  </Typography>
                </Stack>

                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 2,
                    fontSize: { xs: "2rem", md: "2.5rem" },
                  }}
                >
                  ${Number(product.price).toFixed(2)}
                </Typography>

                <Divider sx={{ mb: 2.5 }} />

                {/* Description */}
                {product.description && (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    lineHeight={1.8}
                    mb={3}
                    sx={{ fontSize: "0.95rem" }}
                  >
                    {product.description}
                  </Typography>
                )}

                {/* Stock status */}
                <Box mb={3}>
                  {product.stock_quantity === 0 ? (
                    <Chip label="Out of stock" color="error" variant="outlined" />
                  ) : (
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        In Stock
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        · {product.stock_quantity} available
                      </Typography>
                    </Stack>
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
                  <Stack direction="row" spacing={2} alignItems="center" mt={2} mb={3}>
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
                      sx={{
                        px: 5,
                        py: 1.25,
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: 15,
                        flex: 1,
                        maxWidth: 280,
                      }}
                    >
                      {isAuthenticated ? "Add to Cart" : "Login to Buy"}
                    </Button>
                  </Stack>
                )}

                {/* Trust badges */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2.5,
                    bgcolor: "#f8fafc",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1.5}>
                    {[
                      { icon: <ShippingIcon sx={{ fontSize: 16, color: "primary.main" }} />, text: "Free delivery on orders over $50" },
                      { icon: <VerifiedIcon sx={{ fontSize: 16, color: "success.main" }} />, text: "Secure checkout with SSL encryption" },
                      { icon: <ReturnIcon sx={{ fontSize: 16, color: "secondary.main" }} />, text: "30-day hassle-free returns" },
                    ].map(({ icon, text }) => (
                      <Stack key={text} direction="row" alignItems="center" gap={1.5}>
                        {icon}
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                          {text}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                <Button
                  startIcon={<BackIcon />}
                  onClick={() => navigate(-1)}
                  sx={{ mt: 3, color: "text.secondary", fontSize: 13 }}
                >
                  Back
                </Button>
              </Grid>
            </Grid>
          )}

          {/* Related products */}
          {related.length > 0 && (
            <Box mt={10}>
              <Divider sx={{ mb: 5 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 4,
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 3, fontSize: 11 }}
                  >
                    You May Also Like
                  </Typography>
                  <Typography variant="h5" fontWeight={700} mt={0.5}>
                    Related Products
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to={
                    product?.category
                      ? `${ROUTES.PRODUCTS}?category=${product.category.slug}`
                      : ROUTES.PRODUCTS
                  }
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  View More
                </Button>
              </Box>

              <Grid container spacing={2.5}>
                {related.map((p) => {
                  const img = p.image_url ?? p.images?.[0]?.image_url ?? null;
                  return (
                    <Grid item xs={12} sm={6} md={3} key={p.id}>
                      <Box
                        component={RouterLink}
                        to={productDetailPath(p.slug)}
                        sx={{
                          display: "block",
                          textDecoration: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2.5,
                          overflow: "hidden",
                          bgcolor: "white",
                          transition: "all 0.22s",
                          "&:hover": {
                            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
                            transform: "translateY(-4px)",
                            borderColor: "primary.light",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            height: 180,
                            bgcolor: "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {img ? (
                            <Box
                              component="img"
                              src={img}
                              alt={p.name}
                              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <InventoryIcon sx={{ color: "#cbd5e1", fontSize: 48 }} />
                          )}
                        </Box>
                        <Box p={2}>
                          {p.category && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "primary.main",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 1,
                                fontSize: 10,
                              }}
                            >
                              {p.category.name}
                            </Typography>
                          )}
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            noWrap
                            color="text.primary"
                            mt={0.25}
                          >
                            {p.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" justifyContent="space-between" mt={0.75}>
                            <Typography
                              variant="body1"
                              sx={{ color: "#1d4ed8", fontWeight: 800 }}
                            >
                              ${Number(p.price).toFixed(2)}
                            </Typography>
                            <Stack direction="row" gap={0.25}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <StarIcon key={s} sx={{ fontSize: 11, color: "#f59e0b" }} />
                              ))}
                            </Stack>
                          </Stack>
                        </Box>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default ProductDetailPage;
