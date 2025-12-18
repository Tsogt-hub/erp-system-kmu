import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Toolbar,
  CircularProgress,
  Drawer,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { offersApi, Offer, OfferItem, CreateOfferItemData } from '../services/api/offers';
import { inventoryApi, Item } from '../services/api/inventory';
import DocumentPreview from '../components/offers/DocumentPreview';
import PDFPreviewPanel from '../components/offers/PDFPreviewPanel';
import FinalizeOfferDialog from '../components/offers/FinalizeOfferDialog';

const SIDEBAR_WIDTH = 320;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other} style={{ height: '100%' }}>
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

export default function OfferEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Main state
  const [offer, setOffer] = useState<Offer | null>(null);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mainTabValue, setMainTabValue] = useState(0); // 0: Dokument, 1: PDF-Vorschau
  
  // Sidebar state
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryItems, setInventoryItems] = useState<Item[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // PDF Preview
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Dialogs
  const [finalizeDialogOpen, setFinalizeDialogOpen] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Offer und Items laden
  useEffect(() => {
    if (id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const offerId = parseInt(id!);
      const offerData = await offersApi.getById(offerId);
      setOffer(offerData);
      setItems(offerData.items || []);
    } catch (error) {
      console.error('Error loading offer:', error);
      setSnackbar({ open: true, message: 'Fehler beim Laden des Angebots', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Artikel suchen
  const searchInventory = useCallback(async (term: string) => {
    if (term.length < 2) {
      setInventoryItems([]);
      return;
    }
    try {
      setSearchLoading(true);
      const results = await inventoryApi.getAll({ search: term });
      setInventoryItems(results);
    } catch (error) {
      console.error('Error searching inventory:', error);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchInventory(searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchInventory]);

  // Angebot speichern
  const handleSave = async () => {
    if (!offer) return;
    try {
      setSaving(true);
      await offersApi.update(offer.id, {
        intro_text: offer.intro_text,
        footer_text: offer.footer_text,
        payment_terms: offer.payment_terms,
        notes: offer.notes,
      });
      setSnackbar({ open: true, message: 'Angebot gespeichert', severity: 'success' });
    } catch (error) {
      console.error('Error saving offer:', error);
      setSnackbar({ open: true, message: 'Fehler beim Speichern', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // PDF-Vorschau laden
  const loadPdfPreview = async () => {
    if (!offer) return;
    try {
      setPdfLoading(true);
      const base64 = await offersApi.previewPdf(offer.id);
      setPdfBase64(base64);
      setMainTabValue(1); // Zur PDF-Vorschau wechseln
    } catch (error) {
      console.error('Error loading PDF preview:', error);
      setSnackbar({ open: true, message: 'Fehler beim Laden der PDF-Vorschau', severity: 'error' });
    } finally {
      setPdfLoading(false);
    }
  };

  // Artikel hinzufügen
  const handleAddItem = async (item: Item) => {
    if (!offer) return;
    try {
      const newItemData: CreateOfferItemData = {
        offer_id: offer.id,
        item_id: item.id,
        description: item.name,
        long_description: item.description,
        quantity: 1,
        unit: item.unit || 'Stk',
        unit_price: item.selling_price || item.price || 0,
        purchase_price: item.purchase_price || 0,
        tax_rate: 19,
        item_type: 'standard',
        is_visible: true,
      };
      const newItem = await offersApi.createItem(newItemData);
      setItems([...items, newItem]);
      
      // Gesamtbetrag aktualisieren
      const totalAmount = [...items, newItem]
        .filter(i => i.item_type === 'standard' || !i.item_type)
        .reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
      
      await offersApi.update(offer.id, { amount: totalAmount });
      setOffer({ ...offer, amount: totalAmount });
      
      setSnackbar({ open: true, message: `${item.name} hinzugefügt`, severity: 'success' });
    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbar({ open: true, message: 'Fehler beim Hinzufügen', severity: 'error' });
    }
  };

  // Position aktualisieren
  const handleUpdateItem = async (itemId: number, updates: Partial<OfferItem>) => {
    try {
      await offersApi.updateItem(itemId, updates);
      setItems(items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ));
      
      // Gesamtbetrag aktualisieren
      if (offer) {
        const updatedItems = items.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
        const totalAmount = updatedItems
          .filter(i => i.item_type === 'standard' || !i.item_type)
          .reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        
        await offersApi.update(offer.id, { amount: totalAmount });
        setOffer({ ...offer, amount: totalAmount });
      }
    } catch (error) {
      console.error('Error updating item:', error);
      setSnackbar({ open: true, message: 'Fehler beim Aktualisieren', severity: 'error' });
    }
  };

  // Position löschen
  const handleDeleteItem = async (itemId: number) => {
    try {
      await offersApi.deleteItem(itemId);
      const updatedItems = items.filter(item => item.id !== itemId);
      setItems(updatedItems);
      
      // Gesamtbetrag aktualisieren
      if (offer) {
        const totalAmount = updatedItems
          .filter(i => i.item_type === 'standard' || !i.item_type)
          .reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
        
        await offersApi.update(offer.id, { amount: totalAmount });
        setOffer({ ...offer, amount: totalAmount });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setSnackbar({ open: true, message: 'Fehler beim Löschen', severity: 'error' });
    }
  };

  // Dokument finalisieren
  const handleFinalize = async () => {
    if (!offer) return;
    try {
      const finalizedOffer = await offersApi.finalize(offer.id);
      setOffer(finalizedOffer);
      setFinalizeDialogOpen(false);
      setSnackbar({ open: true, message: `Angebot ${finalizedOffer.offer_number} wurde finalisiert`, severity: 'success' });
    } catch (error) {
      console.error('Error finalizing offer:', error);
      setSnackbar({ open: true, message: 'Fehler beim Finalisieren', severity: 'error' });
    }
  };

  // Intro/Footer/Payment Text ändern
  const handleTextChange = (field: 'intro_text' | 'footer_text' | 'payment_terms', value: string) => {
    if (offer) {
      setOffer({ ...offer, [field]: value });
    }
  };

  // Berechnungen
  const calculateTotals = () => {
    const regularItems = items.filter(i => i.item_type === 'standard' || !i.item_type);
    const totalNet = regularItems.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0);
    const totalTax = totalNet * 0.19;
    const totalGross = totalNet + totalTax;
    
    const totalPurchase = regularItems.reduce((sum, i) => {
      const purchase = i.purchase_price || 0;
      return sum + (i.quantity * purchase);
    }, 0);
    const totalMargin = totalNet - totalPurchase;
    const marginPercent = totalPurchase > 0 ? ((totalMargin / totalPurchase) * 100) : 0;
    
    return { totalNet, totalTax, totalGross, totalMargin, marginPercent };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!offer) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Angebot nicht gefunden</Typography>
        <Button onClick={() => navigate(-1)}>Zurück</Button>
      </Box>
    );
  }

  const totals = calculateTotals();
  const isEditable = offer.status === 'draft';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Top Toolbar */}
      <Paper sx={{ zIndex: 1100 }} elevation={2}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {offer.offer_number}
              {offer.status === 'draft' && (
                <Chip label="Entwurf" size="small" color="warning" sx={{ ml: 1 }} />
              )}
              {offer.status === 'finalized' && (
                <Chip label="Abgeschlossen" size="small" color="success" sx={{ ml: 1 }} />
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {offer.project_name} {offer.customer_name && `· ${offer.customer_name}`}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={pdfLoading ? <CircularProgress size={18} /> : <VisibilityIcon />}
              onClick={loadPdfPreview}
              disabled={pdfLoading}
            >
              PDF-Vorschau
            </Button>
            
            {isEditable && (
              <>
                <Button
                  variant="outlined"
                  startIcon={saving ? <CircularProgress size={18} /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  Speichern
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => setFinalizeDialogOpen(true)}
                  color="success"
                >
                  Abschließen
                </Button>
              </>
            )}
            
            {!isEditable && (
              <Button
                variant="contained"
                startIcon={<PictureAsPdfIcon />}
                onClick={async () => {
                  const blob = await offersApi.downloadPdf(offer.id);
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${offer.offer_number}.pdf`;
                  a.click();
                }}
              >
                PDF herunterladen
              </Button>
            )}
          </Box>
        </Toolbar>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Document/Preview Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Tabs 
            value={mainTabValue} 
            onChange={(_e, v) => setMainTabValue(v)}
            sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Tab icon={<DescriptionIcon />} label="Dokument" />
            <Tab icon={<PictureAsPdfIcon />} label="PDF-Vorschau" />
          </Tabs>

          <TabPanel value={mainTabValue} index={0}>
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              <DocumentPreview
                offer={offer}
                items={items}
                totals={totals}
                isEditable={isEditable}
                onTextChange={handleTextChange}
                onUpdateItem={handleUpdateItem}
                onDeleteItem={handleDeleteItem}
              />
            </Box>
          </TabPanel>

          <TabPanel value={mainTabValue} index={1}>
            <PDFPreviewPanel
              pdfBase64={pdfBase64}
              loading={pdfLoading}
              onRefresh={loadPdfPreview}
            />
          </TabPanel>
        </Box>

        {/* Article Sidebar */}
        {isEditable && (
          <Drawer
            variant="permanent"
            anchor="right"
            sx={{
              width: SIDEBAR_WIDTH,
              flexShrink: 0,
              '& .MuiDrawer-paper': {
                width: SIDEBAR_WIDTH,
                boxSizing: 'border-box',
                position: 'relative',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Artikel hinzufügen
              </Typography>
              
              <TextField
                fullWidth
                size="small"
                placeholder="Artikel suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {searchLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              <List sx={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto' }}>
                {inventoryItems.map((item) => (
                  <ListItem
                    key={item.id}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {item.sku}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">
                            {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.selling_price || item.price || 0)}
                          </Typography>
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Zum Angebot hinzufügen">
                        <IconButton 
                          edge="end" 
                          color="primary"
                          onClick={() => handleAddItem(item)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
                
                {searchTerm.length >= 2 && !searchLoading && inventoryItems.length === 0 && (
                  <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                    Keine Artikel gefunden
                  </Typography>
                )}
                
                {searchTerm.length < 2 && (
                  <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                    Mindestens 2 Zeichen eingeben
                  </Typography>
                )}
              </List>
            </Box>

            <Divider />

            {/* Summenblock */}
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Zusammenfassung
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">Netto:</Typography>
                <Typography variant="body2">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totals.totalNet)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2">MwSt. (19%):</Typography>
                <Typography variant="body2">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totals.totalTax)}
                </Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="bold">Gesamt:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totals.totalGross)}
                </Typography>
              </Box>
              
              {/* Marge */}
              <Box sx={{ mt: 2, p: 1, bgcolor: totals.marginPercent >= 20 ? 'success.light' : 'warning.light', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">Marge</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight="bold">
                    {totals.marginPercent.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totals.totalMargin)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Drawer>
        )}
      </Box>

      {/* Finalize Dialog */}
      <FinalizeOfferDialog
        open={finalizeDialogOpen}
        offer={offer}
        onClose={() => setFinalizeDialogOpen(false)}
        onFinalize={handleFinalize}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
