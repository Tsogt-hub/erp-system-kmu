import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Avatar, 
  Chip,
  Dialog,
  InputBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import NotificationBell from './NotificationBell';

// Page titles mapping
const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Aufgaben',
  '/calendar': 'Kalender',
  '/time-tracking': 'Arbeitszeiten',
  '/timesheets': 'Zeiterfassung',
  '/sales': 'Verkauf',
  '/planning/scheduler': 'Plantafel',
  '/crm': 'CRM',
  '/projects': 'Projekte',
  '/offers': 'Angebote',
  '/invoices': 'Rechnungen',
  '/sales-orders': 'Verkaufsaufträge',
  '/purchase-orders': 'Einkaufsbestellungen',
  '/inventory': 'Lagerartikel',
  '/inventory/incoming': 'Einbuchungen',
  '/inventory/outgoing': 'Ausbuchungen',
  '/inventory/log': 'Lagerbuch',
  '/assets': 'Anlagenverwaltung',
  '/users': 'Benutzer',
  '/settings': 'Einstellungen',
  '/governance/data-quality': 'Data Quality',
  '/governance/audit-logs': 'Audit Logs',
};

// Spotlight search items
const spotlightItems = [
  { text: 'Dashboard', path: '/', icon: <HomeOutlinedIcon />, category: 'Seiten' },
  { text: 'Aufgaben', path: '/tasks', icon: <CheckCircleOutlineIcon />, category: 'Seiten' },
  { text: 'Kalender', path: '/calendar', icon: <CalendarMonthOutlinedIcon />, category: 'Seiten' },
  { text: 'CRM / Kontakte', path: '/crm?tab=contacts', icon: <PeopleAltOutlinedIcon />, category: 'Seiten' },
  { text: 'Projekte', path: '/projects', icon: <AccountTreeOutlinedIcon />, category: 'Seiten' },
  { text: 'Angebote', path: '/offers', icon: <DescriptionOutlinedIcon />, category: 'Seiten' },
  { text: 'Einstellungen', path: '/settings', icon: <SettingsOutlinedIcon />, category: 'Seiten' },
];

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  // Get page title
  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  // Filter spotlight items
  const filteredItems = spotlightItems.filter(item =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSpotlightSelect = (path: string) => {
    navigate(path);
    setSpotlightOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          mb: 3,
          // macOS Tahoe Glass Effect - Enhanced
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.72) 100%)',
          backdropFilter: 'blur(80px) saturate(200%)',
          WebkitBackdropFilter: 'blur(80px) saturate(200%)',
          color: 'rgba(29, 29, 31, 0.95)',
          border: '0.5px solid rgba(255, 255, 255, 0.6)',
          borderRadius: '16px',
          boxShadow: `
            0 0.5px 0 rgba(255, 255, 255, 0.8) inset,
            0 1px 2px rgba(0, 0, 0, 0.02),
            0 4px 8px rgba(0, 0, 0, 0.03),
            0 8px 16px rgba(0, 0, 0, 0.04)
          `,
        }}
      >
        <Toolbar sx={{ minHeight: '52px !important', px: 2 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 650,
              fontSize: '1.0625rem',
              letterSpacing: '-0.02em',
              color: 'rgba(29, 29, 31, 0.92)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            {pageTitle}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {/* Spotlight Search Button */}
            <IconButton
              size="small"
              onClick={() => setSpotlightOpen(true)}
              sx={{
                width: 34,
                height: 34,
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), inset 0 0.5px 0 rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  transform: 'scale(1.05)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08), inset 0 0.5px 0 rgba(255, 255, 255, 0.9)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <SearchRoundedIcon sx={{ color: 'rgba(60, 60, 67, 0.7)', fontSize: '1.05rem' }} />
            </IconButton>

            {/* Notification Bell */}
            <Box sx={{ 
              '& button': {
                width: 34,
                height: 34,
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(0, 0, 0, 0.06)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), inset 0 0.5px 0 rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%)',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
              }
            }}>
              <NotificationBell />
            </Box>

            {/* User Info Chip - macOS Style */}
            <Chip
              avatar={
                <Avatar 
                  sx={{ 
                    width: 26,
                    height: 26,
                    background: 'linear-gradient(135deg, #0071E3 0%, #5AC8FA 100%)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                    boxShadow: '0 1px 4px rgba(0, 113, 227, 0.3)',
                  }}
                >
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </Avatar>
              }
              label={`${user?.first_name} ${user?.last_name}`}
              sx={{
                height: 34,
                pl: 0.25,
                pr: 1,
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(0, 0, 0, 0.06)',
                fontWeight: 500,
                fontSize: '0.8rem',
                letterSpacing: '-0.01em',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                color: 'rgba(29, 29, 31, 0.85)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), inset 0 0.5px 0 rgba(255, 255, 255, 0.8)',
                '& .MuiChip-label': {
                  px: 0.75,
                },
                '&:hover': {
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.85) 100%)',
                },
                transition: 'all 0.2s ease',
              }}
            />

            {/* Logout Button */}
            <IconButton 
              onClick={handleLogout}
              size="small"
              sx={{
                width: 34,
                height: 34,
                background: 'linear-gradient(180deg, rgba(255, 59, 48, 0.08) 0%, rgba(255, 59, 48, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '0.5px solid rgba(255, 59, 48, 0.12)',
                color: '#FF3B30',
                boxShadow: '0 1px 3px rgba(255, 59, 48, 0.08), inset 0 0.5px 0 rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  background: 'linear-gradient(180deg, rgba(255, 59, 48, 0.15) 0%, rgba(255, 59, 48, 0.10) 100%)',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: '1.05rem' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spotlight Search Dialog */}
      <Dialog
        open={spotlightOpen}
        onClose={() => { setSpotlightOpen(false); setSearchQuery(''); }}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={150}
        sx={{
          '& .MuiDialog-paper': {
            mt: '15vh',
            mx: 'auto',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(251, 251, 253, 0.92) 100%)',
            backdropFilter: 'blur(80px) saturate(200%)',
            WebkitBackdropFilter: 'blur(80px) saturate(200%)',
            borderRadius: '16px',
            border: '0.5px solid rgba(255, 255, 255, 0.6)',
            boxShadow: `
              0 24px 80px rgba(0, 0, 0, 0.2),
              0 8px 32px rgba(0, 0, 0, 0.12),
              inset 0 0.5px 0 rgba(255, 255, 255, 0.8)
            `,
            overflow: 'hidden',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
          },
        }}
      >
        {/* Spotlight Search Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2.5,
            py: 1.75,
            borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%)',
          }}
        >
          <SearchRoundedIcon 
            sx={{ 
              color: 'rgba(60, 60, 67, 0.5)', 
              fontSize: '1.35rem',
              mr: 1.5,
            }} 
          />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              fontSize: '1.125rem',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              color: 'rgba(29, 29, 31, 0.9)',
              '& input::placeholder': {
                color: 'rgba(60, 60, 67, 0.4)',
                opacity: 1,
              },
            }}
          />
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'rgba(60, 60, 67, 0.4)',
              px: 1,
              py: 0.25,
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.04)',
              border: '0.5px solid rgba(0, 0, 0, 0.06)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            ESC
          </Typography>
        </Box>

        {/* Spotlight Results */}
        <List sx={{ py: 1, maxHeight: '50vh', overflow: 'auto' }}>
          {filteredItems.length > 0 ? (
            <>
              <Typography
                sx={{
                  px: 2.5,
                  py: 0.75,
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(60, 60, 67, 0.5)',
                  textTransform: 'uppercase',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
              >
                Seiten
              </Typography>
              {filteredItems.map((item, index) => (
                <ListItem
                  key={index}
                  button
                  onClick={() => handleSpotlightSelect(item.path)}
                  sx={{
                    mx: 1,
                    borderRadius: '10px',
                    py: 1,
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.05) 100%)',
                    },
                    transition: 'background 0.15s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 36,
                      color: 'rgba(0, 122, 255, 0.8)',
                      '& .MuiSvgIcon-root': {
                        fontSize: '1.15rem',
                      },
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                        color: 'rgba(29, 29, 31, 0.9)',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </>
          ) : (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography
                sx={{
                  fontSize: '0.9375rem',
                  color: 'rgba(60, 60, 67, 0.5)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                }}
              >
                Keine Ergebnisse gefunden
              </Typography>
            </Box>
          )}
        </List>
      </Dialog>
    </>
  );
}
