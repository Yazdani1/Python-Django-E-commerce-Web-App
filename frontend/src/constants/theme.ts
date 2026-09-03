import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		primary: {
			main: '#2563eb',
			light: '#3b82f6',
			dark: '#1d4ed8',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#f59e0b',
			light: '#fbbf24',
			dark: '#d97706',
			contrastText: '#ffffff',
		},
		background: {
			default: '#f8fafc',
			paper: '#ffffff',
		},
		text: {
			primary: '#0f172a',
			secondary: '#64748b',
		},
		divider: '#e2e8f0',
		success: {
			main: '#10b981',
			contrastText: '#ffffff',
		},
		error: {
			main: '#ef4444',
			contrastText: '#ffffff',
		},
	},
	typography: {
		fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
		h1: { fontWeight: 800, letterSpacing: '-0.025em' },
		h2: { fontWeight: 800, letterSpacing: '-0.025em' },
		h3: { fontWeight: 700, letterSpacing: '-0.02em' },
		h4: { fontWeight: 700, letterSpacing: '-0.015em' },
		h5: { fontWeight: 600, letterSpacing: '-0.01em' },
		h6: { fontWeight: 600 },
		button: { fontWeight: 600, letterSpacing: '0.01em' },
		body1: { lineHeight: 1.7 },
		body2: { lineHeight: 1.6 },
	},

	shape: {
		borderRadius: 10,
	},

	components: {
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: {
					textTransform: 'none',
					fontWeight: 600,
					borderRadius: 8,
					transition: 'all 0.18s ease',
				},
				containedPrimary: {
					background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
					'&:hover': {
						background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
						transform: 'translateY(-1px)',
						boxShadow: '0 6px 20px rgba(37,99,235,0.35)',
					},
				},
			},
		},
		MuiTextField: {
			defaultProps: { variant: 'outlined', size: 'small' },
		},
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
					border: '1px solid #e2e8f0',
					borderRadius: 12,
				},
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { fontWeight: 600 },
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: { boxShadow: 'none' },
			},
		},
	},
});
