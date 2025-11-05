import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { RootState } from '../store/store';

export default function Settings() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Einstellungen
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profil
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TextField
              fullWidth
              label="Vorname"
              value={user?.first_name || ''}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Nachname"
              value={user?.last_name || ''}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="E-Mail"
              value={user?.email || ''}
              margin="normal"
              disabled
            />
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              sx={{ mt: 2 }}
              disabled
            >
              Profil aktualisieren (bald verfügbar)
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System-Informationen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Elite ERP Version
                </Typography>
                <Typography variant="h6">1.0.0</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="h6" color="success.main">
                  Betriebsbereit
                </Typography>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Benachrichtigungen
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Benachrichtigungseinstellungen werden in einer zukünftigen Version verfügbar sein.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

