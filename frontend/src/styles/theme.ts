import { createTheme } from '@mui/material/styles';

// macOS Tahoe Design System Theme
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#007AFF', // macOS System Blue
      light: '#5AC8FA',
      dark: '#0051D5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#AF52DE', // macOS System Purple
      light: '#BF5AF2',
      dark: '#8944AB',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF3B30', // macOS System Red
      light: '#FF453A',
      dark: '#D70015',
    },
    warning: {
      main: '#FF9500', // macOS System Orange
      light: '#FF9F0A',
      dark: '#C93400',
    },
    info: {
      main: '#5AC8FA', // macOS System Teal
      light: '#64D2FF',
      dark: '#50C8FF',
    },
    success: {
      main: '#34C759', // macOS System Green
      light: '#32D74B',
      dark: '#248A3D',
    },
    background: {
      default: '#FFFFFF',
      paper: 'rgba(255, 255, 255, 0.72)',
    },
    text: {
      primary: '#000000',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.1)',
    action: {
      active: '#007AFF',
      hover: 'rgba(0, 122, 255, 0.06)',
      selected: 'rgba(0, 122, 255, 0.10)',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      letterSpacing: '-0.04em',
      color: '#000000',
      lineHeight: 1.1,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.035em',
      color: '#000000',
      lineHeight: 1.15,
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      letterSpacing: '-0.03em',
      color: '#000000',
      lineHeight: 1.2,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.025em',
      color: '#000000',
      lineHeight: 1.25,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.02em',
      color: '#000000',
      lineHeight: 1.3,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.018em',
      color: '#000000',
      lineHeight: 1.35,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '-0.013em',
      color: '#000000',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.9375rem',
      letterSpacing: '-0.011em',
      color: 'rgba(0, 0, 0, 0.6)',
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
      color: 'rgba(0, 0, 0, 0.6)',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    '0 3px 6px 0 rgba(0, 0, 0, 0.07)',
    '0 4px 8px 0 rgba(0, 0, 0, 0.08)',
    '0 5px 10px 0 rgba(0, 0, 0, 0.09)',
    '0 6px 12px 0 rgba(0, 0, 0, 0.10)',
    '0 8px 16px 0 rgba(0, 0, 0, 0.11)',
    '0 10px 20px 0 rgba(0, 0, 0, 0.12)',
    '0 12px 24px 0 rgba(0, 0, 0, 0.13)',
    '0 14px 28px 0 rgba(0, 0, 0, 0.14)',
    '0 16px 32px 0 rgba(0, 0, 0, 0.15)',
    '0 18px 36px 0 rgba(0, 0, 0, 0.16)',
    '0 20px 40px 0 rgba(0, 0, 0, 0.17)',
    '0 22px 44px 0 rgba(0, 0, 0, 0.18)',
    '0 24px 48px 0 rgba(0, 0, 0, 0.19)',
    '0 26px 52px 0 rgba(0, 0, 0, 0.20)',
    '0 28px 56px 0 rgba(0, 0, 0, 0.21)',
    '0 30px 60px 0 rgba(0, 0, 0, 0.22)',
    '0 32px 64px 0 rgba(0, 0, 0, 0.23)',
    '0 34px 68px 0 rgba(0, 0, 0, 0.24)',
    '0 36px 72px 0 rgba(0, 0, 0, 0.25)',
    '0 38px 76px 0 rgba(0, 0, 0, 0.26)',
    '0 40px 80px 0 rgba(0, 0, 0, 0.27)',
    '0 42px 84px 0 rgba(0, 0, 0, 0.28)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility',
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
          background: 'linear-gradient(180deg, #007AFF 0%, #0051D5 100%)',
          boxShadow: '0 2px 8px rgba(0, 122, 255, 0.25), 0 0 0 0.5px rgba(255, 255, 255, 0.1) inset',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(180deg, #409CFF 0%, #007AFF 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.35), 0 0 0 0.5px rgba(255, 255, 255, 0.15) inset',
          },
        },
        outlined: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(0, 122, 255, 0.3)',
          border: '1px solid rgba(0, 122, 255, 0.3)',
          color: '#007AFF',
          '&:hover': {
            background: 'rgba(0, 122, 255, 0.08)',
            borderColor: 'rgba(0, 122, 255, 0.5)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          WebkitBackdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-out',
          '&:hover': {
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.12), 0 6px 8px rgba(0, 0, 0, 0.06)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          WebkitBackdropFilter: 'blur(60px) saturate(150%)',
          backgroundImage: 'none',
          borderRadius: 12,
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.10)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'rgba(252, 252, 253, 0.88)',
          backdropFilter: 'blur(50px) saturate(160%)',
          WebkitBackdropFilter: 'blur(50px) saturate(160%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.10)',
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(40px) saturate(150%)',
          WebkitBackdropFilter: 'blur(40px) saturate(150%)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: 'none',
          color: '#000000',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 10,
            transition: 'all 0.15s ease-out',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.12)',
              borderWidth: 1,
            },
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.85)',
              '& fieldset': {
                borderColor: 'rgba(0, 122, 255, 0.25)',
              },
            },
            '&.Mui-focused': {
              background: 'rgba(255, 255, 255, 0.95)',
              boxShadow: '0 0 0 3px rgba(0, 122, 255, 0.10)',
              '& fieldset': {
                borderColor: '#007AFF',
                borderWidth: 2,
              },
            },
          },
          '& .MuiInputLabel-outlined': {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-focused': {
              color: '#007AFF',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          background: 'rgba(0, 122, 255, 0.10)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: '#007AFF',
          border: '1px solid rgba(0, 122, 255, 0.15)',
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.875rem',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'rgba(252, 252, 253, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#000000',
            letterSpacing: '-0.013em',
            fontSize: '0.9375rem',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background 0.15s ease-out',
          '&:hover': {
            background: 'rgba(0, 122, 255, 0.05)',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          padding: '12px 16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(40px) saturate(160%)',
          WebkitBackdropFilter: 'blur(40px) saturate(160%)',
          borderRadius: 18,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 12px 48px rgba(0, 0, 0, 0.15)',
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
            background: 'rgba(0, 122, 255, 0.08)',
          },
          '&.Mui-selected': {
            background: 'rgba(0, 122, 255, 0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            '&:hover': {
              background: 'rgba(0, 122, 255, 0.16)',
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
          color: 'rgba(0, 0, 0, 0.6)',
          minHeight: 44,
          '&.Mui-selected': {
            color: '#007AFF',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#007AFF',
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
  },
});
