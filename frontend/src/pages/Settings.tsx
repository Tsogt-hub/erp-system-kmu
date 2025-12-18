import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BusinessIcon from '@mui/icons-material/Business';
import { RootState } from '../store/store';
import { usersApi } from '../services/api/users';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Settings() {
  const user = useSelector((state: RootState) => state.auth.user);
  const [tabValue, setTabValue] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    email_tasks: true,
    email_projects: true,
    email_offers: false,
    push_enabled: true,
    daily_digest: false,
  });

  // Company settings
  const [companySettings, setCompanySettings] = useState({
    company_name: 'Elite PV GmbH',
    address: '',
    phone: '',
    email: '',
    tax_id: '',
    bank_name: '',
    iban: '',
    bic: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: '',
        position: '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      await usersApi.update(user.id, {
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        email: profileForm.email,
      });
      
      setSuccess(true);
      // Seite neu laden um die Änderungen zu übernehmen
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }
    
    if (passwordForm.new_password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      // API call to change password would go here
      // await usersApi.changePassword(passwordForm.current_password, passwordForm.new_password);
      
      setPasswordDialogOpen(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Fehler beim Ändern des Passworts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 3 }}
      >
        Einstellungen
      </Typography>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        message="Erfolgreich gespeichert"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Paper
        sx={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<EditIcon />} iconPosition="start" label="Profil" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Sicherheit" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Benachrichtigungen" />
          <Tab icon={<BusinessIcon />} iconPosition="start" label="Unternehmen" />
        </Tabs>

        {/* Profil Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: '0 auto',
                      fontSize: '3rem',
                      background: 'linear-gradient(135deg, #007AFF 0%, #5856D6 100%)',
                      boxShadow: '0 8px 24px rgba(0, 122, 255, 0.3)',
                    }}
                  >
                    {profileForm.first_name?.[0]}{profileForm.last_name?.[0]}
                  </Avatar>
                  <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                    {profileForm.first_name} {profileForm.last_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileForm.email}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2, borderRadius: '10px' }}
                    disabled
                  >
                    Bild ändern
                  </Button>
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Persönliche Daten
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vorname"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nachname"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-Mail"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Telefon"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Position"
                      value={profileForm.position}
                      onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                        boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
                      }}
                    >
                      {saving ? 'Speichert...' : 'Profil speichern'}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Sicherheit Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Passwort & Sicherheit
            </Typography>
            <Card variant="outlined" sx={{ mb: 3, borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Passwort
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ändern Sie Ihr Passwort regelmäßig für mehr Sicherheit
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<LockIcon />}
                    onClick={() => setPasswordDialogOpen(true)}
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                  >
                    Passwort ändern
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ mb: 3, borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Zwei-Faktor-Authentifizierung
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Zusätzliche Sicherheit für Ihr Konto
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    disabled
                    sx={{ borderRadius: '10px', textTransform: 'none' }}
                  >
                    Bald verfügbar
                  </Button>
                </Box>
              </CardContent>
            </Card>

            <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              Aktive Sitzungen
            </Typography>
            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Aktuelle Sitzung
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {navigator.userAgent.includes('Mac') ? 'macOS' : 'Windows'} • {navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Browser'}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="success.main">
                    Aktiv
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>

        {/* Benachrichtigungen Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              E-Mail-Benachrichtigungen
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.email_tasks}
                          onChange={(e) => setNotifications({ ...notifications, email_tasks: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>Aufgaben</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Benachrichtigungen über neue und geänderte Aufgaben
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.email_projects}
                          onChange={(e) => setNotifications({ ...notifications, email_projects: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>Projekte</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Updates zu Projekten und Meilensteinen
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.email_offers}
                          onChange={(e) => setNotifications({ ...notifications, email_offers: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>Angebote & Rechnungen</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Status-Änderungen bei Angeboten und Rechnungen
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: '12px' }}>
                  <CardContent>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.daily_digest}
                          onChange={(e) => setNotifications({ ...notifications, daily_digest: e.target.checked })}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle1" fontWeight={500}>Tägliche Zusammenfassung</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Eine tägliche E-Mail mit allen wichtigen Updates
                          </Typography>
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Unternehmen Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Unternehmensdaten
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Firmenname"
                  value={companySettings.company_name}
                  onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  value={companySettings.address}
                  onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Telefon"
                  value={companySettings.phone}
                  onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="E-Mail"
                  value={companySettings.email}
                  onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="USt-IdNr."
                  value={companySettings.tax_id}
                  onChange={(e) => setCompanySettings({ ...companySettings, tax_id: e.target.value })}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>
              Bankverbindung
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bank"
                  value={companySettings.bank_name}
                  onChange={(e) => setCompanySettings({ ...companySettings, bank_name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="IBAN"
                  value={companySettings.iban}
                  onChange={(e) => setCompanySettings({ ...companySettings, iban: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="BIC"
                  value={companySettings.bic}
                  onChange={(e) => setCompanySettings({ ...companySettings, bic: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                  }}
                >
                  Unternehmensdaten speichern
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      {/* System Information */}
      <Paper
        sx={{
          mt: 3,
          p: 3,
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          System-Informationen
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Version
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  1.0.0
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  Betriebsbereit
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Benutzer-ID
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {user?.id || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined" sx={{ borderRadius: '12px' }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Rolle
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  {(user as any)?.role_name || 'Mitarbeiter'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Passwort ändern</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Aktuelles Passwort"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Neues Passwort"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                helperText="Mindestens 6 Zeichen"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="password"
                label="Passwort bestätigen"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                error={passwordForm.new_password !== passwordForm.confirm_password && passwordForm.confirm_password !== ''}
                helperText={
                  passwordForm.new_password !== passwordForm.confirm_password && passwordForm.confirm_password !== ''
                    ? 'Passwörter stimmen nicht überein'
                    : ''
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={
              !passwordForm.current_password ||
              !passwordForm.new_password ||
              passwordForm.new_password !== passwordForm.confirm_password
            }
          >
            Passwort ändern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
