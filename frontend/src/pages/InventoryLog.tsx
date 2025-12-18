import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
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
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Download as DownloadIcon,
  TrendingUp as IncomingIcon,
  TrendingDown as OutgoingIcon,
  SwapHoriz as TransferIcon,
  Tune as AdjustIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { inventoryMovementsApi, InventoryMovement, MovementStats } from '../services/api/inventoryMovements';

export default function InventoryLog() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<MovementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [typeFilter, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { movement_type?: string; from_date?: string; to_date?: string } = {};
      if (typeFilter) filters.movement_type = typeFilter;
      if (dateFrom) filters.from_date = dateFrom;
      if (dateTo) filters.to_date = dateTo;

      const movementsData = await inventoryMovementsApi.getAll(filters).catch(() => []);
      setMovements(movementsData);
      
      // Calculate stats
      const statsData: MovementStats = {
        total_movements: movementsData.length,
        incoming_count: movementsData.filter(m => m.movement_type === 'incoming').length,
        outgoing_count: movementsData.filter(m => m.movement_type === 'outgoing').length,
        incoming_value: movementsData
          .filter(m => m.movement_type === 'incoming')
          .reduce((sum, m) => sum + (m.total_value || m.quantity * (m.unit_price || 0)), 0),
        outgoing_value: movementsData
          .filter(m => m.movement_type === 'outgoing')
          .reduce((sum, m) => sum + (m.total_value || m.quantity * (m.unit_price || 0)), 0),
        net_change: movementsData.reduce((sum, m) => {
          if (m.movement_type === 'incoming') return sum + m.quantity;
          if (m.movement_type === 'outgoing') return sum - m.quantity;
          return sum;
        }, 0),
      };
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = movements.filter(movement => {
    const searchLower = searchTerm.toLowerCase();
    return (
      movement.item_name?.toLowerCase().includes(searchLower) ||
      movement.item_sku?.toLowerCase().includes(searchLower) ||
      movement.supplier_name?.toLowerCase().includes(searchLower) ||
      movement.customer_name?.toLowerCase().includes(searchLower) ||
      movement.reference_number?.toLowerCase().includes(searchLower) ||
      movement.performed_by_name?.toLowerCase().includes(searchLower)
    );
  });

  // Sort by date descending
  const sortedMovements = [...filteredMovements].sort((a, b) => 
    new Date(b.movement_date).getTime() - new Date(a.movement_date).getTime()
  );

  const paginatedMovements = sortedMovements.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalPages = Math.ceil(sortedMovements.length / itemsPerPage);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'incoming': return <IncomingIcon sx={{ color: '#34C759' }} />;
      case 'outgoing': return <OutgoingIcon sx={{ color: '#FF3B30' }} />;
      case 'transfer': return <TransferIcon sx={{ color: '#5856D6' }} />;
      case 'adjustment': return <AdjustIcon sx={{ color: '#FF9500' }} />;
      default: return null;
    }
  };

  const getMovementLabel = (type: string) => {
    const labels: Record<string, string> = {
      incoming: 'Einbuchung',
      outgoing: 'Ausbuchung',
      transfer: 'Umlagerung',
      adjustment: 'Korrektur',
    };
    return labels[type] || type;
  };

  const getMovementColor = (type: string) => {
    const colors: Record<string, 'success' | 'error' | 'info' | 'warning' | 'default'> = {
      incoming: 'success',
      outgoing: 'error',
      transfer: 'info',
      adjustment: 'warning',
    };
    return colors[type] || 'default';
  };

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
        sx={{ fontWeight: 700, letterSpacing: '-0.03em', color: '#000000', mb: 3 }}
      >
        Lagerbuch
      </Typography>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Bewegungen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#007AFF' }}>
                  {stats.total_movements}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Einbuchungen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#34C759' }}>
                  {stats.incoming_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ausbuchungen
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#FF3B30' }}>
                  {stats.outgoing_count}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Warenbewegung
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: stats.net_change >= 0 ? '#34C759' : '#FF3B30' }}>
                  {stats.net_change >= 0 ? '+' : ''}{stats.net_change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.72)',
              backdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
            }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Netto-Wert
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#5856D6' }}>
                  {(stats.incoming_value - stats.outgoing_value).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
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
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'rgba(0, 0, 0, 0.6)' }} /> }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Typ</InputLabel>
          <Select
            value={typeFilter}
            label="Typ"
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px' }}
          >
            <MenuItem value="">Alle</MenuItem>
            <MenuItem value="incoming">Einbuchung</MenuItem>
            <MenuItem value="outgoing">Ausbuchung</MenuItem>
            <MenuItem value="transfer">Umlagerung</MenuItem>
            <MenuItem value="adjustment">Korrektur</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Von"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 150 }}
        />
        <TextField
          label="Bis"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ background: 'rgba(255, 255, 255, 0.72)', borderRadius: '10px', minWidth: 150 }}
        />
        {(searchTerm || typeFilter || dateFrom || dateTo) && (
          <IconButton onClick={() => { setSearchTerm(''); setTypeFilter(''); setDateFrom(''); setDateTo(''); }}>
            <ClearIcon />
          </IconButton>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{
        background: 'rgba(255, 255, 255, 0.72)',
        backdropFilter: 'blur(60px) saturate(150%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Datum</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Typ</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Artikel</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Menge</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Wert</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Referenz</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Bearbeiter</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedMovements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Keine Lagerbewegungen vorhanden.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedMovements.map((movement) => (
                <TableRow key={movement.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" fontWeight={500}>
                        {format(new Date(movement.movement_date), 'dd.MM.yyyy', { locale: de })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(movement.created_at), 'HH:mm', { locale: de })} Uhr
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getMovementIcon(movement.movement_type)}
                      <Chip 
                        label={getMovementLabel(movement.movement_type)} 
                        color={getMovementColor(movement.movement_type)} 
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movement.item_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {movement.item_sku || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={movement.movement_type === 'incoming' ? `+${movement.quantity}` : `-${movement.quantity}`}
                      color={movement.movement_type === 'incoming' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {movement.total_value 
                        ? movement.total_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
                        : (movement.quantity * (movement.unit_price || 0)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {movement.reference_number || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {movement.supplier_name || movement.customer_name || '-'}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {movement.performed_by_name || '-'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
}
