import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Avatar,
  useTheme,
} from '@mui/material';
import { AppDispatch, RootState } from '../store/store';
import { login } from '../store/slices/authSlice';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { isLoading, error, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Dark/Light Mode Background
        background: isDarkMode
          ? `linear-gradient(135deg, 
              #0A0A0F 0%, 
              #0E0E14 25%, 
              #12121A 50%, 
              #0A0A0F 75%, 
              #0C0C12 100%
            )`
          : `linear-gradient(135deg, 
              #F5F5F7 0%, 
              #E8E8ED 25%, 
              #F0F0F5 50%, 
              #E5E5EA 75%, 
              #F2F2F7 100%
            )`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Light Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-30%',
          left: '-20%',
          width: '60%',
          height: '80%',
          background: isDarkMode
            ? 'radial-gradient(ellipse, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.05) 40%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(0, 113, 227, 0.15) 0%, rgba(0, 113, 227, 0.05) 40%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-30%',
          right: '-20%',
          width: '60%',
          height: '80%',
          background: isDarkMode
            ? 'radial-gradient(ellipse, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)'
            : 'radial-gradient(ellipse, rgba(191, 90, 242, 0.12) 0%, rgba(191, 90, 242, 0.04) 40%, transparent 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            width: '100%',
            // Dark/Light Mode Glass Card
            background: isDarkMode
              ? 'rgba(20, 20, 31, 0.85)'
              : 'rgba(255, 255, 255, 0.72)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            borderRadius: '20px',
            border: isDarkMode
              ? '1px solid rgba(255, 255, 255, 0.08)'
              : '0.5px solid rgba(255, 255, 255, 0.5)',
            boxShadow: isDarkMode
              ? `0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0.5px 0 rgba(255, 255, 255, 0.05)`
              : `0 2px 2px rgba(0, 0, 0, 0.01),
                 0 4px 4px rgba(0, 0, 0, 0.02),
                 0 8px 8px rgba(0, 0, 0, 0.02),
                 0 16px 16px rgba(0, 0, 0, 0.02),
                 0 32px 32px rgba(0, 0, 0, 0.03),
                 inset 0 0.5px 0 rgba(255, 255, 255, 0.8)`,
          }}
        >
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #0071E3 0%, #40C8E0 100%)',
                boxShadow: '0 8px 24px rgba(0, 113, 227, 0.3)',
                fontSize: '1.5rem',
                fontWeight: 700,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              E
            </Avatar>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                fontSize: '1.75rem',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #0071E3 0%, #BF5AF2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              }}
            >
              Elite ERP
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1,
                color: isDarkMode ? 'rgba(248, 250, 252, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              Anmelden bei Ihrem Konto
            </Typography>
          </Box>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px',
                background: 'rgba(255, 59, 48, 0.08)',
                border: '0.5px solid rgba(255, 59, 48, 0.2)',
                color: '#D70015',
                '& .MuiAlert-icon': {
                  color: '#FF3B30',
                },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: isDarkMode ? 'rgba(30, 30, 45, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  color: isDarkMode ? '#F8FAFC' : undefined,
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(0, 113, 227, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: isDarkMode ? '#F8FAFC' : undefined,
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  color: isDarkMode ? '#F8FAFC' : '#1D1D1F',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: '#FF3B30',
                },
              }}
            />
            <TextField
              fullWidth
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  background: isDarkMode ? 'rgba(30, 30, 45, 0.6)' : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(20px)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  color: isDarkMode ? '#F8FAFC' : undefined,
                  '& fieldset': {
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    borderWidth: '1px',
                  },
                  '&:hover fieldset': {
                    borderColor: isDarkMode ? 'rgba(99, 102, 241, 0.5)' : 'rgba(0, 113, 227, 0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px',
                  },
                },
                '& .MuiOutlinedInput-input': {
                  color: isDarkMode ? '#F8FAFC' : undefined,
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                  color: isDarkMode ? '#F8FAFC' : '#1D1D1F',
                  fontWeight: 500,
                  '&.Mui-focused': {
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
                '& .MuiInputLabel-asterisk': {
                  color: '#FF3B30',
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ 
                mt: 3, 
                mb: 2,
                height: 48,
                borderRadius: '12px',
                background: isDarkMode
                  ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  : 'linear-gradient(135deg, #0071E3 0%, #0077ED 100%)',
                boxShadow: isDarkMode
                  ? `0 4px 14px rgba(99, 102, 241, 0.35)`
                  : '0 4px 14px rgba(0, 113, 227, 0.35)',
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                textTransform: 'none',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                '&:hover': {
                  background: isDarkMode
                    ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
                    : 'linear-gradient(135deg, #0077ED 0%, #0071E3 100%)',
                  boxShadow: isDarkMode
                    ? `0 6px 20px rgba(99, 102, 241, 0.45)`
                    : '0 6px 20px rgba(0, 113, 227, 0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
                '&:disabled': {
                  background: isDarkMode
                    ? 'rgba(99, 102, 241, 0.4)'
                    : 'rgba(0, 113, 227, 0.4)',
                  color: 'rgba(255, 255, 255, 0.8)',
                },
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              {isLoading ? 'Anmelden...' : 'Anmelden'}
            </Button>
          </form>

          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mt: 2,
              color: isDarkMode ? 'rgba(248, 250, 252, 0.6)' : 'rgba(60, 60, 67, 0.6)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            Neu hier?{' '}
            <Link 
              href="/register"
              sx={{
                color: theme.palette.primary.main,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Registrieren
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
