import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Inventory2 as InventoryIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCart as CartIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { Navbar } from "@/components/layout/Navbar";
import { APP_NAME, productDetailPath, ROUTES } from "@/constants";
import { productApi } from "@/api/productApi";
import { useApi } from "@/hooks/useApi";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

const FEATURES = [
  { icon: <ShippingIcon sx={{ fontSize: 36 }} />, title: "Fast Delivery", desc: "Get your orders delivered quickly and reliably across the country." },
  { icon: <SecurityIcon sx={{ fontSize: 36 }} />, title: "Secure Payments", desc: "Shop with confidence — every transaction is encrypted end-to-end." },
  { icon: <SupportIcon sx={{ fontSize: 36 }} />, title: "24/7 Support", desc: "Our customer team is always here whenever you need help." },
];

const ProductCard = ({ product }: { product: Product }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addToCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    await addToCart(product.id, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 30px rgba(0,0,0,0.12)" },
        transition: "all 0.2s ease",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        component={RouterLink}
        to={productDetailPath(product.slug)}
        sx={{
          height: 180,
          bgcolor: "grey.100",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          textDecoration: "none",
        }}
      >
        {product.image_url ? (
          <Box
            component="img"
            src={product.image_url}
            alt={product.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Avatar variant="square" sx={{ width: 72, height: 72, bgcolor: "grey.200" }}>
            <InventoryIcon sx={{ color: "grey.400", fontSize: 40 }} />
          </Avatar>
        )}
      </Box>
      <CardContent sx={{ flex: 1, pb: 1 }}>
        {product.category && (
          <Typography variant="caption" color="primary.main" fontWeight={600} display="block" mb={0.5}>
            {product.category.name}
          </Typography>
        )}
        <Typography
          variant="body1"
          fontWeight={600}
          gutterBottom
          component={RouterLink}
          to={productDetailPath(product.slug)}
          sx={{ textDecoration: "none", color: "text.primary" }}
        >
          {product.name}
        </Typography>
        <Typography variant="h6" color="primary.main" fontWeight={700}>
          ${Number(product.price).toFixed(2)}
        </Typography>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        {isAuthenticated ? (
          <Button
            variant="contained"
            size="small"
            fullWidth
            startIcon={<CartIcon />}
            onClick={handleAddToCart}
            disabled={added || product.stock_quantity === 0}
          >
            {product.stock_quantity === 0 ? "Out of Stock" : added ? "Added!" : "Add to Cart"}
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to={ROUTES.LOGIN}
            variant="contained"
            size="small"
            fullWidth
            startIcon={<CartIcon />}
          >
            Login to Buy
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const ProductSkeleton = () => (
  <Card sx={{ border: "1px solid", borderColor: "divider" }}>
    <Skeleton variant="rectangular" height={180} />
    <CardContent>
      <Skeleton height={20} width="40%" sx={{ mb: 1 }} />
      <Skeleton height={24} sx={{ mb: 1 }} />
      <Skeleton height={28} width="50%" />
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="rounded" height={32} sx={{ flex: 1 }} />
    </CardActions>
  </Card>
);

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const { execute: fetchProducts, isLoading } = useApi(
    useCallback(() => productApi.list({ page_size: 8, ordering: "-created_at" }), [])
  );

  useEffect(() => {
    fetchProducts().then((r) => {
      if (r.data) setProducts(r.data.results);
    });
  }, [fetchProducts]);

  return (
    <Box>
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          pt: { xs: 14, md: 18 },
          pb: { xs: 10, md: 14 },
          background: "linear-gradient(145deg, #1d4ed8 0%, #7c3aed 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <ShoppingBagIcon sx={{ fontSize: 72, mb: 2, opacity: 0.9 }} />
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Welcome to {APP_NAME}
          </Typography>
          <Typography
            variant="h6"
            sx={{ opacity: 0.85, mb: 5, maxWidth: 540, mx: "auto", lineHeight: 1.6 }}
          >
            Discover thousands of products across every category — all in one place,
            at unbeatable prices.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button
              component={RouterLink}
              to={ROUTES.REGISTER}
              variant="contained"
              size="large"
              sx={{ bgcolor: "white", color: "primary.main", "&:hover": { bgcolor: "grey.100" }, px: 5, py: 1.5, fontSize: 16 }}
            >
              Create Free Account
            </Button>
            <Button
              component={RouterLink}
              to={ROUTES.LOGIN}
              variant="outlined"
              size="large"
              sx={{ borderColor: "rgba(255,255,255,0.7)", color: "white", "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" }, px: 5, py: 1.5, fontSize: 16 }}
            >
              Login
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Why Us ───────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "background.default" }}>
        <Container maxWidth="lg">
          <Typography variant="h4" fontWeight={700} textAlign="center" mb={1}>
            Why shop with {APP_NAME}?
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={7}>
            Everything you need for a great shopping experience.
          </Typography>
          <Grid container spacing={5}>
            {FEATURES.map(({ icon, title, desc }) => (
              <Grid item xs={12} md={4} key={title}>
                <Box textAlign="center" px={2}>
                  <Box
                    sx={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                      color: "white", display: "flex", alignItems: "center",
                      justifyContent: "center", mx: "auto", mb: 2.5,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>{desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider />

      {/* ── Featured Products ─────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 5 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Featured Products
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Handpicked just for you — fresh arrivals and bestsellers.
              </Typography>
            </Box>
            <Button component={RouterLink} to={ROUTES.PRODUCTS} variant="outlined">
              View All
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={3} key={i}>
                    <ProductSkeleton />
                  </Grid>
                ))
              : products.map((p) => (
                  <Grid item xs={12} sm={6} md={3} key={p.id}>
                    <ProductCard product={p} />
                  </Grid>
                ))}
          </Grid>

          {!isLoading && products.length === 0 && (
            <Box textAlign="center" py={8}>
              <InventoryIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
              <Typography color="text.secondary">No products yet. Check back soon!</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Box sx={{ py: 4, bgcolor: "#0f172a", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
