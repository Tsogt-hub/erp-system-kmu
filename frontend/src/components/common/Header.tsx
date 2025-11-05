import { AppBar, Toolbar, Typography, IconButton, Box, Avatar, Chip } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NotificationBell from './NotificationBell';

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        mb: 3,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        color: '#000000',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.5) inset',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important' }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 700,
            fontSize: '1.5rem',
            letterSpacing: '-0.022em',
            color: '#000000',
          }}
        >
          Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Search Button */}
          <IconButton
            size="medium"
            sx={{
              background: 'rgba(10, 132, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(10, 132, 255, 0.15)',
              '&:hover': {
                background: 'rgba(10, 132, 255, 0.14)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <SearchRoundedIcon sx={{ color: '#0A84FF' }} />
          </IconButton>

          {/* Notification Bell */}
          <Box sx={{ 
            '& button': {
              background: 'rgba(0, 122, 255, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 122, 255, 0.15)',
              '&:hover': {
                background: 'rgba(0, 122, 255, 0.15)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          }}>
            <NotificationBell />
          </Box>

          {/* User Info Chip */}
          <Chip
            avatar={
              <Avatar 
                sx={{ 
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #0A84FF 0%, #64D2FF 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </Avatar>
            }
            label={`${user?.first_name} ${user?.last_name}`}
            sx={{
              height: 40,
              px: 1,
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              fontWeight: 600,
              fontSize: '0.9375rem',
              letterSpacing: '-0.016em',
              '& .MuiChip-label': {
                px: 1.5,
              },
            }}
          />

          {/* Logout Button */}
          <IconButton 
            onClick={handleLogout}
            size="medium"
            sx={{
              background: 'rgba(255, 59, 48, 0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 59, 48, 0.15)',
              color: '#FF3B30',
              '&:hover': {
                background: 'rgba(255, 59, 48, 0.15)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
