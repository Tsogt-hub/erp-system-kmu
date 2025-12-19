import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Badge,
  Select,
  FormControl,
  InputLabel,
  Popover,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AccessTime as TimeIcon,
  LocalOffer as LabelIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  ColorLens as ColorIcon,
  Visibility as ViewIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { kanbanService, KanbanBoard, KanbanColumn, KanbanCard, CreateCardData } from '../services/kanban.service';
import * as companiesApi from '../services/api/companies';
import * as contactsApi from '../services/api/contacts';

// Color palette for columns
const COLUMN_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#F44336', '#9C27B0',
  '#00BCD4', '#E91E63', '#3F51B5', '#009688', '#795548',
  '#607D8B', '#FFEB3B', '#8BC34A', '#FF5722', '#673AB7',
];

// Priority colors
const PRIORITY_COLORS: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  urgent: '#9C27B0',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Niedrig',
  medium: 'Mittel',
  high: 'Hoch',
  urgent: 'Dringend',
};

interface DragItem {
  cardId: number;
  sourceColumnId: number;
  sourceIndex: number;
}

// Gewerk configurations
const GEWERK_CONFIG: Record<string, { name: string; description: string; type: string; defaultColumns: string[] }> = {
  'pv': {
    name: '☀️ PV Projekte',
    description: 'Kanban Board für Photovoltaik-Projekte',
    type: 'pv',
    defaultColumns: ['Erstkontakt', 'Beratung', 'Angebot', 'Beauftragt', 'In Umsetzung', 'Abgeschlossen'],
  },
  'gewerbe': {
    name: '🏢 Gewerbe Projekte',
    description: 'Kanban Board für Gewerbe-Projekte',
    type: 'gewerbe',
    defaultColumns: ['Anfrage', 'Erstberatung', 'Planung', 'Angebot', 'Auftrag', 'Installation', 'Fertig'],
  },
  'service': {
    name: '🔁 Service / Problemfälle',
    description: 'Kanban Board für Service- und Problemfälle',
    type: 'service',
    defaultColumns: ['Offen', 'In Bearbeitung', 'Warten auf Kunde', 'Gelöst', 'Abgeschlossen'],
  },
};

