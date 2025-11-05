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
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ArticleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  article?: any;
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
      id={`article-tabpanel-${index}`}
      aria-labelledby={`article-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ArticleDialog({ open, onClose, onSave, article }: ArticleDialogProps) {
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: article?.name || '',
    article_number: article?.article_number || '',
    unit: article?.unit || 'Stk',
    ean: article?.ean || '',
    supplier: article?.supplier || '',
    manufacturer: article?.manufacturer || '',
    manufacturer_number: article?.manufacturer_number || '',
    category: article?.category || '',
    matchcode: article?.matchcode || '',
    cost_center: article?.cost_center || '',
    supplier_number: article?.supplier_number || '',
    manufacturer_type: article?.manufacturer_type || '',
    quantity_scale: article?.quantity_scale || '',
    price_unit: article?.price_unit || '',
    stock: article?.stock || '',
    min_order_quantity: article?.min_order_quantity || '',
    delivery_time: article?.delivery_time || '',
    description: article?.description || '',
    purchase_price: article?.purchase_price || 0,
    list_price: article?.list_price || 0,
    vat_rate: article?.vat_rate || 19.00,
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {article ? 'Artikel bearbeiten' : 'Artikel erstellen'}
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
            {/* Linke Spalte: Bild & Zusatzfelder */}
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
                label="Hersteller"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Mindestbestellmenge"
                value={formData.min_order_quantity}
                onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                margin="normal"
                size="small"
              />
              <TextField
                fullWidth
                label="Lieferzeit"
                value={formData.delivery_time}
                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                margin="normal"
                size="small"
              />
            </Grid>

            {/* Mittlere Spalte: Artikelstammdaten */}
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Artikelname"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Artikelnummer"
                value={formData.article_number}
                onChange={(e) => setFormData({ ...formData, article_number: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Einheit</InputLabel>
                <Select
                  value={formData.unit}
                  label="Einheit"
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <MenuItem value="Stk">Stk</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="m²">m²</MenuItem>
                  <MenuItem value="m³">m³</MenuItem>
                  <MenuItem value="kg">kg</MenuItem>
                  <MenuItem value="h">h</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="EAN"
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Lieferant</InputLabel>
                <Select
                  value={formData.supplier}
                  label="Lieferant"
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  <MenuItem value="">Bitte auswählen</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Hersteller-Nr."
                value={formData.manufacturer_number}
                onChange={(e) => setFormData({ ...formData, manufacturer_number: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Kategorie"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Matchcode"
                value={formData.matchcode}
                onChange={(e) => setFormData({ ...formData, matchcode: e.target.value })}
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Kostenstelle</InputLabel>
                <Select
                  value={formData.cost_center}
                  label="Kostenstelle"
                  onChange={(e) => setFormData({ ...formData, cost_center: e.target.value })}
                >
                  <MenuItem value="">Bitte auswählen</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Lieferanten-Nr."
                value={formData.supplier_number}
                onChange={(e) => setFormData({ ...formData, supplier_number: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Hersteller-Typ-Bezeichnung"
                value={formData.manufacturer_type}
                onChange={(e) => setFormData({ ...formData, manufacturer_type: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Mengenstaffel"
                value={formData.quantity_scale}
                onChange={(e) => setFormData({ ...formData, quantity_scale: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Preiseinheit"
                value={formData.price_unit}
                onChange={(e) => setFormData({ ...formData, price_unit: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Lagerbestand"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                margin="normal"
              />
            </Grid>

            {/* Rechte Spalte: Beschreibung (Rich Text Editor) */}
            <Grid item xs={4}>
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
            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Preis pro Mengeneinheit
              </Typography>
              <TextField
                fullWidth
                label="Einkaufspreis"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Listenpreis"
                type="number"
                value={formData.list_price}
                onChange={(e) => setFormData({ ...formData, list_price: parseFloat(e.target.value) || 0 })}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">€</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="MwSt."
                type="number"
                value={formData.vat_rate}
                onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 19.00 })}
                margin="normal"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Verkaufspreise
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>VK Name</TableCell>
                      <TableCell>VK/Einheit</TableCell>
                      <TableCell>Standard VK</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Verkaufspreis (+30,00%)</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={0}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">€</InputAdornment>,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <input type="checkbox" defaultChecked />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary">
            Historie wird hier angezeigt...
          </Typography>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Abbrechen</Button>
        {article && <Button variant="outlined">Speichern und neu</Button>}
        <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

