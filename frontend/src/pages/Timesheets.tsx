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

export default function Timesheets() {
  return (
    <Box sx={{ p: 3, maxWidth: 1280, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 3 }}>
        Zeiterfassung
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 2.5, alignItems: 'stretch' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 0 }}>
                Diese Woche
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                0 Std.
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
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 0 }}>
                Diesen Monat
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                0 Std.
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
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 0 }}>
                Abrechenbar
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                0 Std.
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
              height: '100%',
            }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 0 }}>
                Umsatz
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#AF52DE' }}>
                0,00 €
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
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
          Zeit erfassen
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
          mt: 0.5,
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Projekt</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Beschreibung</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ende</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stunden</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Abrechenbar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  Keine Zeiteinträge vorhanden.
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

