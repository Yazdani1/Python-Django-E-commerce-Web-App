import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  ShoppingBag as ShoppingBagIcon,
  ShoppingCart as CartIcon,
  Support as SupportIcon,
} from "@mui/icons-material";
import { Navbar } from "@/components/layout/Navbar";
import { APP_NAME, ROUTES } from "@/constants";

const FEATURES = [
  {
    icon: <ShippingIcon sx={{ fontSize: 36 }} />,
    title: "Fast Delivery",
    desc: "Get your orders delivered quickly and reliably across the country.",
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 36 }} />,
    title: "Secure Payments",
    desc: "Shop with confidence — every transaction is encrypted end-to-end.",
  },
  {
    icon: <SupportIcon sx={{ fontSize: 36 }} />,
    title: "24/7 Support",
    desc: "Our customer team is always here whenever you need help.",
  },
];

const PLACEHOLDER_PRODUCTS = [
  { id: 1, name: "Wireless Headphones", category: "Electronics", price: "$89.99", color: "#3b82f6" },
  { id: 2, name: "Running Sneakers", category: "Fashion", price: "$124.00", color: "#8b5cf6" },
  { id: 3, name: "Coffee Maker Pro", category: "Home & Garden", price: "$59.99", color: "#10b981" },
  { id: 4, name: "Leather Backpack", category: "Fashion", price: "$74.50", color: "#f59e0b" },
  { id: 5, name: "Mechanical Keyboard", category: "Electronics", price: "$109.00", color: "#ef4444" },
  { id: 6, name: "Yoga Mat Deluxe", category: "Sports", price: "$39.99", color: "#06b6d4" },
  { id: 7, name: "Table Lamp", category: "Home & Garden", price: "$49.00", color: "#f97316" },
  { id: 8, name: "Smart Watch", category: "Electronics", price: "$199.00", color: "#6366f1" },
];

const HomePage = () => (
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
            sx={{
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
              px: 5,
              py: 1.5,
              fontSize: 16,
            }}
          >
            Create Free Account
          </Button>
          <Button
            component={RouterLink}
            to={ROUTES.LOGIN}
            variant="outlined"
            size="large"
            sx={{
              borderColor: "rgba(255,255,255,0.7)",
              color: "white",
              "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.08)" },
              px: 5,
              py: 1.5,
              fontSize: 16,
            }}
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
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 2.5,
                  }}
                >
                  {icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                  {desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>

    <Divider />

    {/* ── Featured Products (placeholder) ─────────────────────────────── */}
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h4" fontWeight={700}>
            Featured Products
          </Typography>
          <Chip label="Coming soon" color="primary" variant="outlined" size="small" />
        </Box>
        <Typography variant="body1" color="text.secondary" mb={5}>
          Real products will be listed here. Sign up now to be the first to shop!
        </Typography>

        <Grid container spacing={2.5}>
          {PLACEHOLDER_PRODUCTS.map((product) => (
            <Grid item xs={12} sm={6} md={3} key={product.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                  },
                  transition: "all 0.2s ease",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {/* Colour-block placeholder image */}
                <CardMedia
                  sx={{
                    height: 160,
                    bgcolor: product.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ShoppingBagIcon sx={{ fontSize: 52, color: "rgba(255,255,255,0.7)" }} />
                </CardMedia>

                <CardContent sx={{ flex: 1, pb: 1 }}>
                  <Chip
                    label={product.category}
                    size="small"
                    sx={{ mb: 1, fontSize: 11 }}
                  />
                  <Typography variant="body1" fontWeight={600} gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="h6" color="primary.main" fontWeight={700}>
                    {product.price}
                  </Typography>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    component={RouterLink}
                    to={ROUTES.REGISTER}
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<CartIcon />}
                  >
                    Sign up to Buy
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box textAlign="center" mt={6}>
          <Typography variant="body1" color="text.secondary" mb={2}>
            Ready to start shopping?
          </Typography>
          <Button
            component={RouterLink}
            to={ROUTES.REGISTER}
            variant="contained"
            size="large"
            sx={{ px: 6 }}
          >
            Create Your Free Account
          </Button>
        </Box>
      </Container>
    </Box>

    {/* ── Footer ───────────────────────────────────────────────────────── */}
    <Box
      sx={{
        py: 4,
        bgcolor: "#0f172a",
        color: "rgba(255,255,255,0.5)",
        textAlign: "center",
      }}
    >
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </Typography>
    </Box>
  </Box>
);

export default HomePage;
