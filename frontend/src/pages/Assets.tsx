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
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as MaintenanceIcon,
  PersonAdd as AssignIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  DirectionsCar as VehicleIcon,
  Computer as ITIcon,
  Construction as ToolsIcon,
  Business as OfficeIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { assetsApi, Asset, CreateAssetData, AssetStats, ASSET_CATEGORIES, MaintenanceRecord } from '../services/api/assets';
import { usersApi, User } from '../services/api/users';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Assets() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<AssetStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreateAssetData>({
    name: '',
    category: '',
    purchase_price: 0,
    current_value: 0,
    depreciation_rate: 10,
  });

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_date: new Date().toISOString().split('T')[0],
    maintenance_type: 'service' as MaintenanceRecord['maintenance_type'],
    description: '',
    cost: 0,
    performed_by: '',
    next_maintenance_date: '',
    notes: '',
  });

  const [assignUserId, setAssignUserId] = useState<number | ''>('');

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { status?: string; category?: string } = {};
      if (statusFilter) filters.status = statusFilter;
      if (categoryFilter) filters.category = categoryFilter;
      
      const [assetsData, usersData] = await Promise.all([
        assetsApi.getAll(filters).catch(() => []),
        usersApi.getAll().catch(() => []),
      ]);
      setAssets(assetsData);
      setUsers(usersData);
      
      // Calculate stats locally
      const statsData: AssetStats = {
        total: assetsData.length,
        total_value: assetsData.reduce((sum, a) => sum + (a.current_value || 0), 0),
        available: assetsData.filter(a => a.status === 'available').length,
        in_use: assetsData.filter(a => a.status === 'in_use').length,
        maintenance_due: assetsData.filter(a => {
          if (!a.next_maintenance_date) return false;
          return new Date(a.next_maintenance_date) <= new Date();
        }).length,
        disposed: assetsData.filter(a => a.status === 'disposed').length,
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name,
        description: asset.description,
        category: asset.category,
        manufacturer: asset.manufacturer,
        model: asset.model,
        serial_number: asset.serial_number,
        purchase_date: asset.purchase_date?.split('T')[0],
        purchase_price: asset.purchase_price,
        current_value: asset.current_value,
        depreciation_rate: asset.depreciation_rate,
        warranty_expiry: asset.warranty_expiry?.split('T')[0],
        location: asset.location,
        status: asset.status,
        condition: asset.condition,
        next_maintenance_date: asset.next_maintenance_date?.split('T')[0],
        notes: asset.notes,
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        category: '',
        purchase_price: 0,
        current_value: 0,
        depreciation_rate: 10,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingAsset) {
        await assetsApi.update(editingAsset.id, formData);
      } else {
        await assetsApi.create(formData);
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving asset:', err);
      setError('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie diese Anlage wirklich löschen?')) {
      try {
        await assetsApi.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting asset:', err);
        setError('Fehler beim Löschen');
      }
    }
  };

  const handleOpenMaintenanceDialog = async (asset: Asset) => {
    setSelectedAsset(asset);
    try {
      const records = await assetsApi.getMaintenanceRecords(asset.id).catch(() => []);
      setMaintenanceRecords(records);
    } catch (err) {
      setMaintenanceRecords([]);
    }
    setMaintenanceDialogOpen(true);
  };

  const handleAddMaintenance = async () => {
    if (!selectedAsset) return;
    try {
      await assetsApi.addMaintenanceRecord(selectedAsset.id, maintenanceForm);
      const records = await assetsApi.getMaintenanceRecords(selectedAsset.id).catch(() => []);
      setMaintenanceRecords(records);
      setMaintenanceForm({
        maintenance_date: new Date().toISOString().split('T')[0],
        maintenance_type: 'service',
        description: '',
        cost: 0,
        performed_by: '',
        next_maintenance_date: '',
        notes: '',
      });
      loadData();
    } catch (err) {
      console.error('Error adding maintenance:', err);
      setError('Fehler beim Hinzufügen der Wartung');
    }
  };

  const handleOpenAssignDialog = (asset: Asset) => {
    setSelectedAsset(asset);
    setAssignUserId(asset.assigned_to || '');
    setAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedAsset) return;
    try {
      if (assignUserId) {
        await assetsApi.assign(selectedAsset.id, Number(assignUserId));
      } else {
        await assetsApi.unassign(selectedAsset.id);
      }
      setAssignDialogOpen(false);
      loadData();
    } catch (err) {
      console.error('Error assigning asset:', err);
      setError('Fehler beim Zuweisen');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
      available: 'success',
      in_use: 'primary',
      maintenance: 'warning',
      disposed: 'error',
      reserved: 'info',
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      available: 'Verfügbar',
      in_use: 'In Verwendung',
      maintenance: 'In Wartung',
      disposed: 'Ausgemustert',
      reserved: 'Reserviert',
    };
    return labels[status] || status;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      new: 'Neu',
      good: 'Gut',
      fair: 'Befriedigend',
      poor: 'Schlecht',
    };
    return labels[condition] || condition;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      vehicle: <VehicleIcon />,
      it_equipment: <ITIcon />,
      tools: <ToolsIcon />,
      office_furniture: <OfficeIcon />,
    };
    return icons[category] || <ToolsIcon />;
  };

  const getCategoryLabel = (category: string) => {
    return ASSET_CATEGORIES.find(c => c.value === category)?.label || category;
  };

  const filteredAssets = assets.filter(asset => {
    const searchLower = searchTerm.toLowerCase();
    return (
      asset.name?.toLowerCase().includes(searchLower) ||
      asset.asset_number?.toLowerCase().includes(searchLower) ||
      asset.serial_number?.toLowerCase().includes(searchLower) ||
      asset.manufacturer?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography
        variant="h4"
        gutterBottom
        sx={{
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: '#000000',
          mb: 3,
        }}
      >
        Anlagenverwaltung
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gesamtwert
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                  {stats.total_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gesamt
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#5856D6' }}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Verfügbar
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.available}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  In Verwendung
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF9500' }}>
                  {stats.in_use}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Wartung fällig
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                  {stats.maintenance_due}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.72)',
                backdropFilter: 'blur(60px) saturate(150%)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ausgemustert
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#8E8E93' }}>
                  {stats.disposed}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Toolbar */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Suchen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.6)' }} />,
          }}
          sx={{
            background: 'rgba(255, 255, 255, 0.72)',
            borderRadius: '10px',
            minWidth: 250,
          }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px' }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="available">Verfügbar</MenuItem>
            <MenuItem value="in_use">In Verwendung</MenuItem>
            <MenuItem value="maintenance">In Wartung</MenuItem>
            <MenuItem value="disposed">Ausgemustert</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Kategorie</InputLabel>
          <Select
            value={categoryFilter}
            label="Kategorie"
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px' }}
          >
            <MenuItem value="">Alle</MenuItem>
            {ASSET_CATEGORIES.map(cat => (
              <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(searchTerm || statusFilter || categoryFilter) && (
          <IconButton onClick={() => { setSearchTerm(''); setStatusFilter(''); setCategoryFilter(''); }}>
            <ClearIcon />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
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

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(60px) saturate(150%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
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
              <TableCell sx={{ fontWeight: 600 }}>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {assets.length === 0 
                      ? 'Keine Anlagen vorhanden. Erstellen Sie eine neue Anlage.'
                      : 'Keine Anlagen gefunden für die aktuelle Filterung.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => (
                <TableRow key={asset.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asset.asset_number}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                        {getCategoryIcon(asset.category)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {asset.name}
                        </Typography>
                        {asset.manufacturer && (
                          <Typography variant="caption" color="text.secondary">
                            {asset.manufacturer} {asset.model || ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={getCategoryLabel(asset.category)} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {asset.purchase_date 
                      ? format(new Date(asset.purchase_date), 'dd.MM.yyyy', { locale: de })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {asset.purchase_price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {asset.current_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {asset.assigned_to_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(asset.status)} 
                      color={getStatusColor(asset.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Bearbeiten">
                      <IconButton size="small" onClick={() => handleOpenDialog(asset)} color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zuweisen">
                      <IconButton size="small" onClick={() => handleOpenAssignDialog(asset)} color="info">
                        <AssignIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Wartung">
                      <IconButton size="small" onClick={() => handleOpenMaintenanceDialog(asset)} color="warning">
                        <MaintenanceIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Löschen">
                      <IconButton size="small" onClick={() => handleDelete(asset.id)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
          {editingAsset ? 'Anlage bearbeiten' : 'Neue Anlage'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Kategorie *</InputLabel>
                <Select
                  value={formData.category}
                  label="Kategorie *"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {ASSET_CATEGORIES.map(cat => (
                    <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Beschreibung"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Hersteller"
                value={formData.manufacturer || ''}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Modell"
                value={formData.model || ''}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Seriennummer"
                value={formData.serial_number || ''}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kaufdatum"
                type="date"
                value={formData.purchase_date || ''}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Kaufpreis (€)"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Aktueller Wert (€)"
                type="number"
                value={formData.current_value || 0}
                onChange={(e) => setFormData({ ...formData, current_value: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Abschreibung (%/Jahr)"
                type="number"
                value={formData.depreciation_rate || 10}
                onChange={(e) => setFormData({ ...formData, depreciation_rate: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Garantie bis"
                type="date"
                value={formData.warranty_expiry || ''}
                onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Standort"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'available'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Asset['status'] })}
                >
                  <MenuItem value="available">Verfügbar</MenuItem>
                  <MenuItem value="in_use">In Verwendung</MenuItem>
                  <MenuItem value="maintenance">In Wartung</MenuItem>
                  <MenuItem value="disposed">Ausgemustert</MenuItem>
                  <MenuItem value="reserved">Reserviert</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Zustand</InputLabel>
                <Select
                  value={formData.condition || 'good'}
                  label="Zustand"
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as Asset['condition'] })}
                >
                  <MenuItem value="new">Neu</MenuItem>
                  <MenuItem value="good">Gut</MenuItem>
                  <MenuItem value="fair">Befriedigend</MenuItem>
                  <MenuItem value="poor">Schlecht</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Nächste Wartung"
                type="date"
                value={formData.next_maintenance_date || ''}
                onChange={(e) => setFormData({ ...formData, next_maintenance_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notizen"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button onClick={() => setDialogOpen(false)}>Abbrechen</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.name || !formData.category}
            sx={{ background: 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)' }}
          >
            {editingAsset ? 'Speichern' : 'Erstellen'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Anlage zuweisen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Anlage: {selectedAsset?.name}
          </Typography>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Mitarbeiter</InputLabel>
            <Select
              value={assignUserId}
              label="Mitarbeiter"
              onChange={(e) => setAssignUserId(e.target.value as number | '')}
            >
              <MenuItem value="">Keine Zuweisung</MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={handleAssign} variant="contained">Zuweisen</Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onClose={() => setMaintenanceDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Wartungshistorie - {selectedAsset?.name}</DialogTitle>
        <DialogContent>
          <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2 }}>
            <Tab label="Historie" />
            <Tab label="Neue Wartung" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            {maintenanceRecords.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                Keine Wartungshistorie vorhanden.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Datum</TableCell>
                      <TableCell>Typ</TableCell>
                      <TableCell>Beschreibung</TableCell>
                      <TableCell>Kosten</TableCell>
                      <TableCell>Durchgeführt von</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maintenanceRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.maintenance_date), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>{record.maintenance_type}</TableCell>
                        <TableCell>{record.description}</TableCell>
                        <TableCell>{record.cost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</TableCell>
                        <TableCell>{record.performed_by || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wartungsdatum"
                  type="date"
                  value={maintenanceForm.maintenance_date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Typ</InputLabel>
                  <Select
                    value={maintenanceForm.maintenance_type}
                    label="Typ"
                    onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenance_type: e.target.value as any })}
                  >
                    <MenuItem value="inspection">Inspektion</MenuItem>
                    <MenuItem value="repair">Reparatur</MenuItem>
                    <MenuItem value="calibration">Kalibrierung</MenuItem>
                    <MenuItem value="service">Service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  value={maintenanceForm.description}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kosten (€)"
                  type="number"
                  value={maintenanceForm.cost}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Durchgeführt von"
                  value={maintenanceForm.performed_by}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, performed_by: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nächste Wartung"
                  type="date"
                  value={maintenanceForm.next_maintenance_date}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_maintenance_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button onClick={handleAddMaintenance} variant="contained" disabled={!maintenanceForm.description}>
                  Wartung hinzufügen
                </Button>
              </Grid>
            </Grid>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
