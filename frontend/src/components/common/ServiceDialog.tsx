import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  service?: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ServiceDialog({ open, onClose, onSave, service }: ServiceDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: service?.name || '',
    internal_name: service?.internal_name || '',
    unit: service?.unit || 'Stk',
    manufacturer: service?.manufacturer || '',
    service_number: service?.service_number || '',
    ean: service?.ean || '',
    description: service?.description || '',
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {service ? 'Leistung bearbeiten' : 'Leistung erstellen'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="INFORMATIONEN" />
          <Tab label="KALKULATION" />
          <Tab label="HISTORIE" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Linke Spalte: Bild & Grunddaten */}
            <Grid item xs={3}>
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'action.hover',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Noch keine Datei hochgeladen
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                    sx={{ mt: 2 }}
                    size="small"
                  >
                    Hochladen
                  </Button>
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Leistungsname"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                size="small"
                required
              />
              <TextField
                fullWidth
                label="Interner Name"
                value={formData.internal_name}
                onChange={(e) => setFormData({ ...formData, internal_name: e.target.value })}
                margin="normal"
                size="small"
              />
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel>Einheit</InputLabel>
                <Select
                  value={formData.unit}
                  label="Einheit"
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <MenuItem value="Stk">Stk</MenuItem>
                  <MenuItem value="h">h</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Hersteller"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Leistungsnummer"
                value={formData.service_number}
                onChange={(e) => setFormData({ ...formData, service_number: e.target.value })}
                margin="normal"
                size="small"
                InputProps={{
                  readOnly: true,
                }}
              />
              <TextField
                fullWidth
                label="EAN"
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                margin="normal"
                size="small"
              />
            </Grid>

            {/* Rechte Spalte: Beschreibung (Rich Text Editor) */}
            <Grid item xs={9}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Beschreibung
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={20}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Beschreibung eingeben..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'Arial',
                    fontSize: '15px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {/* Material Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Material
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Artikelname</TableCell>
                      <TableCell>Menge</TableCell>
                      <TableCell>Einheit</TableCell>
                      <TableCell>EK/Einheit</TableCell>
                      <TableCell>LP/Einheit</TableCell>
                      <TableCell>VK</TableCell>
                      <TableCell>Aufschlag %</TableCell>
                      <TableCell>VK/Einheit</TableCell>
                      <TableCell>VK Netto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => {}}
                          sx={{ color: 'primary.main' }}
                        >
                          + Hinzufügen
                        </Link>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Lohn / Maschinenkosten Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Lohn / Maschinenkosten
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lohngruppe</TableCell>
                      <TableCell>Beschreibung</TableCell>
                      <TableCell>Minuten</TableCell>
                      <TableCell>in Stunden</TableCell>
                      <TableCell>EK/Einheit</TableCell>
                      <TableCell>Aufschlag %</TableCell>
                      <TableCell>VK/Einheit</TableCell>
                      <TableCell>VK Netto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={8}>
                        <Link
                          component="button"
                          variant="body2"
                          onClick={() => {}}
                          sx={{ color: 'primary.main' }}
                        >
                          + Hinzufügen
                        </Link>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Netto Section */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Netto
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell>EK</TableCell>
                      <TableCell>Aufschlag %</TableCell>
                      <TableCell>VK Netto</TableCell>
                      <TableCell>VK Netto neu</TableCell>
                      <TableCell>Aufschlag % neu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lohn / Maschinenkosten</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                      <TableCell>0,00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Gesamtsumme</strong></TableCell>
                      <TableCell><strong>0,00</strong></TableCell>
                      <TableCell><strong>0,00</strong></TableCell>
                      <TableCell><strong>0,00</strong></TableCell>
                      <TableCell><strong>0,00</strong></TableCell>
                      <TableCell><strong>0,00</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Gesamt Section */}
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Gesamt
              </Typography>
              <TextField
                fullWidth
                label="VK Neu Netto"
                type="number"
                value={0}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="MwSt. %"
                type="number"
                value={19.00}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Gesamt VK (Brutto)"
                type="number"
                value={0}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Zeitpunkt</TableCell>
                  <TableCell>Feld</TableCell>
                  <TableCell>Geändert von</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Alter Wert</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Keine Historie verfügbar
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Abbrechen</Button>
        {service && <Button variant="outlined">Kopieren</Button>}
        <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

