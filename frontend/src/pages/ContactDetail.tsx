import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SourceIcon from '@mui/icons-material/Source';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LanguageIcon from '@mui/icons-material/Language';
import CakeIcon from '@mui/icons-material/Cake';
import { crmApi, Contact, CreateContactData, LEAD_SOURCES, REACHABILITY_OPTIONS, SALUTATION_OPTIONS } from '../services/api/crm';
import { format } from 'date-fns';
import LogbookPanel from '../components/common/LogbookPanel';
import ReminderPanel from '../components/common/ReminderPanel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<CreateContactData & { category?: string }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'Deutschland',
    category: 'contact',
    availability: '',
    notes: '',
    salutation: '',
    lead_source: '',
    website: '',
    fax: '',
    birthday: '',
    additional_salutation: '',
  });

  useEffect(() => {
    if (id) {
      loadContact();
    }
  }, [id]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const data = await crmApi.getContactById(parseInt(id!));
      setContact(data);
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        address: data.address || '',
        postal_code: data.postal_code || '',
        city: data.city || '',
        country: data.country || 'Deutschland',
        company_id: data.company_id,
        category: data.category || 'contact',
        availability: data.availability || '',
        notes: data.notes || '',
        salutation: data.salutation || '',
        lead_source: data.lead_source || '',
        website: data.website || '',
        fax: data.fax || '',
        birthday: data.birthday || '',
        additional_salutation: data.additional_salutation || '',
      });
    } catch (error) {
      console.error('Error loading contact:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!contact) return;
    try {
      await crmApi.updateContact(contact.id, editForm);
      setEditDialogOpen(false);
      loadContact();
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Fehler beim Aktualisieren des Kontakts');
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'customer':
        return 'success';
      case 'supplier':
        return 'warning';
      case 'partner':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'customer':
        return 'Kunde';
      case 'supplier':
        return 'Lieferant';
      case 'partner':
        return 'Partner';
      case 'contact':
        return 'Ansprechpartner';
      default:
        return 'Kontakt';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/crm')}>
          Zurück
        </Button>
        <Typography sx={{ mt: 2 }}>Kontakt nicht gefunden</Typography>
      </Box>
    );
  }

  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unbekannt';
  const fullAddress = [contact.address, contact.postal_code, contact.city].filter(Boolean).join(', ');

  return (
    <Box>
      {/* Back Button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/crm')}>
          Zurück
        </Button>
      </Box>

      {/* Contact Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
              }}
            >
              {fullName.charAt(0).toUpperCase()}
            </Box>
            <Box>
              <Typography variant="h4" gutterBottom>
                {fullName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip
                  label={getCategoryLabel(contact.category)}
                  color={getCategoryColor(contact.category) as any}
                  size="small"
                />
                {contact.customer_number && (
                  <Chip
                    label={`#${contact.customer_number}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {contact.is_archived && (
                  <Chip label="Archiviert" color="warning" size="small" />
                )}
              </Box>
            </Box>
          </Box>
          <IconButton onClick={() => setEditDialogOpen(true)} color="primary">
            <EditIcon />
          </IconButton>
        </Box>

        {/* Quick Info */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {contact.email && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      E-Mail
                    </Typography>
                    <Typography variant="body1">
                      <a href={`mailto:${contact.email}`}>{contact.email}</a>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {contact.phone && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Telefon
                    </Typography>
                    <Typography variant="body1">
                      <a href={`tel:${contact.phone}`}>{contact.phone}</a>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {fullAddress && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOnIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Adresse
                    </Typography>
                    <Typography variant="body1">{fullAddress}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {contact.company_name && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Unternehmen
                    </Typography>
                    <Typography variant="body1">{contact.company_name}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {contact.lead_source && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ bgcolor: 'primary.50' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SourceIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Lead-Quelle
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>{contact.lead_source}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {contact.availability && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTimeIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Erreichbarkeit
                    </Typography>
                    <Typography variant="body1">{contact.availability}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
          {contact.website && (
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined">
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LanguageIcon color="action" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Website
                    </Typography>
                    <Typography variant="body1">
                      <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer">
                        {contact.website}
                      </a>
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper>
        <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)}>
          <Tab label="Logbuch" />
          <Tab label="Details" />
          <Tab label="Projekte" />
          <Tab label="Dokumente" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <ReminderPanel
            entityType="contact"
            entityId={parseInt(id!)}
            title="Wiedervorlagen"
          />
          <LogbookPanel
            entityType="contact"
            entityId={parseInt(id!)}
            title="Kontakt-Historie"
            maxHeight={500}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Persönliche Daten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Anrede
                </Typography>
                <Typography variant="body1">{contact.salutation || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Vorname
                </Typography>
                <Typography variant="body1">{contact.first_name || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nachname
                </Typography>
                <Typography variant="body1">{contact.last_name || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Position / Funktion
                </Typography>
                <Typography variant="body1">{contact.position || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Geburtstag
                </Typography>
                <Typography variant="body1">
                  {contact.birthday ? format(new Date(contact.birthday), 'dd.MM.yyyy') : '-'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Kontaktdaten
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  E-Mail
                </Typography>
                <Typography variant="body1">{contact.email || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Telefon
                </Typography>
                <Typography variant="body1">{contact.phone || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Mobil
                </Typography>
                <Typography variant="body1">{contact.mobile || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Fax
                </Typography>
                <Typography variant="body1">{contact.fax || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Website
                </Typography>
                <Typography variant="body1">
                  {contact.website ? (
                    <a href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer">
                      {contact.website}
                    </a>
                  ) : '-'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Erreichbarkeit
                </Typography>
                <Typography variant="body1">{contact.availability || '-'}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Adresse
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Straße
                </Typography>
                <Typography variant="body1">{contact.address || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  PLZ / Stadt
                </Typography>
                <Typography variant="body1">
                  {[contact.postal_code, contact.city].filter(Boolean).join(' ') || '-'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Land
                </Typography>
                <Typography variant="body1">{contact.country || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Unternehmen
                </Typography>
                <Typography variant="body1">{contact.company_name || '-'}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                Lead-Informationen
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Lead-Quelle
                </Typography>
                <Typography variant="body1" fontWeight={contact.lead_source ? 500 : 400}>
                  {contact.lead_source || '-'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kundennummer
                </Typography>
                <Typography variant="body1">{contact.customer_number || '-'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Kategorie
                </Typography>
                <Typography variant="body1">{getCategoryLabel(contact.category)}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Erstellt am
                </Typography>
                <Typography variant="body1">
                  {contact.created_at ? format(new Date(contact.created_at), 'dd.MM.yyyy HH:mm') : '-'}
                </Typography>
              </Box>
            </Grid>

            {contact.notes && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Notizen
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {contact.notes}
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography color="text.secondary">
            Verknüpfte Projekte werden hier angezeigt.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography color="text.secondary">
            Verknüpfte Dokumente werden hier angezeigt.
          </Typography>
        </TabPanel>
      </Paper>

      {/* Edit Dialog - Hero-Style mit allen Feldern */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)', pb: 2 }}>
          Kontakt bearbeiten
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {/* Persönliche Daten */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Persönliche Daten
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Anrede</InputLabel>
                <Select
                  value={editForm.salutation || ''}
                  label="Anrede"
                  onChange={(e) => setEditForm({ ...editForm, salutation: e.target.value })}
                >
                  <MenuItem value="">Keine Angabe</MenuItem>
                  {SALUTATION_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Vorname *"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Nachname *"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Position / Funktion"
                value={editForm.position || ''}
                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Geburtstag"
                type="date"
                value={editForm.birthday || ''}
                onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Kontaktdaten */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Kontaktdaten
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="E-Mail"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Website"
                value={editForm.website || ''}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Telefon"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Mobil"
                value={editForm.mobile || ''}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Fax"
                value={editForm.fax || ''}
                onChange={(e) => setEditForm({ ...editForm, fax: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Adresse */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Adresse
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Straße und Hausnummer"
                value={editForm.address || ''}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                label="PLZ"
                value={editForm.postal_code || ''}
                onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                size="small"
                label="Stadt"
                value={editForm.city || ''}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label="Land"
                value={editForm.country || 'Deutschland'}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Lead-Informationen */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Lead-Informationen
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Lead-Quelle</InputLabel>
                <Select
                  value={editForm.lead_source || ''}
                  label="Lead-Quelle"
                  onChange={(e) => setEditForm({ ...editForm, lead_source: e.target.value })}
                >
                  <MenuItem value="">Keine Angabe</MenuItem>
                  {LEAD_SOURCES.map(source => (
                    <MenuItem key={source} value={source}>{source}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Erreichbarkeit</InputLabel>
                <Select
                  value={editForm.availability || ''}
                  label="Erreichbarkeit"
                  onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                >
                  <MenuItem value="">Keine Angabe</MenuItem>
                  {REACHABILITY_OPTIONS.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={editForm.category || 'contact'}
                  label="Kategorie"
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                >
                  <MenuItem value="contact">Ansprechpartner</MenuItem>
                  <MenuItem value="customer">Kunde</MenuItem>
                  <MenuItem value="supplier">Lieferant</MenuItem>
                  <MenuItem value="partner">Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Kundennummer"
                value={editForm.customer_number || ''}
                onChange={(e) => setEditForm({ ...editForm, customer_number: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Notizen */}
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'primary.main', fontWeight: 600 }}>
            Notizen
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Notizen"
            multiline
            rows={3}
            value={editForm.notes || ''}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid rgba(0,0,0,0.1)', p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleEditSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

