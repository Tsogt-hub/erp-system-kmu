import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
} from '@mui/icons-material';

export default function Assets() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'in_use': return 'primary';
      case 'maintenance': return 'warning';
      case 'disposed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 3 }}>
        Anlagenverwaltung
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gesamtwert
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                0,00 €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Verfügbar
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                In Verwendung
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Wartung fällig
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          }}
        >
          Neue Anlage
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Anlagennummer</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kategorie</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kaufdatum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kaufpreis</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Aktueller Wert</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Zugewiesen an</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  Keine Anlagen vorhanden.
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

