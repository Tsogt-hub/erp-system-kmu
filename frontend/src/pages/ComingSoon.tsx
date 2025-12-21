import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import ConstructionIcon from '@mui/icons-material/Construction';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ComingSoon() {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageName = () => {
    const path = location.pathname;
    const pageNames: Record<string, string> = {
      '/articles': 'Artikel',
      '/services': 'Leistungen',
      '/sales-prices': 'Verkaufspreise',
      '/inventory/incoming': 'Einbuchungen',
      '/inventory/outgoing': 'Ausbuchungen',
      '/inventory/log': 'Lagerbuch',
    };
    return pageNames[path] || 'Diese Seite';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        sx={{
          p: 6,
          textAlign: 'center',
          maxWidth: 500,
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        }}
      >
        <ConstructionIcon
          sx={{
            fontSize: 80,
            color: '#FF9500',
            mb: 3,
          }}
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(135deg, #FF9500 0%, #FF3B30 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {getPageName()}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Diese Funktion wird derzeit entwickelt und ist bald verfügbar.
        </Typography>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0051D5 0%, #003DA5 100%)',
            },
          }}
        >
          Zurück
        </Button>
      </Paper>
    </Box>
  );
}









