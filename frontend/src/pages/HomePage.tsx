import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Inventory2 as InventoryIcon,
  Search as SearchIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material";
import { HeroSlider } from "@/components/layout/HeroSlider";
import { Navbar } from "@/components/layout/Navbar";
import { APP_NAME, productDetailPath, ROUTES } from "@/constants";
import { productApi } from "@/api/productApi";
import { categoryApi } from "@/api/categoryApi";
import { useApi } from "@/hooks/useApi";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import type { Category, Product } from "@/types";

// ── Constants ────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Shop: [
    { label: "All Products", to: ROUTES.PRODUCTS },
    { label: "Categories", to: ROUTES.CATEGORIES },
    { label: "New Arrivals", to: `${ROUTES.PRODUCTS}?ordering=-created_at` },
    { label: "Best Sellers", to: ROUTES.PRODUCTS },
  ],
  Account: [
    { label: "My Account", to: ROUTES.PROFILE },
    { label: "Orders", to: ROUTES.ORDERS },
    { label: "Shopping Cart", to: ROUTES.CART },
    { label: "Change Password", to: ROUTES.CHANGE_PASSWORD },
  ],
  Help: [
    { label: "FAQ", to: ROUTES.HOME },
    { label: "Shipping Info", to: ROUTES.HOME },
    { label: "Returns", to: ROUTES.HOME },
    { label: "Contact Us", to: ROUTES.HOME },
  ],
};

// ── Product Card ─────────────────────────────────────────────────────────────

