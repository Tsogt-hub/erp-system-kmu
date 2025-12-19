import { createTheme } from '@mui/material/styles';

// Palantir AIP / Dark Mode Design System Theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366F1', // Indigo
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#22D3EE', // Cyan
      light: '#67E8F9',
      dark: '#06B6D4',
      contrastText: '#000000',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    background: {
      default: '#0A0A0F',
      paper: '#14141F',
    },
    text: {
      primary: '#F8FAFC',
      secondary: 'rgba(248, 250, 252, 0.7)',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    action: {
      active: '#6366F1',
      hover: 'rgba(99, 102, 241, 0.08)',
      selected: 'rgba(99, 102, 241, 0.16)',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '-0.04em',
      color: '#F8FAFC',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.035em',
      color: '#F8FAFC',
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.03em',
      color: '#F8FAFC',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em',
      color: '#F8FAFC',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: '#F8FAFC',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.018em',
      color: '#F8FAFC',
      lineHeight: 1.35,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '-0.013em',
      color: '#F8FAFC',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.9375rem',
      letterSpacing: '-0.011em',
      color: 'rgba(248, 250, 252, 0.7)',
      lineHeight: 1.45,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '-0.013em',
      textTransform: 'none',
      fontSize: '0.9375rem',
    },
    caption: {
      fontSize: '0.875rem',
      letterSpacing: '-0.009em',
      color: 'rgba(248, 250, 252, 0.6)',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    '0 2px 6px 0 rgba(0, 0, 0, 0.35)',
    '0 4px 12px 0 rgba(0, 0, 0, 0.4)',
    '0 6px 16px 0 rgba(0, 0, 0, 0.45)',
    '0 8px 20px 0 rgba(0, 0, 0, 0.5)',
    '0 10px 24px 0 rgba(0, 0, 0, 0.55)',
    '0 12px 28px 0 rgba(0, 0, 0, 0.6)',
    '0 14px 32px 0 rgba(0, 0, 0, 0.6)',
    '0 16px 36px 0 rgba(0, 0, 0, 0.6)',
    '0 18px 40px 0 rgba(0, 0, 0, 0.6)',
    '0 20px 44px 0 rgba(0, 0, 0, 0.6)',
    '0 22px 48px 0 rgba(0, 0, 0, 0.6)',
    '0 24px 52px 0 rgba(0, 0, 0, 0.6)',
    '0 26px 56px 0 rgba(0, 0, 0, 0.6)',
    '0 28px 60px 0 rgba(0, 0, 0, 0.6)',
    '0 30px 64px 0 rgba(0, 0, 0, 0.6)',
    '0 32px 68px 0 rgba(0, 0, 0, 0.6)',
    '0 34px 72px 0 rgba(0, 0, 0, 0.6)',
    '0 36px 76px 0 rgba(0, 0, 0, 0.6)',
    '0 38px 80px 0 rgba(0, 0, 0, 0.6)',
    '0 40px 84px 0 rgba(0, 0, 0, 0.6)',
    '0 42px 88px 0 rgba(0, 0, 0, 0.6)',
    '0 44px 92px 0 rgba(0, 0, 0, 0.6)',
    '0 46px 96px 0 rgba(0, 0, 0, 0.6)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
          backgroundColor: '#0A0A0F',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 10,
          fontWeight: 600,
          padding: '9px 18px',
          fontSize: '0.9375rem',
          letterSpacing: '-0.013em',
          transition: 'all 0.15s ease-out',
          '&:active': {
            transform: 'scale(0.97)',
          },
        },
        contained: {
          background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 100%)',
          boxShadow: '0 2px 12px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(180deg, #818CF8 0%, #6366F1 100%)',
            boxShadow: '0 4px 20px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          },
        },
        outlined: {
          background: 'rgba(99, 102, 241, 0.08)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818CF8',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.15)',
            borderColor: 'rgba(99, 102, 241, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, rgba(20, 20, 31, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(20, 20, 31, 0.95)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(14, 14, 21, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)',
          backdropFilter: 'blur(60px) saturate(160%)',
          WebkitBackdropFilter: 'blur(60px) saturate(160%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(14, 14, 21, 0.9)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          boxShadow: 'none',
          color: '#F8FAFC',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 10,
            transition: 'all 0.15s ease-out',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 1,
            },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(99, 102, 241, 0.4)',
              },
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.06)',
              boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.15)',
              '& fieldset': {
                borderColor: '#6366F1',
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-outlined': {
            color: 'rgba(248, 250, 252, 0.6)',
            '&.Mui-focused': {
              color: '#818CF8',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(99, 102, 241, 0.15)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#818CF8',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#F8FAFC',
            letterSpacing: '-0.013em',
            fontSize: '0.9375rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease-out',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.08)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '12px 16px',
          color: '#F8FAFC',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, rgba(20, 20, 31, 0.98) 0%, rgba(14, 14, 21, 0.99) 100%)',
          backdropFilter: 'blur(60px) saturate(160%)',
          WebkitBackdropFilter: 'blur(60px) saturate(160%)',
          borderRadius: 18,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          transition: 'all 0.15s ease-out',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.12)',
          },
          '&.Mui-selected': {
            background: 'rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'rgba(99, 102, 241, 0.25)',
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.9375rem',
          letterSpacing: '-0.013em',
          color: 'rgba(248, 250, 252, 0.6)',
          minHeight: 44,
          '&.Mui-selected': {
            color: '#818CF8',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#6366F1',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: 'rgba(248, 250, 252, 0.8)',
          '&:hover': {
            background: 'rgba(99, 102, 241, 0.15)',
          },
        },
      },
    },
  },
});

