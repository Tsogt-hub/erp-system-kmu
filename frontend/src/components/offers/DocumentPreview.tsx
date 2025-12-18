import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  Collapse,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Offer, OfferItem, getItemTypeColor, getItemTypeLabel } from '../../services/api/offers';
import { format } from 'date-fns';

interface DocumentPreviewProps {
  offer: Offer;
  items: OfferItem[];
  totals: {
    totalNet: number;
    totalTax: number;
    totalGross: number;
    totalMargin: number;
    marginPercent: number;
  };
  isEditable: boolean;
  onTextChange: (field: 'intro_text' | 'footer_text' | 'payment_terms', value: string) => void;
  onUpdateItem: (itemId: number, updates: Partial<OfferItem>) => void;
  onDeleteItem: (itemId: number) => void;
}

// Inline-Edit-Zelle
function EditableCell({ 
  value, 
  type = 'text',
  onSave, 
  isEditable,
  align = 'left',
}: { 
  value: string | number; 
  type?: 'text' | 'number' | 'currency';
  onSave: (value: string | number) => void;
  isEditable: boolean;
  align?: 'left' | 'right' | 'center';
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));

  const handleSave = () => {
    setEditing(false);
    const newValue = type === 'number' || type === 'currency' 
      ? parseFloat(editValue) || 0 
      : editValue;
    onSave(newValue);
  };

  if (!isEditable) {
    return (
      <Typography align={align}>
        {type === 'currency' 
          ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value))
          : value}
      </Typography>
    );
  }

  if (editing) {
    return (
      <TextField
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        size="small"
        autoFocus
        type={type === 'number' || type === 'currency' ? 'number' : 'text'}
        inputProps={{ style: { textAlign: align } }}
        sx={{ width: type === 'number' || type === 'currency' ? 100 : 'auto' }}
      />
    );
  }

  return (
    <Typography 
      align={align}
      sx={{ 
        cursor: 'pointer', 
        '&:hover': { bgcolor: 'action.hover', borderRadius: 1 },
        p: 0.5,
      }}
      onClick={() => setEditing(true)}
    >
      {type === 'currency' 
        ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value))
        : value}
    </Typography>
  );
}

