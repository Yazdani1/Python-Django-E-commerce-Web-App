import { CssBaseline, ThemeProvider } from "@mui/material";
import AppRoutes from "@/routes/AppRoutes";
import { theme } from "@/constants/theme";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}
