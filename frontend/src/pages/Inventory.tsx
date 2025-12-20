import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import {
  inventoryApi,
  Item,
  InventoryStock,
  InventoryMovement,
  CreateItemData,
  CreateMovementData,
  Warehouse,
  PriceCalculation,
  ITEM_CATEGORIES,
} from '../services/api/inventory';
import { format } from 'date-fns';

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

// Marge-Anzeige
function MarginChip({ purchasePrice, salePrice }: { purchasePrice?: number; salePrice: number }) {
  if (!purchasePrice || purchasePrice === 0) return null;
  const margin = ((salePrice - purchasePrice) / purchasePrice) * 100;
  const color = margin >= 30 ? 'success' : margin >= 20 ? 'warning' : 'error';
  
  return (
    <Tooltip title={`EK: ${purchasePrice.toFixed(2)} € → VK: ${salePrice.toFixed(2)} €`}>
      <Chip
        label={`+${margin.toFixed(0)}%`}
        color={color}
        size="small"
        variant="outlined"
      />
    </Tooltip>
  );
}

export default function Inventory() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = parseInt(searchParams.get('tab') || '0', 10);
  const [tabValue, setTabValue] = useState(initialTab);

  // Update tab from URL parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam !== null) {
      setTabValue(parseInt(tabParam, 10));
    }
  }, [searchParams]);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: Array<{ row: number; error: string }>;
    total: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [services, setServices] = useState<Item[]>([]);
  const [priceCalculations, setPriceCalculations] = useState<PriceCalculation[]>([]);
  const [priceCalcDialogOpen, setPriceCalcDialogOpen] = useState(false);
  const [editingPriceCalc, setEditingPriceCalc] = useState<PriceCalculation | null>(null);
  const [priceCalcForm, setPriceCalcForm] = useState({ name: '', formula: '', margin_percent: 30 });

  const [itemForm, setItemForm] = useState<CreateItemData>({
    name: '',
    sku: '',
    ean: '',
    description: '',
    unit: 'Stk',
    price: 0,
    purchase_price: 0,
    vat_rate: 19,
    category: '',
    subcategory: '',
    manufacturer: '',
    supplier_article_number: '',
    cost_center: '',
    image_url: '',
    is_service: false,
    time_minutes: 0,
    internal_name: '',
  });


  useEffect(() => {
    loadData();
  }, [tabValue]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  // Filter-Logik
  useEffect(() => {
    let result = items;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.sku?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.manufacturer?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter) {
      result = result.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(result);
  }, [items, searchQuery, categoryFilter]);

  const loadWarehouses = async () => {
    try {
      const data = await inventoryApi.getWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        // Artikel (keine Leistungen)
        const data = await inventoryApi.getItems();
        const articles = data.filter((item: Item) => !item.is_service);
        setItems(articles);
        setFilteredItems(articles);
      } else if (tabValue === 1) {
        // Leistungen
        const data = await inventoryApi.getItems();
        const serviceItems = data.filter((item: Item) => item.is_service);
        setServices(serviceItems);
      } else if (tabValue === 2) {
        // Verkaufspreise
        try {
          const data = await inventoryApi.getPriceCalculations();
          setPriceCalculations(data);
        } catch (e) {
          // Falls Endpoint nicht existiert, leere Liste
          setPriceCalculations([]);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetItemForm = (isService: boolean = false) => {
    setItemForm({
      name: '',
      sku: '',
      ean: '',
      description: '',
      unit: 'Stk',
      price: 0,
      purchase_price: 0,
      vat_rate: 19,
      category: '',
      subcategory: '',
      manufacturer: '',
      supplier_article_number: '',
      cost_center: '',
      image_url: '',
      is_service: isService,
      time_minutes: 0,
      internal_name: '',
    });
    setEditingItem(null);
  };

  const handleItemCreate = async () => {
    try {
      if (editingItem) {
        await inventoryApi.updateItem(editingItem.id, itemForm);
      } else {
        await inventoryApi.createItem(itemForm);
      }
      setItemDialogOpen(false);
      resetItemForm();
      loadData();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleItemEdit = (item: Item) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      sku: item.sku || '',
      ean: item.ean || '',
      description: item.description || '',
      unit: item.unit,
      price: item.price,
      purchase_price: item.purchase_price || 0,
      vat_rate: item.vat_rate || 19,
      category: item.category || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      supplier_article_number: item.supplier_article_number || '',
      cost_center: item.cost_center || '',
      image_url: item.image_url || '',
      is_service: item.is_service || false,
      time_minutes: item.time_minutes || 0,
      internal_name: item.internal_name || '',
    });
    setItemDialogOpen(true);
  };


  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      try {
        await inventoryApi.deleteItem(id);
        loadData();
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      alert('Bitte wählen Sie eine CSV-Datei aus');
      return;
    }

    try {
      setImporting(true);
      const result = await inventoryApi.importItems(importFile);
      setImportResult(result.result);
      loadData();

      if (result.result.errors.length > 0) {
        alert(
          `Import abgeschlossen: ${result.result.success} erfolgreich, ${result.result.errors.length} Fehler. Bitte Details prüfen.`
        );
      } else {
        alert(`Import erfolgreich: ${result.result.success} Artikel importiert.`);
        setImportDialogOpen(false);
        setImportFile(null);
        setImportResult(null);
      }
    } catch (error: any) {
      console.error('Error importing items:', error);
      alert(error.message || 'Fehler beim Import');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'Name,SKU,Beschreibung,Einheit,VK-Preis,EK-Preis,Kategorie,Hersteller\n"Longi Solarmodul 470W","PV-LONGI-470","Hochleistungsmodul LR7-54HVBB-470W","Stk","88.25","70.60","module","Longi"\n"SolarEdge Wechselrichter 10kW","WR-SE-10K","Hybrid-Wechselrichter SE10K-RWS48BEN4","Stk","1240.00","800.00","inverter","SolarEdge"';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'artikel-import-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryLabel = (value: string) => {
    return ITEM_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Artikelstamm & Lager
      </Typography>

      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label="Artikel" />
        <Tab label="Leistungen" />
        <Tab label="Verkaufspreise" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {/* Toolbar */}
        <Paper sx={{ p: 2, mb: 2, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#FAFAFA' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Artikel suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Kategorie</InputLabel>
              <Select
                value={categoryFilter}
                label="Kategorie"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">Alle Kategorien</MenuItem>
                {ITEM_CATEGORIES.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate}>
                CSV-Vorlage
              </Button>
              <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => setImportDialogOpen(true)}>
                Importieren
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetItemForm();
                  setItemDialogOpen(true);
                }}
              >
                Neuer Artikel
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Statistik-Karten */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {items.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Artikel gesamt
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {items.filter((i) => i.category === 'module').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Solarmodule
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {items.filter((i) => i.category === 'inverter').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wechselrichter
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {items.filter((i) => i.category === 'storage').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Speicher
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell width={60}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Hersteller</TableCell>
                <TableCell align="right">EK-Preis</TableCell>
                <TableCell align="right">VK-Preis</TableCell>
                <TableCell align="center">Marge</TableCell>
                <TableCell>Einheit</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    Keine Artikel gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      {item.image_url ? (
                        <Avatar src={item.image_url} variant="rounded" sx={{ width: 40, height: 40 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.200' }}>
                          <ImageIcon color="disabled" />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {item.name}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {item.description.substring(0, 60)}
                          {item.description.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.sku || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {item.category && (
                        <Chip label={getCategoryLabel(item.category)} size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{item.manufacturer || '-'}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">
                        {item.purchase_price ? `${item.purchase_price.toFixed(2)} €` : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {item.price.toFixed(2)} €
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <MarginChip purchasePrice={item.purchase_price} salePrice={item.price} />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleItemEdit(item)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Leistungen Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#FAFAFA' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6">Leistungen</Typography>
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetItemForm(true);
                  setItemDialogOpen(true);
                }}
              >
                Neue Leistung
              </Button>
            </Box>
          </Box>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>#</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Beschreibung</TableCell>
                <TableCell>Interner Name</TableCell>
                <TableCell align="right">Zeit (Min.)</TableCell>
                <TableCell align="right">Preis</TableCell>
                <TableCell>MwSt</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Keine Leistungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>{service.sku || service.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {service.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {service.description?.substring(0, 80)}
                        {service.description && service.description.length > 80 ? '...' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{service.internal_name || '-'}</TableCell>
                    <TableCell align="right">{service.time_minutes || 0}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight={500}>
                        {service.price.toFixed(2)} €/{service.unit}
                      </Typography>
                    </TableCell>
                    <TableCell>{service.vat_rate || 19}%</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleItemEdit(service)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(service.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Verkaufspreise Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 2, mb: 2, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#FAFAFA' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="h6">Verkaufspreise</Typography>
            <Box sx={{ ml: 'auto' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setPriceCalcForm({ name: '', formula: '', margin_percent: 30 });
                  setEditingPriceCalc(null);
                  setPriceCalcDialogOpen(true);
                }}
              >
                Neuer Verkaufspreis
              </Button>
            </Box>
          </Box>
        </Paper>

        <Alert severity="info" sx={{ mb: 2 }}>
          Verkaufspreise definieren Formeln zur automatischen Berechnung des VK-Preises aus dem EK-Preis.
          Beispiel: "Einkaufspreis + 30%" bedeutet, dass der VK-Preis automatisch 30% über dem EK-Preis liegt.
        </Alert>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>Name</TableCell>
                <TableCell>Formel</TableCell>
                <TableCell align="right">Marge %</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : priceCalculations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Keine Verkaufspreise definiert. Erstellen Sie einen Verkaufspreis um automatische Preisberechnung zu nutzen.
                  </TableCell>
                </TableRow>
              ) : (
                priceCalculations.map((calc) => (
                  <TableRow key={calc.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {calc.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={calc.formula} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      {calc.margin_percent ? `+${calc.margin_percent}%` : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingPriceCalc(calc);
                          setPriceCalcForm({
                            name: calc.name,
                            formula: calc.formula,
                            margin_percent: calc.margin_percent || 0,
                          });
                          setPriceCalcDialogOpen(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={async () => {
                          if (window.confirm('Möchten Sie diesen Verkaufspreis wirklich löschen?')) {
                            try {
                              await inventoryApi.deletePriceCalculation(calc.id);
                              loadData();
                            } catch (error) {
                              console.error('Error deleting price calculation:', error);
                            }
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>


      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem 
            ? (itemForm.is_service ? 'Leistung bearbeiten' : 'Artikel bearbeiten') 
            : (itemForm.is_service ? 'Neue Leistung erstellen' : 'Neuen Artikel erstellen')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basis-Informationen */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Name"
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Artikelnummer / SKU"
                value={itemForm.sku}
                onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
              />
            </Grid>
            
            {/* Leistungs-spezifische Felder */}
            {itemForm.is_service && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Interner Name"
                    value={itemForm.internal_name}
                    onChange={(e) => setItemForm({ ...itemForm, internal_name: e.target.value })}
                    helperText="Suchbegriff/Alias für interne Suche"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Zeitaufwand (Minuten)"
                    value={itemForm.time_minutes}
                    onChange={(e) => setItemForm({ ...itemForm, time_minutes: parseInt(e.target.value) || 0 })}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">Min.</InputAdornment>,
                    }}
                  />
                </Grid>
              </>
            )}
            
            {/* Nur für Artikel: EAN */}
            {!itemForm.is_service && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="EAN (Barcode)"
                  value={itemForm.ean}
                  onChange={(e) => setItemForm({ ...itemForm, ean: e.target.value })}
                  placeholder="4260123456789"
                />
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={itemForm.description}
                onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            
            {/* Kategorie und Hersteller */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Kategorie</InputLabel>
                <Select
                  value={itemForm.category}
                  label="Kategorie"
                  onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                >
                  <MenuItem value="">Keine</MenuItem>
                  {ITEM_CATEGORIES.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Hersteller"
                value={itemForm.manufacturer}
                onChange={(e) => setItemForm({ ...itemForm, manufacturer: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Einheit</InputLabel>
                <Select
                  value={itemForm.unit}
                  label="Einheit"
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                >
                  <MenuItem value="Stk">Stk</MenuItem>
                  <MenuItem value="pauschal">pauschal</MenuItem>
                  <MenuItem value="m">m</MenuItem>
                  <MenuItem value="m²">m²</MenuItem>
                  <MenuItem value="km">km</MenuItem>
                  <MenuItem value="Std">Std</MenuItem>
                  <MenuItem value="Satz">Satz</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Lieferanten-Informationen (nur für Artikel) */}
            {!itemForm.is_service && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lieferanten-Artikelnummer"
                    value={itemForm.supplier_article_number}
                    onChange={(e) => setItemForm({ ...itemForm, supplier_article_number: e.target.value })}
                    placeholder="Bestellnummer beim Lieferanten"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Kostenstelle"
                    value={itemForm.cost_center}
                    onChange={(e) => setItemForm({ ...itemForm, cost_center: e.target.value })}
                  />
                </Grid>
              </>
            )}
            
            {/* Preise */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
                Preise
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="EK-Preis (€)"
                value={itemForm.purchase_price}
                onChange={(e) => setItemForm({ ...itemForm, purchase_price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="VK-Preis (€)"
                value={itemForm.price}
                onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <InputAdornment position="start">€</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>MwSt</InputLabel>
                <Select
                  value={itemForm.vat_rate || 19}
                  label="MwSt"
                  onChange={(e) => setItemForm({ ...itemForm, vat_rate: Number(e.target.value) })}
                >
                  <MenuItem value={0}>0%</MenuItem>
                  <MenuItem value={7}>7%</MenuItem>
                  <MenuItem value={19}>19%</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              {itemForm.purchase_price && itemForm.purchase_price > 0 && itemForm.price > 0 && (
                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Marge
                  </Typography>
                  <Typography variant="body1" fontWeight={500} color={
                    (((itemForm.price - itemForm.purchase_price) / itemForm.purchase_price) * 100) >= 30 
                      ? 'success.main' 
                      : (((itemForm.price - itemForm.purchase_price) / itemForm.purchase_price) * 100) >= 20 
                        ? 'warning.main' 
                        : 'error.main'
                  }>
                    +{(((itemForm.price - itemForm.purchase_price) / itemForm.purchase_price) * 100).toFixed(1)}%
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({(itemForm.price - itemForm.purchase_price).toFixed(2)} €)
                    </Typography>
                  </Typography>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bild-URL"
                value={itemForm.image_url}
                onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                placeholder="https://..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleItemCreate} variant="contained" disabled={!itemForm.name}>
            {editingItem ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>


      {/* Price Calculation Dialog */}
      <Dialog open={priceCalcDialogOpen} onClose={() => setPriceCalcDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPriceCalc ? 'Verkaufspreis bearbeiten' : 'Neuen Verkaufspreis erstellen'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={priceCalcForm.name}
                onChange={(e) => setPriceCalcForm({ ...priceCalcForm, name: e.target.value })}
                placeholder="z.B. Verkaufspreis Standard"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Marge (%)"
                type="number"
                value={priceCalcForm.margin_percent}
                onChange={(e) => {
                  const margin = parseFloat(e.target.value) || 0;
                  setPriceCalcForm({
                    ...priceCalcForm,
                    margin_percent: margin,
                    formula: `Einkaufspreis + ${margin.toFixed(2)}%`,
                  });
                }}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Formel"
                value={priceCalcForm.formula}
                onChange={(e) => setPriceCalcForm({ ...priceCalcForm, formula: e.target.value })}
                placeholder="Einkaufspreis + 30.00%"
                helperText="Die Formel beschreibt, wie der VK-Preis aus dem EK-Preis berechnet wird"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPriceCalcDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={async () => {
              try {
                if (editingPriceCalc) {
                  await inventoryApi.updatePriceCalculation(editingPriceCalc.id, priceCalcForm);
                } else {
                  await inventoryApi.createPriceCalculation(priceCalcForm);
                }
                setPriceCalcDialogOpen(false);
                loadData();
              } catch (error) {
                console.error('Error saving price calculation:', error);
              }
            }}
            variant="contained"
            disabled={!priceCalcForm.name || !priceCalcForm.formula}
          >
            {editingPriceCalc ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog
        open={importDialogOpen}
        onClose={() => {
          setImportDialogOpen(false);
          setImportFile(null);
          setImportResult(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Artikel importieren</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Bitte laden Sie eine CSV-Datei hoch. Die CSV-Datei muss folgende Spalten enthalten:
              <strong> Name, SKU, Beschreibung, Einheit, VK-Preis, EK-Preis, Kategorie, Hersteller</strong>
            </Alert>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadTemplate} sx={{ mb: 2 }}>
              CSV-Vorlage herunterladen
            </Button>
          </Box>

          <Box sx={{ mt: 2, mb: 1 }}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-import-file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImportFile(file);
                  setImportResult(null);
                }
              }}
            />
            <label htmlFor="csv-import-file">
              <Button variant="outlined" component="span" fullWidth>
                CSV-Datei auswählen
              </Button>
            </label>
            {importFile && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Ausgewählt: {importFile.name}
              </Typography>
            )}
          </Box>

          {importing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {importResult && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={importResult.errors.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                Import abgeschlossen: <strong>{importResult.success}</strong> von <strong>{importResult.total}</strong>{' '}
                Artikeln erfolgreich importiert.
                {importResult.errors.length > 0 && (
                  <>
                    {' '}
                    <strong>{importResult.errors.length}</strong> Fehler aufgetreten.
                  </>
                )}
              </Alert>

              {importResult.errors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Fehlerdetails:
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'background.paper' }}>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`Zeile ${error.row}: ${error.error}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setImportDialogOpen(false);
              setImportFile(null);
              setImportResult(null);
            }}
          >
            Schließen
          </Button>
          <Button onClick={handleImport} variant="contained" disabled={!importFile || importing} startIcon={<UploadFileIcon />}>
            Importieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
