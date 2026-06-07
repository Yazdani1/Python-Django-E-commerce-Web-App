import { CssBaseline, ThemeProvider } from "@mui/material";
import AppRoutes from "@/routes/AppRoutes";
import { theme } from "@/constants/theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