export default function CustomKanbanBoard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { boardId, gewerk } = useParams<{ boardId?: string; gewerk?: string }>();
  
  const [board, setBoard] = useState<(KanbanBoard & { columns: (KanbanColumn & { cards: KanbanCard[] })[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingGewerkBoard, setIsCreatingGewerkBoard] = useState(false);
  
  // Drag state
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<number | null>(null);
  
  // Dialogs
  const [newColumnDialogOpen, setNewColumnDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState(COLUMN_COLORS[0]);
  
  const [newCardDialogOpen, setNewCardDialogOpen] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<number | null>(null);
  const [newCardData, setNewCardData] = useState<Partial<CreateCardData>>({
    title: '',
    description: '',
    priority: 'medium',
  });
  
  const [editCardDialogOpen, setEditCardDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [cardDetailOpen, setCardDetailOpen] = useState(false);
  
  // Column menu
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  
  // Color picker
  const [colorPickerAnchor, setColorPickerAnchor] = useState<HTMLElement | null>(null);
  const [editingColumnColor, setEditingColumnColor] = useState<number | null>(null);
  
  // Companies & Contacts for linking
  const [companies, setCompanies] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  
  // Edit column
  const [editColumnDialogOpen, setEditColumnDialogOpen] = useState(false);
  const [editColumnName, setEditColumnName] = useState('');
  
  // Pipeline settings dialog
  const [pipelineSettingsOpen, setPipelineSettingsOpen] = useState(false);

  const loadBoard = useCallback(async () => {
    // If we have a boardId, load directly
    if (boardId) {
      setLoading(true);
      try {
        const data = await kanbanService.getBoardById(parseInt(boardId));
        setBoard(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Board konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // If we have a gewerk, find or create the board for it
    if (gewerk && GEWERK_CONFIG[gewerk]) {
      setLoading(true);
      try {
        // Try to find existing board for this gewerk
        const allBoards = await kanbanService.getAllBoards();
        const existingBoard = allBoards.find(b => b.board_type === gewerk);
        
        if (existingBoard) {
          // Load the full board with columns and cards
          const data = await kanbanService.getBoardById(existingBoard.id);
          setBoard(data);
          setError(null);
        } else {
          // Create a new board for this gewerk (backend creates default columns)
          setIsCreatingGewerkBoard(true);
          const config = GEWERK_CONFIG[gewerk];
          const newBoard = await kanbanService.createBoard({
            name: config.name,
            description: config.description,
            board_type: gewerk,
          });
          
          // Load the complete board (columns are created by backend)
          const data = await kanbanService.getBoardById(newBoard.id);
          setBoard(data);
          setError(null);
          setIsCreatingGewerkBoard(false);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Board konnte nicht geladen werden');
        setIsCreatingGewerkBoard(false);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Neither boardId nor valid gewerk
    setError('Kein Board gefunden');
    setLoading(false);
  }, [boardId, gewerk]);

  useEffect(() => {
    loadBoard();
    loadCompaniesAndContacts();
  }, [loadBoard]);

  const loadCompaniesAndContacts = async () => {
    try {
      const [companiesData, contactsData] = await Promise.all([
        companiesApi.getCompanies(),
        contactsApi.getContacts(),
      ]);
      setCompanies(companiesData);
      setContacts(contactsData);
    } catch (err) {
      console.error('Error loading companies/contacts:', err);
    }
  };

  // ============ DRAG & DROP ============
  const handleDragStart = (e: React.DragEvent, card: KanbanCard, columnId: number, index: number) => {
    setDragItem({
      cardId: card.id,
      sourceColumnId: columnId,
      sourceIndex: index,
    });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id.toString());
  };

  const handleDragOver = (e: React.DragEvent, columnId: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: number) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!dragItem || !board) return;
    
    const { cardId, sourceColumnId } = dragItem;
    
    // Find target column to get position
    const targetColumn = board.columns.find(c => c.id === targetColumnId);
    const newPosition = targetColumn ? targetColumn.cards.length + 1 : 1;
    
    // Optimistic update
    const updatedBoard = { ...board };
    const sourceCol = updatedBoard.columns.find(c => c.id === sourceColumnId);
    const targetCol = updatedBoard.columns.find(c => c.id === targetColumnId);
    
    if (sourceCol && targetCol) {
      const cardIndex = sourceCol.cards.findIndex(c => c.id === cardId);
      if (cardIndex !== -1) {
        const [movedCard] = sourceCol.cards.splice(cardIndex, 1);
        movedCard.column_id = targetColumnId;
        targetCol.cards.push(movedCard);
        setBoard(updatedBoard);
      }
    }
    
    try {
      await kanbanService.moveCard(cardId, targetColumnId, newPosition);
    } catch (err) {
      console.error('Error moving card:', err);
      loadBoard(); // Reload on error
    }
    
    setDragItem(null);
  };

  // ============ COLUMN ACTIONS ============
  const handleCreateColumn = async () => {
    if (!board || !newColumnName.trim()) return;
    
    try {
      await kanbanService.createColumn(board.id, {
        name: newColumnName.trim(),
        color: newColumnColor,
      });
      setNewColumnDialogOpen(false);
      setNewColumnName('');
      setNewColumnColor(COLUMN_COLORS[0]);
      loadBoard();
    } catch (err) {
      console.error('Error creating column:', err);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!window.confirm('Spalte wirklich löschen? Alle Karten werden ebenfalls gelöscht.')) return;
    
    try {
      await kanbanService.deleteColumn(columnId);
      setColumnMenuAnchor(null);
      loadBoard();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  const handleUpdateColumnColor = async (columnId: number, color: string) => {
    try {
      await kanbanService.updateColumn(columnId, { color });
      setColorPickerAnchor(null);
      setEditingColumnColor(null);
      loadBoard();
    } catch (err) {
      console.error('Error updating column color:', err);
    }
  };

  const handleUpdateColumnName = async () => {
    if (!selectedColumnId || !editColumnName.trim()) return;
    
    try {
      await kanbanService.updateColumn(selectedColumnId, { name: editColumnName.trim() });
      setEditColumnDialogOpen(false);
      setEditColumnName('');
      setSelectedColumnId(null);
      loadBoard();
    } catch (err) {
      console.error('Error updating column name:', err);
    }
  };

  // ============ CARD ACTIONS ============
  const handleCreateCard = async () => {
    if (!newCardColumnId || !board || !newCardData.title?.trim()) return;
    
    try {
      await kanbanService.createCard({
        ...newCardData as CreateCardData,
        column_id: newCardColumnId,
        board_id: board.id,
        title: newCardData.title.trim(),
      });
      setNewCardDialogOpen(false);
      setNewCardData({ title: '', description: '', priority: 'medium' });
      setNewCardColumnId(null);
      loadBoard();
    } catch (err) {
      console.error('Error creating card:', err);
    }
  };

  const handleUpdateCard = async () => {
    if (!editingCard) return;
    
    try {
      await kanbanService.updateCard(editingCard.id, {
        title: editingCard.title,
        description: editingCard.description,
        priority: editingCard.priority,
        contact_id: editingCard.contact_id,
        company_id: editingCard.company_id,
        due_date: editingCard.due_date,
        amount: editingCard.amount,
      });
      setEditCardDialogOpen(false);
      setEditingCard(null);
      loadBoard();
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!window.confirm('Karte wirklich löschen?')) return;
    
    try {
      await kanbanService.deleteCard(cardId);
      loadBoard();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleCardClick = async (card: KanbanCard) => {
    try {
      const fullCard = await kanbanService.getCardById(card.id);
      setSelectedCard(fullCard);
      setCardDetailOpen(true);
    } catch (err) {
      console.error('Error loading card details:', err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatRelativeDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;
    if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
    if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`;
    return `vor ${Math.floor(diffDays / 365)} Jahren`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
        <CircularProgress />
        {isCreatingGewerkBoard && gewerk && (
          <Typography color="text.secondary">
            Erstelle {GEWERK_CONFIG[gewerk]?.name || gewerk} Board...
          </Typography>
        )}
      </Box>
    );
  }

  if (error || !board) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || 'Board nicht gefunden'}</Alert>
        <Button onClick={() => navigate(gewerk ? '/projects' : '/kanban-boards')} sx={{ mt: 2 }}>
          {gewerk ? 'Zurück zu Projekte' : 'Zurück zur Übersicht'}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(gewerk ? '/projects' : '/kanban-boards')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            {board.name}
          </Typography>
          {board.description && (
            <Typography variant="body2" color="text.secondary">
              {board.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={() => setNewColumnDialogOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Spalte hinzufügen
          </Button>
          <Tooltip title="Pipeline-Einstellungen">
            <IconButton onClick={() => setPipelineSettingsOpen(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Kanban Board */}
      <Box sx={{ 
        flex: 1, 
        overflowX: 'hidden', // Never scroll - all columns always visible
        overflowY: 'hidden',
        p: 2,
        display: 'flex',
        gap: 1,
        alignItems: 'flex-start',
      }}>
        {board.columns.map((column) => (
          <Box
            key={column.id}
            sx={{
              flex: 1, // Equal distribution
              minWidth: 0, // Allow shrinking
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
            }}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <Paper
              sx={{
                p: 1.5,
                mb: 1,
                borderTop: `3px solid ${column.color || '#1976D2'}`,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight={600}
                    sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {column.name}
                  </Typography>
                  <Badge 
                    badgeContent={column.cards.length} 
                    color="primary"
                    sx={{ 
                      flexShrink: 0,
                      '& .MuiBadge-badge': { 
                        bgcolor: column.color || theme.palette.primary.main,
                        color: 'white',
                      } 
                    }}
                  />
                </Box>
                <Box sx={{ flexShrink: 0, display: 'flex' }}>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      setColorPickerAnchor(e.currentTarget);
                      setEditingColumnColor(column.id);
                    }}
                  >
                    <ColorIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      setColumnMenuAnchor(e.currentTarget);
                      setSelectedColumnId(column.id);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Cards Container */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                minHeight: 200,
                p: 0.5,
                bgcolor: dragOverColumn === column.id 
                  ? alpha(column.color || theme.palette.primary.main, 0.1)
                  : 'transparent',
                borderRadius: 1,
                transition: 'background-color 0.2s ease',
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: alpha(theme.palette.divider, 0.3),
                  borderRadius: 3,
                },
              }}
            >
              {column.cards.map((card, index) => (
                <Paper
                  key={card.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, card, column.id, index)}
                  onClick={() => handleCardClick(card)}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    cursor: 'grab',
                    borderLeft: `3px solid ${PRIORITY_COLORS[card.priority || 'medium']}`,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                      transform: 'translateY(-2px)',
                    },
                    '&:active': {
                      cursor: 'grabbing',
                      opacity: 0.8,
                    },
                  }}
                >
                  {/* Card Title */}
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    {card.title}
                  </Typography>
                  
                  {/* Card Meta */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {/* Company */}
                    {card.company_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {card.company_name}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Contact */}
                    {card.contact_name && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {card.contact_name}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Due Date */}
                    {card.due_date && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(card.due_date)}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Amount */}
                    {card.amount && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MoneyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {card.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Footer */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mt: 1,
                    pt: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip 
                        size="small" 
                        label={PRIORITY_LABELS[card.priority || 'medium']}
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: alpha(PRIORITY_COLORS[card.priority || 'medium'], 0.1),
                          color: PRIORITY_COLORS[card.priority || 'medium'],
                        }}
                      />
                    </Box>
                    {card.assigned_to_name && (
                      <Tooltip title={card.assigned_to_name}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {card.assigned_to_name.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    )}
                  </Box>
                  
                  {/* Last Activity */}
                  {card.last_activity_at && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5, 
                      mt: 1,
                      color: 'text.disabled',
                    }}>
                      <TimeIcon sx={{ fontSize: 12 }} />
                      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                        {formatRelativeDate(card.last_activity_at)}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Quick Actions (HubSpot style) */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 0.5, 
                    mt: 1,
                    pt: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  }}>
                    <Tooltip title="Notiz hinzufügen">
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleCardClick(card); }}
                        sx={{ p: 0.5 }}
                      >
                        <EditIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="E-Mail senden">
                      <IconButton 
                        size="small" 
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.5 }}
                      >
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Anrufen">
                      <IconButton 
                        size="small" 
                        onClick={(e) => e.stopPropagation()}
                        sx={{ p: 0.5 }}
                      >
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Details anzeigen">
                      <IconButton 
                        size="small" 
                        onClick={(e) => { e.stopPropagation(); handleCardClick(card); }}
                        sx={{ p: 0.5 }}
                      >
                        <ViewIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              ))}
              
              {/* Add Card Button */}
              <Button
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewCardColumnId(column.id);
                  setNewCardDialogOpen(true);
                }}
                sx={{ 
                  mt: 1,
                  color: 'text.secondary',
                  justifyContent: 'flex-start',
                  '&:hover': {
                    bgcolor: alpha(column.color || theme.palette.primary.main, 0.1),
                  },
                }}
              >
                Karte hinzufügen
              </Button>
            </Box>
          </Box>
        ))}
        
      </Box>

      {/* Column Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          const col = board.columns.find(c => c.id === selectedColumnId);
          if (col) {
            setEditColumnName(col.name);
            setEditColumnDialogOpen(true);
            setColumnMenuAnchor(null);
          }
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Umbenennen
        </MenuItem>
        <MenuItem 
          onClick={() => selectedColumnId && handleDeleteColumn(selectedColumnId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Löschen
        </MenuItem>
      </Menu>

      {/* Color Picker Popover */}
      <Popover
        open={Boolean(colorPickerAnchor)}
        anchorEl={colorPickerAnchor}
        onClose={() => {
          setColorPickerAnchor(null);
          setEditingColumnColor(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, maxWidth: 200 }}>
          {COLUMN_COLORS.map((color) => (
            <Box
              key={color}
              onClick={() => editingColumnColor && handleUpdateColumnColor(editingColumnColor, color)}
              sx={{
                width: 28,
                height: 28,
                bgcolor: color,
                borderRadius: 1,
                cursor: 'pointer',
                border: `2px solid ${alpha(color, 0.3)}`,
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
            />
          ))}
        </Box>
      </Popover>

      {/* New Column Dialog */}
      <Dialog open={newColumnDialogOpen} onClose={() => setNewColumnDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Neue Spalte</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Spaltenname"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Farbe auswählen:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {COLUMN_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setNewColumnColor(color)}
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: color,
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: newColumnColor === color ? '2px solid white' : '2px solid transparent',
                    boxShadow: newColumnColor === color ? `0 0 0 2px ${color}` : 'none',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewColumnDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateColumn} disabled={!newColumnName.trim()}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Column Dialog */}
      <Dialog open={editColumnDialogOpen} onClose={() => setEditColumnDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Spalte umbenennen</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Spaltenname"
            value={editColumnName}
            onChange={(e) => setEditColumnName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditColumnDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleUpdateColumnName} disabled={!editColumnName.trim()}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Card Dialog */}
      <Dialog open={newCardDialogOpen} onClose={() => setNewCardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Karte</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Titel"
              value={newCardData.title || ''}
              onChange={(e) => setNewCardData({ ...newCardData, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={3}
              value={newCardData.description || ''}
              onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Priorität</InputLabel>
              <Select
                value={newCardData.priority || 'medium'}
                label="Priorität"
                onChange={(e) => setNewCardData({ ...newCardData, priority: e.target.value })}
              >
                <MenuItem value="low">Niedrig</MenuItem>
                <MenuItem value="medium">Mittel</MenuItem>
                <MenuItem value="high">Hoch</MenuItem>
                <MenuItem value="urgent">Dringend</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Unternehmen</InputLabel>
              <Select
                value={newCardData.company_id || ''}
                label="Unternehmen"
                onChange={(e) => setNewCardData({ ...newCardData, company_id: e.target.value as number })}
              >
                <MenuItem value="">Keine Auswahl</MenuItem>
                {companies.map((company) => (
                  <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Kontakt</InputLabel>
              <Select
                value={newCardData.contact_id || ''}
                label="Kontakt"
                onChange={(e) => setNewCardData({ ...newCardData, contact_id: e.target.value as number })}
              >
                <MenuItem value="">Keine Auswahl</MenuItem>
                {contacts.map((contact) => (
                  <MenuItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label="Fälligkeitsdatum"
              InputLabelProps={{ shrink: true }}
              value={newCardData.due_date || ''}
              onChange={(e) => setNewCardData({ ...newCardData, due_date: e.target.value })}
            />
            <TextField
              fullWidth
              type="number"
              label="Betrag (€)"
              value={newCardData.amount || ''}
              onChange={(e) => setNewCardData({ ...newCardData, amount: parseFloat(e.target.value) || undefined })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewCardDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleCreateCard} disabled={!newCardData.title?.trim()}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Card Detail Drawer (HubSpot Style) */}
      <CardDetailDrawer
        card={selectedCard}
        open={cardDetailOpen}
        onClose={() => {
          setCardDetailOpen(false);
          setSelectedCard(null);
        }}
        onUpdate={loadBoard}
        companies={companies}
        contacts={contacts}
      />

      {/* Pipeline Settings Dialog (HubSpot Style) */}
      <PipelineSettingsDialog
        open={pipelineSettingsOpen}
        onClose={() => setPipelineSettingsOpen(false)}
        board={board}
        onUpdate={loadBoard}
      />
    </Box>
  );
}

// ============ PIPELINE SETTINGS DIALOG (HubSpot Style) ============
interface PipelineSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  board: (KanbanBoard & { columns: (KanbanColumn & { cards: KanbanCard[] })[] }) | null;
  onUpdate: () => void;
}

function PipelineSettingsDialog({ open, onClose, board, onUpdate }: PipelineSettingsDialogProps) {
  const theme = useTheme();
  const [columns, setColumns] = useState<(KanbanColumn & { cards: KanbanCard[] })[]>([]);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnColor, setNewColumnColor] = useState(COLUMN_COLORS[0]);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');

  useEffect(() => {
    if (board?.columns) {
      setColumns([...board.columns]);
    }
  }, [board]);

  const handleAddColumn = async () => {
    if (!board || !newColumnName.trim()) return;
    
    try {
      await kanbanService.createColumn(board.id, {
        name: newColumnName.trim(),
        color: newColumnColor,
      });
      setNewColumnName('');
      setNewColumnColor(COLUMN_COLORS[Math.floor(Math.random() * COLUMN_COLORS.length)]);
      onUpdate();
    } catch (err) {
      console.error('Error creating column:', err);
    }
  };

  const handleUpdateColumn = async (columnId: number, name: string, color?: string) => {
    try {
      await kanbanService.updateColumn(columnId, { name, color });
      setEditingColumnId(null);
      setEditingColumnName('');
      onUpdate();
    } catch (err) {
      console.error('Error updating column:', err);
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    const column = columns.find(c => c.id === columnId);
    if (column && column.cards.length > 0) {
      if (!window.confirm(`Diese Spalte enthält ${column.cards.length} Karte(n). Alle Karten werden gelöscht. Fortfahren?`)) {
        return;
      }
    } else {
      if (!window.confirm('Spalte wirklich löschen?')) return;
    }
    
    try {
      await kanbanService.deleteColumn(columnId);
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Fehler beim Löschen');
    }
  };

  if (!board) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon />
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Pipeline-Einstellungen
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {board.name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Verwalten Sie die Phasen (Spalten) Ihrer Pipeline. Ziehen Sie die Phasen per Drag & Drop, um die Reihenfolge zu ändern.
        </Typography>

        {/* Column Headers */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '32px 1fr 120px 80px 80px',
          gap: 2,
          mb: 2,
          px: 1,
        }}>
          <Box />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            NAME DER PHASE
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            FARBE
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} textAlign="center">
            KARTEN
          </Typography>
          <Box />
        </Box>

        {/* Column List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          {columns.map((column, index) => (
            <Paper
              key={column.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '32px 1fr 120px 80px 80px',
                gap: 2,
                alignItems: 'center',
                p: 1.5,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                borderLeft: `3px solid ${column.color || '#1976D2'}`,
                '&:hover': {
                  bgcolor: alpha(theme.palette.action.hover, 0.1),
                },
              }}
            >
              {/* Drag Handle */}
              <IconButton size="small" sx={{ cursor: 'grab' }}>
                <DragIndicatorIcon fontSize="small" />
              </IconButton>

              {/* Column Name */}
              {editingColumnId === column.id ? (
                <TextField
                  size="small"
                  value={editingColumnName}
                  onChange={(e) => setEditingColumnName(e.target.value)}
                  onBlur={() => handleUpdateColumn(column.id, editingColumnName, column.color)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateColumn(column.id, editingColumnName, column.color)}
                  autoFocus
                  sx={{ '& .MuiInputBase-input': { py: 0.5 } }}
                />
              ) : (
                <Typography
                  variant="body2"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEditingColumnId(column.id);
                    setEditingColumnName(column.name);
                  }}
                >
                  {column.name}
                </Typography>
              )}

              {/* Color Selector */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {COLUMN_COLORS.slice(0, 5).map((color) => (
                  <Box
                    key={color}
                    onClick={() => handleUpdateColumn(column.id, column.name, color)}
                    sx={{
                      width: 18,
                      height: 18,
                      bgcolor: color,
                      borderRadius: 0.5,
                      cursor: 'pointer',
                      border: column.color === color ? `2px solid ${theme.palette.background.paper}` : 'none',
                      boxShadow: column.color === color ? `0 0 0 1px ${color}` : 'none',
                      '&:hover': { transform: 'scale(1.2)' },
                    }}
                  />
                ))}
              </Box>

              {/* Card Count */}
              <Typography variant="body2" textAlign="center" color="primary" fontWeight={600}>
                {column.cards.length}
              </Typography>

              {/* Delete Button */}
              <IconButton
                size="small"
                onClick={() => handleDeleteColumn(column.id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Box>

        {/* Add New Column */}
        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderStyle: 'dashed', border: `1px dashed ${theme.palette.divider}` }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Neue Phase hinzufügen
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              size="small"
              label="Name der Phase"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
              sx={{ flex: 1 }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {COLUMN_COLORS.slice(0, 6).map((color) => (
                <Box
                  key={color}
                  onClick={() => setNewColumnColor(color)}
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: color,
                    borderRadius: 0.5,
                    cursor: 'pointer',
                    border: newColumnColor === color ? `2px solid ${theme.palette.background.paper}` : 'none',
                    boxShadow: newColumnColor === color ? `0 0 0 2px ${color}` : 'none',
                    '&:hover': { transform: 'scale(1.1)' },
                  }}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              onClick={handleAddColumn}
              disabled={!newColumnName.trim()}
              startIcon={<AddIcon />}
            >
              Hinzufügen
            </Button>
          </Box>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
        <Button onClick={onClose}>Schließen</Button>
      </DialogActions>
    </Dialog>
  );
}

// ============ CARD DETAIL DRAWER (HubSpot Style) ============
interface CardDetailDrawerProps {
  card: KanbanCard | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  companies: any[];
  contacts: any[];
}

function CardDetailDrawer({ card, open, onClose, onUpdate, companies, contacts }: CardDetailDrawerProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('overview');
  const [newNote, setNewNote] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  
  useEffect(() => {
    if (card?.activities) {
      setActivities(card.activities);
    }
  }, [card]);

  const handleAddNote = async () => {
    if (!card || !newNote.trim()) return;
    
    try {
      await kanbanService.addActivity(card.id, {
        activity_type: 'note',
        content: newNote.trim(),
      });
      setNewNote('');
      // Reload activities
      const updatedCard = await kanbanService.getCardById(card.id);
      setActivities(updatedCard.activities);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'note': return <EditIcon />;
      case 'email': return <EmailIcon />;
      case 'call': return <PhoneIcon />;
      case 'status_change': return <DragIndicatorIcon />;
      default: return <TimeIcon />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'note': return 'Notiz';
      case 'email': return 'E-Mail';
      case 'call': return 'Anruf';
      case 'task': return 'Aufgabe';
      case 'meeting': return 'Meeting';
      case 'status_change': return 'Status geändert';
      case 'created': return 'Erstellt';
      default: return type;
    }
  };

  if (!card) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={onClose}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {card.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {card.column_name} • {card.board_name}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex' }}>
        {/* Left Panel - Main Content */}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          {/* Tabs */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Button
              onClick={() => setActiveTab('overview')}
              sx={{ 
                borderBottom: activeTab === 'overview' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                pb: 1,
              }}
            >
              Überblick
            </Button>
            <Button
              onClick={() => setActiveTab('activities')}
              sx={{ 
                borderBottom: activeTab === 'activities' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                pb: 1,
              }}
            >
              Aktivitäten
            </Button>
          </Box>

          {activeTab === 'overview' && (
            <Box>
              {/* Data Highlights */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Datenhighlights
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 2, 
                mb: 4,
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 2,
              }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ERSTELLUNGSDATUM</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {new Date(card.created_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">STATUS</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {card.column_name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">LETZTE AKTIVITÄT</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {card.last_activity_at 
                      ? new Date(card.last_activity_at).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : '-'
                    }
                  </Typography>
                </Box>
              </Box>

              {/* Quick Actions */}
              <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                <Button variant="outlined" size="small" startIcon={<EditIcon />}>Notiz</Button>
                <Button variant="outlined" size="small" startIcon={<EmailIcon />}>E-Mail</Button>
                <Button variant="outlined" size="small" startIcon={<PhoneIcon />}>Anruf</Button>
                <Button variant="outlined" size="small" startIcon={<CalendarIcon />}>Meeting</Button>
              </Box>

              {/* Recent Activities */}
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Kürzliche Aktivitäten
              </Typography>
              
              {/* Add Note */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="In Aktivitäten suchen oder Notiz hinzufügen..."
                  size="small"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button variant="contained" onClick={handleAddNote} disabled={!newNote.trim()}>
                  Hinzufügen
                </Button>
              </Box>

              {/* Activities List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activities.map((activity) => (
                  <Box key={activity.id} sx={{ display: 'flex', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      {getActivityIcon(activity.activity_type)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {getActivityLabel(activity.activity_type)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          von {activity.user_name || 'System'}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(activity.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      {activity.content && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {activity.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {activeTab === 'activities' && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Alle Aktivitäten</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {activities.map((activity) => (
                  <Card key={activity.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                          {getActivityIcon(activity.activity_type)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {getActivityLabel(activity.activity_type)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              {new Date(activity.created_at).toLocaleString('de-DE')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            von {activity.user_name || 'System'}
                          </Typography>
                          {activity.content && (
                            <Typography variant="body1" sx={{ mt: 1 }}>
                              {activity.content}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Panel - Details */}
        <Box sx={{ 
          width: 320, 
          borderLeft: `1px solid ${theme.palette.divider}`,
          p: 2,
          overflowY: 'auto',
        }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Details
          </Typography>
          
          {/* Priority */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Priorität</Typography>
            <Chip 
              size="small" 
              label={PRIORITY_LABELS[card.priority || 'medium']}
              sx={{ 
                mt: 0.5,
                bgcolor: alpha(PRIORITY_COLORS[card.priority || 'medium'], 0.1),
                color: PRIORITY_COLORS[card.priority || 'medium'],
              }}
            />
          </Box>
          
          {/* Assigned To */}
          {card.assigned_to_name && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Zuständig</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {card.assigned_to_name.charAt(0)}
                </Avatar>
                <Typography variant="body2">{card.assigned_to_name}</Typography>
              </Box>
            </Box>
          )}
          
          {/* Due Date */}
          {card.due_date && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Fälligkeitsdatum</Typography>
              <Typography variant="body2">
                {new Date(card.due_date).toLocaleDateString('de-DE')}
              </Typography>
            </Box>
          )}
          
          {/* Amount */}
          {card.amount && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Betrag</Typography>
              <Typography variant="body2" fontWeight={600}>
                {card.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
              </Typography>
            </Box>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Contact */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Kontakt
          </Typography>
          {card.contact_name ? (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <PersonIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">{card.contact_name}</Typography>
              </Box>
              {card.contact_email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <EmailIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                    {card.contact_email}
                  </Typography>
                </Box>
              )}
              {card.contact_phone && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                    {card.contact_phone}
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">Kein Kontakt verknüpft</Typography>
          )}
          
          <Divider sx={{ my: 2 }} />
          
          {/* Company */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
            Unternehmen
          </Typography>
          {card.company_name ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              <Typography variant="body2">{card.company_name}</Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="text.disabled">Kein Unternehmen verknüpft</Typography>
          )}
          
          {/* Description */}
          {card.description && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Beschreibung
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.description}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