export default function DocumentPreview({
  offer,
  items,
  totals,
  isEditable,
  onTextChange,
  onUpdateItem,
  onDeleteItem,
}: DocumentPreviewProps) {
  const [expandedTexts, setExpandedTexts] = useState({
    intro: true,
    footer: true,
    payment: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <Paper 
      sx={{ 
        maxWidth: 900, 
        mx: 'auto', 
        p: 4, 
        boxShadow: 3,
        bgcolor: 'white',
        minHeight: '1200px',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, pb: 2, borderBottom: '3px solid', borderColor: 'primary.main' }}>
        <Box>
          <Typography variant="h5" color="primary" fontWeight="bold">
            Elite PV GmbH
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Musterstraße 1, 12345 Musterstadt
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2">Tel: +49 123 456789</Typography>
          <Typography variant="body2">info@elite-pv.de</Typography>
          <Typography variant="body2">www.elite-pv.de</Typography>
        </Box>
      </Box>

      {/* Adressblock */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Elite PV GmbH · Musterstraße 1 · 12345 Musterstadt
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {offer.customer_name || 'Kunde'}
            </Typography>
            <Typography variant="body2">{offer.project_address || ''}</Typography>
          </Box>
        </Box>
        
        <Box sx={{ width: 220 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Angebot Nr.:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" fontWeight="bold">{offer.offer_number}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Datum:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2">{format(new Date(offer.created_at), 'dd.MM.yyyy')}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Gültig bis:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0, py: 0.5 }}>
                  <Typography variant="body2">
                    {offer.valid_until ? format(new Date(offer.valid_until), 'dd.MM.yyyy') : '-'}
                  </Typography>
                </TableCell>
              </TableRow>
              {offer.project_name && (
                <TableRow>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Projekt:</Typography>
                  </TableCell>
                  <TableCell sx={{ border: 0, py: 0.5 }}>
                    <Typography variant="body2">{offer.project_name}</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Titel */}
      <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mb: 3 }}>
        Angebot {offer.offer_number}
      </Typography>

      {/* Einleitungstext */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            borderRadius: 1,
            p: 0.5,
          }}
          onClick={() => setExpandedTexts({ ...expandedTexts, intro: !expandedTexts.intro })}
        >
          {expandedTexts.intro ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 0.5 }}>
            Einleitungstext
          </Typography>
        </Box>
        <Collapse in={expandedTexts.intro}>
          {isEditable ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={offer.intro_text || ''}
              onChange={(e) => onTextChange('intro_text', e.target.value)}
              placeholder="Einleitungstext..."
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>
              {offer.intro_text}
            </Typography>
          )}
        </Collapse>
      </Box>

      {/* Positionen */}
      <TableContainer sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 60 }}>Pos.</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Beschreibung</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 80 }} align="center">Menge</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 60 }} align="center">Einheit</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 100 }} align="right">Einzelpreis</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 110 }} align="right">Gesamt</TableCell>
              {isEditable && (
                <TableCell sx={{ color: 'white', width: 50 }} align="center">Aktionen</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isEditable ? 7 : 6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Keine Positionen vorhanden. Fügen Sie Artikel über die Sidebar hinzu.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => {
                const isOptional = item.item_type === 'optional' || item.item_type === 'alternative';
                const total = item.quantity * item.unit_price;
                
                return (
                  <TableRow 
                    key={item.id}
                    sx={{ 
                      '&:nth-of-type(even)': { bgcolor: 'grey.50' },
                      opacity: isOptional ? 0.7 : 1,
                    }}
                  >
                    <TableCell>
                      {(index + 1).toString().padStart(3, '0')}
                    </TableCell>
                    <TableCell>
                      <Box>
                        {item.item_type && item.item_type !== 'standard' && (
                          <Chip 
                            label={getItemTypeLabel(item.item_type)} 
                            size="small" 
                            sx={{ 
                              bgcolor: getItemTypeColor(item.item_type), 
                              color: 'white',
                              mb: 0.5,
                            }} 
                          />
                        )}
                        <EditableCell
                          value={item.description}
                          onSave={(v) => onUpdateItem(item.id, { description: String(v) })}
                          isEditable={isEditable}
                        />
                        {item.long_description && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {item.long_description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <EditableCell
                        value={item.quantity}
                        type="number"
                        onSave={(v) => onUpdateItem(item.id, { quantity: Number(v) })}
                        isEditable={isEditable}
                        align="center"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {item.unit}
                    </TableCell>
                    <TableCell align="right">
                      <EditableCell
                        value={item.unit_price}
                        type="currency"
                        onSave={(v) => onUpdateItem(item.id, { unit_price: Number(v) })}
                        isEditable={isEditable}
                        align="right"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {isOptional ? `(${formatCurrency(total)})` : formatCurrency(total)}
                    </TableCell>
                    {isEditable && (
                      <TableCell align="center">
                        <Tooltip title="Löschen">
                          <IconButton 
                            size="small" 
                            color="error"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summenblock */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Box sx={{ width: 300 }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right">Nettobetrag:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right" fontWeight="bold">{formatCurrency(totals.totalNet)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right">zzgl. 19% MwSt.:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right">{formatCurrency(totals.totalTax)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right" color="white" fontWeight="bold">Gesamtbetrag:</Typography>
                </TableCell>
                <TableCell sx={{ border: 0 }}>
                  <Typography align="right" color="white" fontWeight="bold" variant="h6">
                    {formatCurrency(totals.totalGross)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Box>

      {/* Zahlungsbedingungen */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            borderRadius: 1,
            p: 0.5,
          }}
          onClick={() => setExpandedTexts({ ...expandedTexts, payment: !expandedTexts.payment })}
        >
          {expandedTexts.payment ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 0.5 }}>
            Zahlungsbedingungen
          </Typography>
        </Box>
        <Collapse in={expandedTexts.payment}>
          {isEditable ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={offer.payment_terms || ''}
              onChange={(e) => onTextChange('payment_terms', e.target.value)}
              placeholder="Zahlungsbedingungen..."
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>
              {offer.payment_terms}
            </Typography>
          )}
        </Collapse>
      </Box>

      {/* Fußtext */}
      <Box sx={{ mb: 3 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
            borderRadius: 1,
            p: 0.5,
          }}
          onClick={() => setExpandedTexts({ ...expandedTexts, footer: !expandedTexts.footer })}
        >
          {expandedTexts.footer ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 0.5 }}>
            Schlusstext
          </Typography>
        </Box>
        <Collapse in={expandedTexts.footer}>
          {isEditable ? (
            <TextField
              fullWidth
              multiline
              rows={3}
              value={offer.footer_text || ''}
              onChange={(e) => onTextChange('footer_text', e.target.value)}
              placeholder="Schlusstext..."
              sx={{ mt: 1 }}
            />
          ) : (
            <Typography sx={{ whiteSpace: 'pre-line', mt: 1 }}>
              {offer.footer_text}
            </Typography>
          )}
        </Collapse>
      </Box>

      {/* Unterschriftsblock */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
        <Box sx={{ width: '45%', borderTop: '1px solid black', pt: 1 }}>
          <Typography variant="body2">Ort, Datum / Unterschrift Kunde</Typography>
        </Box>
        <Box sx={{ width: '45%', borderTop: '1px solid black', pt: 1 }}>
          <Typography variant="body2">Unterschrift Elite PV GmbH</Typography>
        </Box>
      </Box>

      {/* Fußzeile */}
      <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Elite PV GmbH · Musterstraße 1 · 12345 Musterstadt · Steuernr.: DE123456789
        </Typography>
        <br />
        <Typography variant="caption" color="text.secondary">
          Sparkasse Musterstadt · IBAN: DE89 3704 0044 0532 0130 00 · BIC: COBADEFFXXX
        </Typography>
      </Box>
    </Paper>
  );
}
