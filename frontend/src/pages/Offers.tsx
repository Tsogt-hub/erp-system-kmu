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
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import TextField from '@mui/material/TextField';
import { offersApi, Offer } from '../services/api/offers';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Tabellen-Filter
  const [tableFilters, setTableFilters] = useState({
    offerNumber: '',
    customer: '',
    project: '',
    status: '',
  });

  useEffect(() => {
    loadOffers();
  }, [statusFilter]);
  
  // Filter-Logik
  useEffect(() => {
    let result = offers;
    
    if (tableFilters.offerNumber) {
      result = result.filter(o => 
        o.offer_number?.toLowerCase().includes(tableFilters.offerNumber.toLowerCase())
      );
    }
    if (tableFilters.customer) {
      result = result.filter(o => 
        o.customer_name?.toLowerCase().includes(tableFilters.customer.toLowerCase())
      );
    }
    if (tableFilters.project) {
      result = result.filter(o => 
        o.project_name?.toLowerCase().includes(tableFilters.project.toLowerCase())
      );
    }
    if (tableFilters.status) {
      result = result.filter(o => o.status === tableFilters.status);
    }
    
    setFilteredOffers(result);
  }, [offers, tableFilters]);
  
  const resetFilters = () => {
    setTableFilters({
      offerNumber: '',
      customer: '',
      project: '',
      status: '',
    });
  };

  const loadOffers = async () => {
    try {
      setLoading(true);
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await offersApi.getAll(status);
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    navigate('/offers/create');
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Möchten Sie dieses Angebot wirklich löschen?')) {
      try {
        await offersApi.delete(id);
        loadOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'default';
      case 'sent': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const calculateTotal = (amount: number, taxRate: number) => {
    return (amount * (1 + taxRate / 100)).toFixed(2);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Angebote</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
              Neues Angebot
            </Button>
      </Box>

      {/* Toolbar wie OpusFlow */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#FAFAFA' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">Alle</MenuItem>
              <MenuItem value="draft">Entwurf</MenuItem>
              <MenuItem value="sent">Versendet</MenuItem>
              <MenuItem value="accepted">Angenommen</MenuItem>
              <MenuItem value="rejected">Abgelehnt</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Angebotsnummer</TableCell>
              <TableCell>Kunde</TableCell>
              <TableCell>Projekt</TableCell>
              <TableCell align="right">Betrag (netto)</TableCell>
              <TableCell align="right">Betrag (brutto)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Gültig bis</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
            {/* Filter-Zeile wie bei Hero ERP */}
            <TableRow sx={{ backgroundColor: '#FAFAFA' }}>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Angebotsnummer"
                  fullWidth
                  variant="outlined"
                  value={tableFilters.offerNumber}
                  onChange={(e) => setTableFilters({ ...tableFilters, offerNumber: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Kunde"
                  fullWidth
                  variant="outlined"
                  value={tableFilters.customer}
                  onChange={(e) => setTableFilters({ ...tableFilters, customer: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                />
              </TableCell>
              <TableCell>
                <TextField
                  size="small"
                  placeholder="Projekt"
                  fullWidth
                  variant="outlined"
                  value={tableFilters.project}
                  onChange={(e) => setTableFilters({ ...tableFilters, project: e.target.value })}
                  sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#FFFFFF' } }}
                />
              </TableCell>
              <TableCell />
              <TableCell />
              <TableCell>
                <FormControl size="small" fullWidth>
                  <Select
                    displayEmpty
                    value={tableFilters.status}
                    onChange={(e) => setTableFilters({ ...tableFilters, status: e.target.value })}
                    sx={{ backgroundColor: '#FFFFFF' }}
                  >
                    <MenuItem value="">Alle</MenuItem>
                    <MenuItem value="draft">Entwurf</MenuItem>
                    <MenuItem value="sent">Versendet</MenuItem>
                    <MenuItem value="accepted">Angenommen</MenuItem>
                    <MenuItem value="rejected">Abgelehnt</MenuItem>
                  </Select>
                </FormControl>
              </TableCell>
              <TableCell />
              <TableCell>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    sx={{ minWidth: 'auto', px: 1 }}
                  >
                    Suchen
                  </Button>
                  <IconButton
                    size="small"
                    onClick={resetFilters}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Lädt...</TableCell>
              </TableRow>
            ) : filteredOffers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">Keine Angebote gefunden</TableCell>
              </TableRow>
            ) : (
              filteredOffers.map((offer) => (
                <TableRow
                  key={offer.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/offers/${offer.id}`)}
                >
                  <TableCell>{offer.offer_number}</TableCell>
                  <TableCell>{offer.customer_name || '-'}</TableCell>
                  <TableCell>{offer.project_name || '-'}</TableCell>
                  <TableCell align="right">{offer.amount.toFixed(2)} €</TableCell>
                  <TableCell align="right">{calculateTotal(offer.amount, offer.tax_rate)} €</TableCell>
                  <TableCell>
                    <Chip
                      label={offer.status}
                      color={getStatusColor(offer.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {offer.valid_until ? format(new Date(offer.valid_until), 'dd.MM.yyyy') : '-'}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/offers/${offer.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
}

