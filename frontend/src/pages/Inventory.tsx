import { useState, useEffect } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import { inventoryApi, Item, InventoryStock, InventoryMovement, CreateItemData, CreateMovementData, Warehouse } from '../services/api/inventory';
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

export default function Inventory() {
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stock, setStock] = useState<InventoryStock[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; errors: Array<{ row: number; error: string }>; total: number } | null>(null);
  const [importing, setImporting] = useState(false);
  const [itemForm, setItemForm] = useState<CreateItemData>({ name: '', unit: 'Stück' });
  const [movementForm, setMovementForm] = useState<CreateMovementData>({
    item_id: 0,
    warehouse_id: 0,
    quantity: 0,
    movement_type: 'IN',
  });

  useEffect(() => {
    loadData();
  }, [tabValue]);

  useEffect(() => {
    loadWarehouses();
  }, []);

  const loadWarehouses = async () => {
    try {
      const data = await inventoryApi.getWarehouses();
      setWarehouses(data);
      if (data.length > 0 && movementForm.warehouse_id === 0) {
        setMovementForm({ ...movementForm, warehouse_id: data[0].id });
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      if (tabValue === 0) {
        const data = await inventoryApi.getItems();
        setItems(data);
      } else if (tabValue === 1) {
        const data = await inventoryApi.getStock();
        setStock(data);
      } else {
        const data = await inventoryApi.getMovements();
        setMovements(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemCreate = async () => {
    try {
      await inventoryApi.createItem(itemForm);
      setItemDialogOpen(false);
      setItemForm({ name: '', unit: 'Stück' });
      loadData();
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  const handleMovementCreate = async () => {
    try {
      await inventoryApi.createMovement(movementForm);
      setMovementDialogOpen(false);
      const defaultWarehouseId = warehouses.length > 0 ? warehouses[0].id : 0;
      setMovementForm({ item_id: 0, warehouse_id: defaultWarehouseId, quantity: 0, movement_type: 'IN' });
      loadData();
      if (tabValue === 1) {
        // Reload stock after movement
        const stockData = await inventoryApi.getStock();
        setStock(stockData);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Fehler beim Erstellen der Bestandsbewegung';
      alert(errorMessage);
    }
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
        alert(`Import abgeschlossen: ${result.result.success} erfolgreich, ${result.result.errors.length} Fehler. Bitte Details prüfen.`);
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
    const csvContent = 'Name,SKU,Beschreibung,Einheit,Preis,Kategorie\n"Solarmodul 400W","PV-400-001","Hochwertiges Solarmodul","Stück","250.00","Module"\n"Wechselrichter 5kW","WR-5KW-001","String-Wechselrichter","Stück","800.00","Wechselrichter"';
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Lagerbestand
      </Typography>

      <Tabs value={tabValue} onChange={(_e, newValue) => setTabValue(newValue)} sx={{ mb: 2 }}>
        <Tab label="Artikel" />
        <Tab label="Bestand" />
        <Tab label="Bewegungen" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h6">Artikel</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              CSV-Vorlage
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Importieren
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setItemDialogOpen(true)}>
              Neuer Artikel
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Einheit</TableCell>
                <TableCell>Preis</TableCell>
                <TableCell>Kategorie</TableCell>
                <TableCell>Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Lädt...</TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Keine Artikel gefunden</TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.sku || '-'}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.price.toFixed(2)} €</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Lagerbestand</Typography>
          <Button
            variant="contained"
            startIcon={<InventoryIcon />}
            onClick={() => setMovementDialogOpen(true)}
          >
            Bestandsbewegung
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Artikel</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Lager</TableCell>
                <TableCell>Menge</TableCell>
                <TableCell>Zuletzt aktualisiert</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Lädt...</TableCell>
                </TableRow>
              ) : stock.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Kein Bestand vorhanden</TableCell>
                </TableRow>
              ) : (
                stock.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.item_name}</TableCell>
                    <TableCell>{s.sku || '-'}</TableCell>
                    <TableCell>{s.warehouse_name}</TableCell>
                    <TableCell>
                      <Chip label={s.quantity} color={s.quantity > 0 ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{format(new Date(s.updated_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Bestandsbewegungen
        </Typography>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Datum</TableCell>
                <TableCell>Artikel</TableCell>
                <TableCell>Lager</TableCell>
                <TableCell>Typ</TableCell>
                <TableCell>Menge</TableCell>
                <TableCell>Referenz</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Lädt...</TableCell>
                </TableRow>
              ) : movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Keine Bewegungen gefunden</TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>{format(new Date(movement.created_at), 'dd.MM.yyyy HH:mm')}</TableCell>
                    <TableCell>{movement.item_name}</TableCell>
                    <TableCell>{movement.warehouse_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={movement.movement_type}
                        color={movement.movement_type === 'IN' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{movement.quantity}</TableCell>
                    <TableCell>{movement.reference || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Item Dialog */}
      <Dialog open={itemDialogOpen} onClose={() => setItemDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuen Artikel erstellen</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={itemForm.name}
            onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="SKU"
            value={itemForm.sku || ''}
            onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Einheit"
            value={itemForm.unit}
            onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Preis"
            value={itemForm.price || ''}
            onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Kategorie"
            value={itemForm.category || ''}
            onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleItemCreate} variant="contained" disabled={!itemForm.name}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={movementDialogOpen} onClose={() => setMovementDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bestandsbewegung</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Artikel"
            value={movementForm.item_id || ''}
            onChange={(e) => setMovementForm({ ...movementForm, item_id: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
            SelectProps={{ native: true }}
          >
            <option value="">Bitte wählen...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} {item.sku ? `(${item.sku})` : ''}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Lager"
            value={movementForm.warehouse_id || ''}
            onChange={(e) => setMovementForm({ ...movementForm, warehouse_id: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
            SelectProps={{ native: true }}
          >
            <option value="">Bitte wählen...</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="number"
            label="Menge"
            value={movementForm.quantity || ''}
            onChange={(e) => setMovementForm({ ...movementForm, quantity: parseInt(e.target.value) || 0 })}
            margin="normal"
            required
            inputProps={{ min: 1 }}
          />
          <TextField
            fullWidth
            select
            label="Typ"
            value={movementForm.movement_type}
            onChange={(e) => setMovementForm({ ...movementForm, movement_type: e.target.value as 'IN' | 'OUT' })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="IN">Eingang (Wareneingang)</option>
            <option value="OUT">Ausgang (Warenentnahme)</option>
          </TextField>
          <TextField
            fullWidth
            label="Referenz"
            value={movementForm.reference || ''}
            onChange={(e) => setMovementForm({ ...movementForm, reference: e.target.value })}
            margin="normal"
            placeholder="z.B. Lieferschein-Nr., Auftrags-Nr."
          />
          <TextField
            fullWidth
            label="Notizen"
            value={movementForm.notes || ''}
            onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMovementDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleMovementCreate} 
            variant="contained" 
            disabled={!movementForm.item_id || !movementForm.warehouse_id || !movementForm.quantity || movementForm.quantity <= 0}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => {
        setImportDialogOpen(false);
        setImportFile(null);
        setImportResult(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Artikel importieren</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Bitte laden Sie eine CSV-Datei hoch. Die CSV-Datei muss folgende Spalten enthalten:
              <strong> Name, SKU, Beschreibung, Einheit, Preis, Kategorie</strong>
            </Alert>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
              sx={{ mb: 2 }}
            >
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
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Maximale Dateigröße: 5MB
            </Typography>
          </Box>

          {importing && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {importResult && (
            <Box sx={{ mt: 2 }}>
              <Alert severity={importResult.errors.length > 0 ? 'warning' : 'success'} sx={{ mb: 2 }}>
                Import abgeschlossen: <strong>{importResult.success}</strong> von <strong>{importResult.total}</strong> Artikeln erfolgreich importiert.
                {importResult.errors.length > 0 && (
                  <> <strong>{importResult.errors.length}</strong> Fehler aufgetreten.</>
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
          <Button onClick={() => {
            setImportDialogOpen(false);
            setImportFile(null);
            setImportResult(null);
          }}>
            Schließen
          </Button>
          <Button
            onClick={handleImport}
            variant="contained"
            disabled={!importFile || importing}
            startIcon={<UploadFileIcon />}
          >
            Importieren
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