const ProductCard = ({ product }: { product: Product }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { addToCart } = useCartStore();
  const [added, setAdded] = useState(false);

  const primaryImage =
    product.image_url ?? product.images?.[0]?.image_url ?? null;

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
        transition: "all 0.25s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          borderColor: "primary.light",
        },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {product.stock_quantity === 0 && (
        <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 1 }}>
          <Chip label="Out of Stock" size="small" color="error" />
        </Box>
      )}

      <Box
        component={RouterLink}
        to={productDetailPath(product.slug)}
        sx={{
          height: 220,
          bgcolor: "#f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          textDecoration: "none",
          position: "relative",
        }}
      >
        {primaryImage ? (
          <Box
            component="img"
            src={primaryImage}
            alt={product.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              "&:hover": { transform: "scale(1.06)" },
            }}
          />
        ) : (
          <InventoryIcon sx={{ color: "#cbd5e1", fontSize: 56 }} />
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1, pt: 1.5 }}>
        {product.category && (
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              fontSize: 10,
              display: "block",
              mb: 0.5,
            }}
          >
            {product.category.name}
          </Typography>
        )}
        <Typography
          variant="body1"
          fontWeight={600}
          component={RouterLink}
          to={productDetailPath(product.slug)}
          sx={{
            textDecoration: "none",
            color: "text.primary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
            mb: 0.75,
            fontSize: "0.9rem",
          }}
        >
          {product.name}
        </Typography>

        <Stack direction="row" alignItems="center" gap={0.25} mb={0.5}>
          {[1, 2, 3, 4, 5].map((s) => (
            <StarIcon key={s} sx={{ fontSize: 13, color: "#f59e0b" }} />
          ))}
          <Typography variant="caption" color="text.secondary" ml={0.5}>
            (4.8)
          </Typography>
        </Stack>

        <Typography
          variant="h6"
          sx={{ color: "#1d4ed8", fontWeight: 800, fontSize: "1.1rem" }}
        >
          ${Number(product.price).toFixed(2)}
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        {isAuthenticated ? (
          <Button
            variant={added ? "outlined" : "contained"}
            size="small"
            fullWidth
            startIcon={<CartIcon />}
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            sx={{ borderRadius: 2, py: 0.75 }}
          >
            {product.stock_quantity === 0
              ? "Out of Stock"
              : added
              ? "Added ✓"
              : "Add to Cart"}
          </Button>
        ) : (
          <Button
            component={RouterLink}
            to={ROUTES.LOGIN}
            variant="contained"
            size="small"
            fullWidth
            startIcon={<CartIcon />}
            sx={{ borderRadius: 2, py: 0.75 }}
          >
            Login to Buy
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

const ProductSkeleton = () => (
  <Card>
    <Skeleton variant="rectangular" height={220} />
    <CardContent>
      <Skeleton height={14} width="30%" sx={{ mb: 0.5 }} />
      <Skeleton height={18} sx={{ mb: 0.5 }} />
      <Skeleton height={18} width="80%" sx={{ mb: 1 }} />
      <Skeleton height={24} width="40%" />
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="rounded" height={32} sx={{ flex: 1 }} />
    </CardActions>
  </Card>
);

// ── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)", text: "white" },
  { bg: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)", text: "white" },
];

const CategorySkeleton = () => (
  <Box sx={{ borderRadius: 3, overflow: "hidden" }}>
    <Skeleton variant="rectangular" height={110} />
  </Box>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { execute: fetchProducts, isLoading: productsLoading } = useApi(
    useCallback(() => productApi.list({ page_size: 8, ordering: "-created_at" }), [])
  );
  const { execute: fetchCategories, isLoading: categoriesLoading } = useApi(
    useCallback(() => categoryApi.list(), [])
  );

  useEffect(() => {
    fetchProducts().then((r) => {
      if (r.data) setProducts(r.data.results);
    });
    fetchCategories().then((r) => {
      if (r.data) setCategories(r.data.results.slice(0, 6));
    });
  }, [fetchProducts, fetchCategories]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`${ROUTES.PRODUCTS}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      <Navbar />

      {/* ── Hero Slider ──────────────────────────────────────────────────────── */}
      <Box sx={{ pt: { xs: 7, md: 8 } }}>
        <HeroSlider />
      </Box>

      {/* ── Search Bar ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 2.5,
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#f1f5f9",
              borderRadius: 3,
              border: "2px solid transparent",
              px: 2,
              py: 0.75,
              "&:focus-within": {
                bgcolor: "white",
                borderColor: "primary.main",
                boxShadow: "0 0 0 4px rgba(37,99,235,0.1)",
              },
              transition: "all 0.2s",
            }}
          >
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "text.disabled", fontSize: 22 }} />
            </InputAdornment>
            <InputBase
              placeholder="Search for products, brands, categories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              fullWidth
              sx={{ ml: 1, fontSize: 15 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSearch}
              sx={{ ml: 1, px: 3, borderRadius: 2, flexShrink: 0 }}
            >
              Search
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Categories ───────────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: "#f8fafc" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 5 }}>
            <Typography
              variant="overline"
              sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 3, fontSize: 11 }}
            >
              Browse By Category
            </Typography>
            <Typography variant="h4" fontWeight={800} mt={0.5} color="text.primary">
              Shop Our Collections
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {categoriesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={6} sm={4} md={2} key={i}>
                    <CategorySkeleton />
                  </Grid>
                ))
              : categories.map((cat, idx) => {
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <Grid item xs={6} sm={4} md={2} key={cat.id}>
                      <Box
                        component={RouterLink}
                        to={`${ROUTES.PRODUCTS}?category=${cat.slug}`}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textDecoration: "none",
                          borderRadius: 3,
                          p: 3,
                          background: color.bg,
                          color: color.text,
                          minHeight: 110,
                          transition: "all 0.25s ease",
                          "&:hover": {
                            transform: "translateY(-4px) scale(1.02)",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                          },
                        }}
                      >
                        <InventoryIcon sx={{ fontSize: 32, mb: 1, opacity: 0.9 }} />
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          textAlign="center"
                          sx={{ lineHeight: 1.3 }}
                        >
                          {cat.name}
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })}
          </Grid>

          {!categoriesLoading && categories.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No categories available yet.</Typography>
            </Box>
          )}

          <Box textAlign="center" mt={4}>
            <Button
              component={RouterLink}
              to={ROUTES.CATEGORIES}
              variant="outlined"
              sx={{ px: 5, py: 1.25, borderRadius: 2, fontWeight: 600 }}
            >
              View All Categories
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Featured Products ─────────────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: "white" }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              mb: 5,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 3, fontSize: 11 }}
              >
                Handpicked For You
              </Typography>
              <Typography variant="h4" fontWeight={800} color="text.primary" mt={0.5}>
                Featured Products
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Fresh arrivals and bestsellers, curated just for you.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to={ROUTES.PRODUCTS}
              variant="outlined"
              sx={{ px: 4, borderRadius: 2, fontWeight: 600, flexShrink: 0 }}
            >
              View All Products →
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            {productsLoading
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

          {!productsLoading && products.length === 0 && (
            <Box textAlign="center" py={10}>
              <InventoryIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
              <Typography color="text.secondary" variant="h6">
                No products yet. Check back soon!
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <Box
        component="footer"
        sx={{
          bgcolor: "#0f172a",
          color: "rgba(255,255,255,0.65)",
          pt: { xs: 6, md: 10 },
          pb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={5} mb={6}>
            {/* Brand column */}
            <Grid item xs={12} md={4}>
              <Stack direction="row" alignItems="center" gap={1} mb={2}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CartIcon sx={{ color: "white", fontSize: 20 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} color="white">
                  {APP_NAME}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 3, maxWidth: 280 }}>
                Your premium destination for quality products. We bring the best brands and
                curated collections straight to your door.
              </Typography>
              <Stack direction="row" gap={1}>
                {[FacebookIcon, TwitterIcon, InstagramIcon].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.6)",
                      "&:hover": { bgcolor: "primary.main", color: "white" },
                      transition: "all 0.2s",
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Stack>
            </Grid>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
              <Grid item xs={6} sm={4} md={2} key={heading}>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color="white"
                  mb={2}
                  sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}
                >
                  {heading}
                </Typography>
                <Stack spacing={1}>
                  {links.map(({ label, to }) => (
                    <Box
                      key={label}
                      component={RouterLink}
                      to={to}
                      sx={{
                        color: "rgba(255,255,255,0.55)",
                        textDecoration: "none",
                        fontSize: 14,
                        "&:hover": { color: "white" },
                        transition: "color 0.15s",
                      }}
                    >
                      {label}
                    </Box>
                  ))}
                </Stack>
              </Grid>
            ))}

            {/* Newsletter */}
            <Grid item xs={12} sm={6} md={2}>
              <Typography
                variant="body2"
                fontWeight={700}
                color="white"
                mb={2}
                sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 11 }}
              >
                Newsletter
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.55)",
                  lineHeight: 1.6,
                  display: "block",
                  mb: 1.5,
                }}
              >
                Subscribe for deals, new arrivals & style tips.
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <InputBase
                  placeholder="Your email address"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.08)",
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.75,
                    fontSize: 13,
                    color: "white",
                    "& input::placeholder": { color: "rgba(255,255,255,0.4)" },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  sx={{ borderRadius: 1.5, fontWeight: 600, py: 0.75 }}
                >
                  Subscribe
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom bar */}
          <Box
            sx={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              pt: 3,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.35)" }}>
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </Typography>
            <Stack direction="row" gap={3}>
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
                <Box
                  key={t}
                  component={RouterLink}
                  to={ROUTES.HOME}
                  sx={{
                    color: "rgba(255,255,255,0.35)",
                    textDecoration: "none",
                    fontSize: 12,
                    "&:hover": { color: "white" },
                  }}
                >
                  {t}
                </Box>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
