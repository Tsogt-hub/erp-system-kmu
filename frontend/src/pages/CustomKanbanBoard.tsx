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
  Checkbox,
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
  // New icons for HubSpot-style features
  NoteAdd as NoteIcon,
  Event as MeetingIcon,
  Assignment as TaskIcon,
  MoreHoriz as MoreHorizIcon,
  ContentCopy as CopyIcon,
  DriveFileMove as MoveIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Check as CheckIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon,
  CallMade as CallOutIcon,
  CallReceived as CallInIcon,
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

// Activity type configuration
const ACTIVITY_TYPES = {
  note: { label: 'Notiz', icon: NoteIcon, color: '#2196F3' },
  email: { label: 'E-Mail', icon: EmailIcon, color: '#4CAF50' },
  call: { label: 'Anruf', icon: PhoneIcon, color: '#FF9800' },
  call_out: { label: 'Ausgehender Anruf', icon: CallOutIcon, color: '#FF9800' },
  call_in: { label: 'Eingehender Anruf', icon: CallInIcon, color: '#9C27B0' },
  task: { label: 'Aufgabe', icon: TaskIcon, color: '#E91E63' },
  meeting: { label: 'Meeting', icon: MeetingIcon, color: '#00BCD4' },
  status_change: { label: 'Status geändert', icon: DragIndicatorIcon, color: '#607D8B' },
  created: { label: 'Erstellt', icon: AddIcon, color: '#4CAF50' },
};

// Call result options
const CALL_RESULTS = [
  { value: 'contacted', label: 'Kontakt aufgenommen' },
  { value: 'no_answer', label: 'Keine Antwort' },
  { value: 'busy', label: 'Besetzt' },
  { value: 'voicemail', label: 'Mailbox' },
  { value: 'wrong_number', label: 'Falsche Nummer' },
  { value: 'callback', label: 'Rückruf vereinbart' },
];

function CardDetailDrawer({ card, open, onClose, onUpdate, companies, contacts }: CardDetailDrawerProps) {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'tasks' | 'meetings' | 'payments'>('overview');
  const [newNote, setNewNote] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  
  // Local card state for immediate UI updates
  const [localCard, setLocalCard] = useState<KanbanCard | null>(null);
  
  // Use localCard if available, otherwise use prop
  const displayCard = localCard || card;
  
  // Tasks and Meetings states
  const [tasks, setTasks] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingLocation, setNewMeetingLocation] = useState('');
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [showNewPaymentForm, setShowNewPaymentForm] = useState(false);
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentDescription, setNewPaymentDescription] = useState('');
  const [newPaymentDueDate, setNewPaymentDueDate] = useState('');
  
  // Inline editing states
  const [priorityMenuAnchor, setPriorityMenuAnchor] = useState<null | HTMLElement>(null);
  const [amountEditing, setAmountEditing] = useState(false);
  const [dueDateEditing, setDueDateEditing] = useState(false);
  const [tempAmount, setTempAmount] = useState('');
  const [tempDueDate, setTempDueDate] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'pending' | 'paid' | 'overdue'>('pending');
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [editAmount, setEditAmount] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  
  // New states for HubSpot-style features
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<HTMLElement | null>(null);
  const [quickActionMenuAnchor, setQuickActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [activitiesExpanded, setActivitiesExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [newActivityType, setNewActivityType] = useState<string>('note');
  const [newActivityContent, setNewActivityContent] = useState('');
  const [newCallResult, setNewCallResult] = useState('contacted');
  
  // Track card ID to reset local state only when switching cards
  const [currentCardId, setCurrentCardId] = useState<number | null>(null);
  
  useEffect(() => {
    if (card) {
      // Only fully reset if switching to a different card
      if (card.id !== currentCardId) {
        setCurrentCardId(card.id);
        setLocalCard(card);
        setEditTitle(card.title || '');
        setEditDescription(card.description || '');
        setEditPriority((card.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium');
        setEditAmount(card.amount ? String(card.amount) : '');
        setEditDueDate(card.due_date ? card.due_date.split('T')[0] : '');
      }
      // Always update activities
      setActivities(card.activities || []);
    }
  }, [card, currentCardId]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      await kanbanService.updateCard(card.id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        amount: editAmount ? parseFloat(editAmount) : undefined,
        due_date: editDueDate || undefined,
      });
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      console.error('Error updating card:', err);
    } finally {
      setSaving(false);
    }
  };

  // Quick update single field
  const handleQuickUpdate = async (field: string, value: any) => {
    if (!displayCard) return;
    try {
      await kanbanService.updateCard(displayCard.id, { [field]: value });
      
      // Immediately update local state for instant feedback
      setLocalCard((prev) => prev ? { ...prev, [field]: value } : null);
      
      // Also update edit states
      if (field === 'priority') {
        setEditPriority(value);
      } else if (field === 'amount') {
        setEditAmount(String(value));
      } else if (field === 'due_date') {
        setEditDueDate(value);
      }
      
      // Trigger parent update for Kanban board refresh
      onUpdate();
    } catch (err) {
      console.error('Error updating field:', err);
    }
  };

  const handleAddActivity = async (type: string, content: string, metadata?: any) => {
    if (!card || !content.trim()) return;
    
    try {
      await kanbanService.addActivity(card.id, {
        activity_type: type,
        content: content.trim(),
        metadata,
      });
      setNewNote('');
      setNewActivityContent('');
      setAddActivityDialogOpen(false);
      // Reload activities
      const updatedCard = await kanbanService.getCardById(card.id);
      setActivities(updatedCard.activities);
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  const handleAddNote = async () => {
    await handleAddActivity('note', newNote);
  };

  const handleQuickAction = (type: string) => {
    setNewActivityType(type);
    setNewActivityContent('');
    setAddActivityDialogOpen(true);
    setQuickActionMenuAnchor(null);
  };

  const handleDeleteCard = async () => {
    if (!card) return;
    if (!window.confirm('Möchten Sie diesen Deal wirklich löschen?')) return;
    
    try {
      await kanbanService.deleteCard(card.id);
      setActionsMenuAnchor(null);
      onClose();
      onUpdate();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const getActivityIcon = (type: string) => {
    const config = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
    if (config) {
      const IconComponent = config.icon;
      return <IconComponent sx={{ color: config.color, fontSize: 18 }} />;
    }
    return <TimeIcon sx={{ fontSize: 18 }} />;
  };

  const getActivityLabel = (type: string) => {
    const config = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
    return config?.label || type;
  };

  // Group activities by month
  const groupActivitiesByMonth = (activities: any[]) => {
    const grouped: Record<string, any[]> = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      const monthKey = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(activity);
    });
    
    return grouped;
  };

  // Filter activities
  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = activityFilter === 'all' || activity.activity_type === activityFilter;
    const matchesSearch = !searchQuery || 
      activity.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getActivityLabel(activity.activity_type).toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const groupedActivities = groupActivitiesByMonth(filteredActivities);
  const activityCounts = activities.reduce((acc, a) => {
    acc[a.activity_type] = (acc[a.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (!card) return null;

  return (
    <>
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
      {/* Header with Deal Info */}
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        p: 0,
      }}>
        {/* Top Row - Back button, Title, Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          p: 2,
          pb: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            <IconButton onClick={onClose} sx={{ mt: 0.5 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ) : (
                <>
                  <Typography variant="h6" fontWeight={600}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    #{card.id.toString().padStart(8, '0')}
                  </Typography>
                </>
              )}
              
              {/* Pipeline Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">Betrag:</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {card.amount ? card.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '--'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">Abschlussdatum:</Typography>
                  <Typography variant="body2">
                    {card.due_date ? new Date(card.due_date).toLocaleDateString('de-DE') : '--'}
                  </Typography>
                </Box>
                <Chip 
                  size="small" 
                  label={card.board_name}
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), fontSize: '0.7rem' }}
                />
                <Chip 
                  size="small" 
                  label={card.column_name}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
          </Box>
          
          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {isEditing ? (
              <>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Abbrechen
                </Button>
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  size="small" 
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Bearbeiten
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                >
                  Aktionen
                </Button>
              </>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        
        {/* Quick Action Buttons Row */}
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          px: 2, 
          pb: 2,
          ml: 7,
        }}>
          <Tooltip title="Notiz hinzufügen">
            <IconButton 
              size="small" 
              onClick={() => handleQuickAction('note')}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <NoteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="E-Mail senden">
            <IconButton 
              size="small" 
              onClick={() => handleQuickAction('email')}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <EmailIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Anruf protokollieren">
            <IconButton 
              size="small" 
              onClick={() => handleQuickAction('call')}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <PhoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Aufgabe erstellen">
            <IconButton 
              size="small" 
              onClick={() => handleQuickAction('task')}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <TaskIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Meeting planen">
            <IconButton 
              size="small" 
              onClick={() => handleQuickAction('meeting')}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <MeetingIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mehr Aktionen">
            <IconButton 
              size="small" 
              onClick={(e) => setQuickActionMenuAnchor(e.currentTarget)}
              sx={{ 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 1,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      
      {/* Actions Menu */}
      <Menu
        anchorEl={actionsMenuAnchor}
        open={Boolean(actionsMenuAnchor)}
        onClose={() => setActionsMenuAnchor(null)}
      >
        <MenuItem onClick={() => { setActionsMenuAnchor(null); }}>
          <CopyIcon sx={{ mr: 1, fontSize: 18 }} /> Duplizieren
        </MenuItem>
        <MenuItem onClick={() => { setActionsMenuAnchor(null); }}>
          <MoveIcon sx={{ mr: 1, fontSize: 18 }} /> In Pipeline verschieben
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteCard} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Löschen
        </MenuItem>
      </Menu>
      
      {/* Quick Action Menu (More options) */}
      <Menu
        anchorEl={quickActionMenuAnchor}
        open={Boolean(quickActionMenuAnchor)}
        onClose={() => setQuickActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => { handleQuickAction('call_out'); }}>
          <CallOutIcon sx={{ mr: 1, fontSize: 18, color: '#FF9800' }} /> Ausgehender Anruf
        </MenuItem>
        <MenuItem onClick={() => { handleQuickAction('call_in'); }}>
          <CallInIcon sx={{ mr: 1, fontSize: 18, color: '#9C27B0' }} /> Eingehender Anruf
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { setQuickActionMenuAnchor(null); }}>
          <AttachFileIcon sx={{ mr: 1, fontSize: 18 }} /> Datei anhängen
        </MenuItem>
        <MenuItem onClick={() => { setQuickActionMenuAnchor(null); }}>
          <LinkIcon sx={{ mr: 1, fontSize: 18 }} /> Link hinzufügen
        </MenuItem>
      </Menu>

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
            <Button
              onClick={() => setActiveTab('tasks')}
              sx={{ 
                borderBottom: activeTab === 'tasks' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                pb: 1,
              }}
            >
              Aufgaben ({tasks.length})
            </Button>
            <Button
              onClick={() => setActiveTab('meetings')}
              sx={{ 
                borderBottom: activeTab === 'meetings' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                pb: 1,
              }}
            >
              Meetings ({meetings.length})
            </Button>
            <Button
              onClick={() => setActiveTab('payments')}
              sx={{ 
                borderBottom: activeTab === 'payments' ? `2px solid ${theme.palette.primary.main}` : 'none',
                borderRadius: 0,
                pb: 1,
              }}
            >
              Zahlungen ({payments.length})
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

              {/* Recent Activities Section */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2,
              }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  Kürzliche Aktivitäten
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => setActivitiesExpanded(!activitiesExpanded)}
                  endIcon={activitiesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {activitiesExpanded ? 'Alle einklappen' : 'Alle ausklappen'}
                </Button>
              </Box>
              
              {/* Search and Filter Row */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                  placeholder="In Aktivitäten suchen..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                  }}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setAddActivityDialogOpen(true)}
                >
                  Aktivität erstellen
                </Button>
              </Box>
              
              {/* Activity Type Filters */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  Bisher seit Beginn
                </Typography>
                <Chip
                  size="small"
                  label={`(${activities.length}) Aktivität${activities.length !== 1 ? 'en' : ''}`}
                  onClick={() => setActivityFilter('all')}
                  variant={activityFilter === 'all' ? 'filled' : 'outlined'}
                  color={activityFilter === 'all' ? 'primary' : 'default'}
                  onDelete={activityFilter !== 'all' ? () => setActivityFilter('all') : undefined}
                />
                {Object.entries(activityCounts).map(([type, count]) => (
                  <Chip
                    key={type}
                    size="small"
                    label={`${getActivityLabel(type)} (${count})`}
                    onClick={() => setActivityFilter(type)}
                    variant={activityFilter === type ? 'filled' : 'outlined'}
                    color={activityFilter === type ? 'primary' : 'default'}
                    sx={{ fontSize: '0.7rem' }}
                  />
                ))}
              </Box>

              {/* Add Quick Note */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Schnelle Notiz hinzufügen..."
                  size="small"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                />
                <Button 
                  variant="contained" 
                  onClick={handleAddNote} 
                  disabled={!newNote.trim()}
                  sx={{
                    minWidth: 130,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    py: 1,
                    bgcolor: theme.palette.primary.main,
                    color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,113,227,0.3)',
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: '0 4px 12px rgba(0,113,227,0.4)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.primary.main, 0.5),
                      color: 'rgba(255, 255, 255, 0.9)',
                      boxShadow: 'none',
                    },
                  }}
                >
                  Hinzufügen
                </Button>
              </Box>

              {/* Grouped Activities List */}
              {activitiesExpanded && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {Object.entries(groupedActivities).map(([monthKey, monthActivities]) => (
                    <Box key={monthKey}>
                      {/* Month Header */}
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2, 
                          pb: 1, 
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          textTransform: 'capitalize',
                        }}
                      >
                        {monthKey}
                      </Typography>
                      
                      {/* Activities for this month */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {monthActivities.map((activity: any) => (
                          <Box 
                            key={activity.id} 
                            sx={{ 
                              display: 'flex', 
                              gap: 2,
                              p: 1.5,
                              borderRadius: 1,
                              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) },
                            }}
                          >
                            <Avatar 
                              sx={{ 
                                width: 36, 
                                height: 36, 
                                bgcolor: alpha(
                                  ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES]?.color || theme.palette.primary.main, 
                                  0.1
                                ),
                              }}
                            >
                              {getActivityIcon(activity.activity_type)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                  {getActivityLabel(activity.activity_type)}
                                  {activity.metadata?.result && (
                                    <Typography component="span" variant="body2" color="text.secondary">
                                      {' - '}{CALL_RESULTS.find(r => r.value === activity.metadata.result)?.label || activity.metadata.result}
                                    </Typography>
                                  )}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  von {activity.user_name || 'System'}
                                </Typography>
                                <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
                                  {new Date(activity.created_at).toLocaleDateString('de-DE', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })} um {new Date(activity.created_at).toLocaleTimeString('de-DE', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} GMT+1
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
                  ))}
                  
                  {filteredActivities.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Keine Aktivitäten gefunden.
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === 'activities' && (
            <Box>
              {/* Header with filters */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Alle Aktivitäten</Typography>
                <Button 
                  variant="contained" 
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => setAddActivityDialogOpen(true)}
                >
                  Aktivität hinzufügen
                </Button>
              </Box>
              
              {/* Search */}
              <TextField
                fullWidth
                placeholder="Aktivitäten durchsuchen..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />,
                }}
                sx={{ mb: 3 }}
              />
              
              {/* Filter Chips */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  size="small"
                  label={`Alle (${activities.length})`}
                  onClick={() => setActivityFilter('all')}
                  variant={activityFilter === 'all' ? 'filled' : 'outlined'}
                  color={activityFilter === 'all' ? 'primary' : 'default'}
                />
                {Object.entries(activityCounts).map(([type, count]) => {
                  const config = ACTIVITY_TYPES[type as keyof typeof ACTIVITY_TYPES];
                  return (
                    <Chip
                      key={type}
                      size="small"
                      icon={config ? <config.icon sx={{ fontSize: 14 }} /> : undefined}
                      label={`${getActivityLabel(type)} (${count})`}
                      onClick={() => setActivityFilter(type)}
                      variant={activityFilter === type ? 'filled' : 'outlined'}
                      color={activityFilter === type ? 'primary' : 'default'}
                    />
                  );
                })}
              </Box>
              
              {/* Grouped Activities */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Object.entries(groupedActivities).map(([monthKey, monthActivities]) => (
                  <Box key={monthKey}>
                    {/* Month Header */}
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={600}
                      sx={{ 
                        mb: 2, 
                        pb: 1, 
                        borderBottom: `2px solid ${theme.palette.primary.main}`,
                        textTransform: 'capitalize',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <CalendarIcon sx={{ fontSize: 18 }} />
                      {monthKey}
                      <Chip 
                        size="small" 
                        label={monthActivities.length} 
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    </Typography>
                    
                    {/* Activities Cards */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {monthActivities.map((activity: any) => {
                        const config = ACTIVITY_TYPES[activity.activity_type as keyof typeof ACTIVITY_TYPES];
                        return (
                          <Card key={activity.id} variant="outlined" sx={{ 
                            borderLeft: `3px solid ${config?.color || theme.palette.primary.main}`,
                          }}>
                            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Avatar sx={{ 
                                  bgcolor: alpha(config?.color || theme.palette.primary.main, 0.1),
                                  width: 40,
                                  height: 40,
                                }}>
                                  {getActivityIcon(activity.activity_type)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Box>
                                      <Typography variant="subtitle2" fontWeight={600}>
                                        {getActivityLabel(activity.activity_type)}
                                        {activity.metadata?.result && (
                                          <Chip 
                                            size="small" 
                                            label={CALL_RESULTS.find(r => r.value === activity.metadata.result)?.label}
                                            sx={{ ml: 1, height: 20, fontSize: '0.65rem' }}
                                            color={activity.metadata.result === 'contacted' ? 'success' : 'default'}
                                          />
                                        )}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        von {activity.user_name || 'System'}
                                      </Typography>
                                    </Box>
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
                                    <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                                      {activity.content}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
                
                {filteredActivities.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TimeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Keine Aktivitäten gefunden.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ mt: 2 }}
                      startIcon={<AddIcon />}
                      onClick={() => setAddActivityDialogOpen(true)}
                    >
                      Erste Aktivität hinzufügen
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Aufgaben</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewTaskForm(true)}
                  size="small"
                >
                  Aufgabe erstellen
                </Button>
              </Box>

              {/* New Task Form */}
              {showNewTaskForm && (
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Neue Aufgabe
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Aufgabentitel"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      type="date"
                      size="small"
                      label="Fälligkeitsdatum"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <FormControl size="small" sx={{ flex: 1 }}>
                      <InputLabel>Priorität</InputLabel>
                      <Select
                        value={newTaskPriority}
                        label="Priorität"
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      >
                        <MenuItem value="low">Niedrig</MenuItem>
                        <MenuItem value="medium">Mittel</MenuItem>
                        <MenuItem value="high">Hoch</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button onClick={() => {
                      setShowNewTaskForm(false);
                      setNewTaskTitle('');
                      setNewTaskDueDate('');
                      setNewTaskPriority('medium');
                    }}>
                      Abbrechen
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => {
                        if (newTaskTitle.trim()) {
                          setTasks([...tasks, {
                            id: Date.now(),
                            title: newTaskTitle,
                            due_date: newTaskDueDate,
                            priority: newTaskPriority,
                            status: 'pending',
                            created_at: new Date().toISOString(),
                          }]);
                          setShowNewTaskForm(false);
                          setNewTaskTitle('');
                          setNewTaskDueDate('');
                          setNewTaskPriority('medium');
                        }
                      }}
                    >
                      Erstellen
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Tasks List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {tasks.map((task) => (
                  <Card key={task.id} variant="outlined" sx={{ 
                    borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || '#1976D2'}`,
                  }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Checkbox 
                          checked={task.status === 'completed'}
                          onChange={() => {
                            setTasks(tasks.map(t => 
                              t.id === task.id 
                                ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' }
                                : t
                            ));
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body1" 
                            fontWeight={500}
                            sx={{ 
                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              color: task.status === 'completed' ? 'text.disabled' : 'text.primary',
                            }}
                          >
                            {task.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            {task.due_date && (
                              <Chip 
                                size="small" 
                                icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                                label={new Date(task.due_date).toLocaleDateString('de-DE')}
                              />
                            )}
                            <Chip 
                              size="small" 
                              label={PRIORITY_LABELS[task.priority]}
                              sx={{ 
                                bgcolor: alpha(PRIORITY_COLORS[task.priority], 0.1),
                                color: PRIORITY_COLORS[task.priority],
                              }}
                            />
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {tasks.length === 0 && !showNewTaskForm && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <TaskIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Keine Aufgaben vorhanden
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                      Erstellen Sie Aufgaben, um den Fortschritt zu verfolgen
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewTaskForm(true)}
                    >
                      Erste Aufgabe erstellen
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Meetings Tab */}
          {activeTab === 'meetings' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Meetings</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewMeetingForm(true)}
                  size="small"
                >
                  Meeting planen
                </Button>
              </Box>

              {/* New Meeting Form */}
              {showNewMeetingForm && (
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Neues Meeting
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Meeting-Titel"
                    value={newMeetingTitle}
                    onChange={(e) => setNewMeetingTitle(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      type="date"
                      size="small"
                      label="Datum"
                      value={newMeetingDate}
                      onChange={(e) => setNewMeetingDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      type="time"
                      size="small"
                      label="Uhrzeit"
                      value={newMeetingTime}
                      onChange={(e) => setNewMeetingTime(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ort (optional)"
                    value={newMeetingLocation}
                    onChange={(e) => setNewMeetingLocation(e.target.value)}
                    placeholder="z.B. Büro, Online, ..."
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button onClick={() => {
                      setShowNewMeetingForm(false);
                      setNewMeetingTitle('');
                      setNewMeetingDate('');
                      setNewMeetingTime('');
                      setNewMeetingLocation('');
                    }}>
                      Abbrechen
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => {
                        if (newMeetingTitle.trim() && newMeetingDate) {
                          setMeetings([...meetings, {
                            id: Date.now(),
                            title: newMeetingTitle,
                            date: newMeetingDate,
                            time: newMeetingTime,
                            location: newMeetingLocation,
                            status: 'scheduled',
                            created_at: new Date().toISOString(),
                          }]);
                          setShowNewMeetingForm(false);
                          setNewMeetingTitle('');
                          setNewMeetingDate('');
                          setNewMeetingTime('');
                          setNewMeetingLocation('');
                        }
                      }}
                    >
                      Erstellen
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Meetings List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {meetings.map((meeting) => (
                  <Card key={meeting.id} variant="outlined" sx={{ 
                    borderLeft: `3px solid ${theme.palette.secondary.main}`,
                  }}>
                    <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                          <MeetingIcon sx={{ color: theme.palette.secondary.main }} />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" fontWeight={600}>
                            {meeting.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                            <Chip 
                              size="small" 
                              icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                              label={new Date(meeting.date).toLocaleDateString('de-DE', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            />
                            {meeting.time && (
                              <Chip 
                                size="small" 
                                icon={<TimeIcon sx={{ fontSize: 14 }} />}
                                label={meeting.time}
                              />
                            )}
                            {meeting.location && (
                              <Chip 
                                size="small" 
                                icon={<LocationIcon sx={{ fontSize: 14 }} />}
                                label={meeting.location}
                              />
                            )}
                          </Box>
                        </Box>
                        <Chip 
                          size="small"
                          label={meeting.status === 'scheduled' ? 'Geplant' : 'Abgeschlossen'}
                          color={meeting.status === 'scheduled' ? 'info' : 'success'}
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => setMeetings(meetings.filter(m => m.id !== meeting.id))}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                ))}

                {meetings.length === 0 && !showNewMeetingForm && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <MeetingIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Keine Meetings geplant
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                      Planen Sie Meetings mit Kunden oder dem Team
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewMeetingForm(true)}
                    >
                      Erstes Meeting planen
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Zahlungen & Rechnungen</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setShowNewPaymentForm(true)}
                  size="small"
                >
                  Zahlung hinzufügen
                </Button>
              </Box>

              {/* Payment Summary */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: 2, 
                mb: 3,
              }}>
                <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">Bezahlt</Typography>
                    <Typography variant="h6" color="success.main" fontWeight={600}>
                      {payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">Ausstehend</Typography>
                    <Typography variant="h6" color="warning.main" fontWeight={600}>
                      {payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined" sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography variant="caption" color="text.secondary">Überfällig</Typography>
                    <Typography variant="h6" color="error.main" fontWeight={600}>
                      {payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + parseFloat(p.amount || 0), 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>

              {/* New Payment Form */}
              {showNewPaymentForm && (
                <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                    Neue Zahlung erfassen
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Beschreibung"
                    value={newPaymentDescription}
                    onChange={(e) => setNewPaymentDescription(e.target.value)}
                    placeholder="z.B. Anzahlung, Schlussrechnung..."
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      type="number"
                      size="small"
                      label="Betrag"
                      value={newPaymentAmount}
                      onChange={(e) => setNewPaymentAmount(e.target.value)}
                      InputProps={{
                        endAdornment: <Typography variant="caption">€</Typography>,
                      }}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      type="date"
                      size="small"
                      label="Fälligkeitsdatum"
                      value={newPaymentDueDate}
                      onChange={(e) => setNewPaymentDueDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                  <FormControl size="small" fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newPaymentStatus}
                      label="Status"
                      onChange={(e) => setNewPaymentStatus(e.target.value as any)}
                    >
                      <MenuItem value="pending">Ausstehend</MenuItem>
                      <MenuItem value="paid">Bezahlt</MenuItem>
                      <MenuItem value="overdue">Überfällig</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button onClick={() => {
                      setShowNewPaymentForm(false);
                      setNewPaymentAmount('');
                      setNewPaymentDescription('');
                      setNewPaymentDueDate('');
                      setNewPaymentStatus('pending');
                    }}>
                      Abbrechen
                    </Button>
                    <Button 
                      variant="contained"
                      onClick={() => {
                        if (newPaymentAmount && newPaymentDescription) {
                          setPayments([...payments, {
                            id: Date.now(),
                            amount: newPaymentAmount,
                            description: newPaymentDescription,
                            due_date: newPaymentDueDate,
                            status: newPaymentStatus,
                            created_at: new Date().toISOString(),
                          }]);
                          setShowNewPaymentForm(false);
                          setNewPaymentAmount('');
                          setNewPaymentDescription('');
                          setNewPaymentDueDate('');
                          setNewPaymentStatus('pending');
                        }
                      }}
                    >
                      Speichern
                    </Button>
                  </Box>
                </Card>
              )}

              {/* Payments List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {payments.map((payment) => {
                  const statusColors = {
                    pending: theme.palette.warning.main,
                    paid: theme.palette.success.main,
                    overdue: theme.palette.error.main,
                  };
                  const statusLabels = {
                    pending: 'Ausstehend',
                    paid: 'Bezahlt',
                    overdue: 'Überfällig',
                  };
                  return (
                    <Card key={payment.id} variant="outlined" sx={{ 
                      borderLeft: `3px solid ${statusColors[payment.status as keyof typeof statusColors]}`,
                    }}>
                      <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha(statusColors[payment.status as keyof typeof statusColors], 0.1) }}>
                            <MoneyIcon sx={{ color: statusColors[payment.status as keyof typeof statusColors] }} />
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Typography variant="body1" fontWeight={600}>
                                  {payment.description}
                                </Typography>
                                <Typography variant="h6" fontWeight={700} sx={{ color: statusColors[payment.status as keyof typeof statusColors] }}>
                                  {parseFloat(payment.amount).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: 'right' }}>
                                <Chip 
                                  size="small"
                                  label={statusLabels[payment.status as keyof typeof statusLabels]}
                                  sx={{
                                    bgcolor: alpha(statusColors[payment.status as keyof typeof statusColors], 0.1),
                                    color: statusColors[payment.status as keyof typeof statusColors],
                                  }}
                                />
                                {payment.due_date && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    Fällig: {new Date(payment.due_date).toLocaleDateString('de-DE')}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {payment.status !== 'paid' && (
                              <Button 
                                size="small" 
                                variant="outlined"
                                color="success"
                                onClick={() => {
                                  setPayments(payments.map(p => 
                                    p.id === payment.id ? { ...p, status: 'paid' } : p
                                  ));
                                }}
                              >
                                Als bezahlt markieren
                              </Button>
                            )}
                            <IconButton 
                              size="small" 
                              onClick={() => setPayments(payments.filter(p => p.id !== payment.id))}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}

                {payments.length === 0 && !showNewPaymentForm && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <MoneyIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      Keine Zahlungen erfasst
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                      Verfolgen Sie Anzahlungen, Rechnungen und Zahlungen
                    </Typography>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />}
                      onClick={() => setShowNewPaymentForm(true)}
                    >
                      Erste Zahlung hinzufügen
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        {/* Right Panel - HubSpot Style Associations */}
        <Box sx={{ 
          width: 360, 
          borderLeft: `1px solid ${theme.palette.divider}`,
          overflowY: 'auto',
          bgcolor: alpha(theme.palette.background.default, 0.5),
        }}>
          {/* Contacts Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Kontakte ({card.contact_name ? 1 : 0})
              </Typography>
              <Button size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>
                Hinzufügen
              </Button>
            </Box>
            {card.contact_name ? (
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                      {card.contact_name.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {card.contact_name}
                      </Typography>
                      {card.contact_email && (
                        <Typography variant="caption" color="primary" noWrap sx={{ cursor: 'pointer' }}>
                          {card.contact_email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {card.contact_phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, ml: 6 }}>
                      <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {card.contact_phone}
                      </Typography>
                    </Box>
                  )}
                  <Button size="small" sx={{ mt: 1, fontSize: '0.7rem' }}>
                    Zuordnungslabel hinzufügen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <PersonIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                <Typography variant="caption" color="text.disabled" display="block">
                  Zeigen Sie die Kontakte an, die mit diesem Datensatz verknüpft sind.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Company Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Unternehmen ({card.company_name ? 1 : 0})
              </Typography>
              <Button size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>
                Hinzufügen
              </Button>
            </Box>
            {card.company_name ? (
              <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main' }}>
                      <BusinessIcon sx={{ fontSize: 20 }} />
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                      {card.company_name}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <BusinessIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
                <Typography variant="caption" color="text.disabled" display="block">
                  Zeigen Sie die Unternehmen an, die mit diesem Datensatz verknüpft sind.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Tickets Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Tickets (0)
              </Typography>
              <Button size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>
                Hinzufügen
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <TaskIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.disabled" display="block">
                Verfolgen Sie die mit diesem Datensatz verbundenen Kundenanfragen.
              </Typography>
            </Box>
          </Box>

          {/* Deals Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Deals (0)
              </Typography>
              <Button size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>
                Hinzufügen
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <MoneyIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.disabled" display="block">
                Verfolgen Sie die mit diesem Datensatz verbundenen Opportunities.
              </Typography>
            </Box>
          </Box>

          {/* Attachments Section */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Anhänge (0)
              </Typography>
              <Button size="small" startIcon={<AddIcon />} sx={{ fontSize: '0.75rem' }}>
                Hinzufügen
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <AttachFileIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="caption" color="text.disabled" display="block">
                Kürzlich hochgeladen
              </Typography>
            </Box>
          </Box>

          {/* Details Section */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
              Details über: Deal
            </Typography>
            
            {/* Deal Type */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Deal-Typ</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.custom_fields?.deal_type || '--'}
              </Typography>
            </Box>

            {/* Phone */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Telefonnummer</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.contact_phone || card.custom_fields?.phone || '--'}
              </Typography>
            </Box>

            {/* Address */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Adresse</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.custom_fields?.street || '--'}
              </Typography>
            </Box>

            {/* Assigned To */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Für Deal zuständiger Mitarbeiter</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.assigned_to_name || '--'}
              </Typography>
            </Box>

            {/* City */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Stadt</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.custom_fields?.city || '--'}
              </Typography>
            </Box>

            {/* Postal Code */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Postleitzahl</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.custom_fields?.postal_code || '--'}
              </Typography>
            </Box>

            {/* Priority - Editable */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Priorität</Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  size="small" 
                  label={PRIORITY_LABELS[displayCard.priority || 'medium']}
                  onClick={(e) => setPriorityMenuAnchor(e.currentTarget)}
                  sx={{ 
                    bgcolor: alpha(PRIORITY_COLORS[displayCard.priority || 'medium'], 0.1),
                    color: PRIORITY_COLORS[displayCard.priority || 'medium'],
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: alpha(PRIORITY_COLORS[displayCard.priority || 'medium'], 0.2),
                    },
                  }}
                  icon={<EditIcon sx={{ fontSize: 14 }} />}
                />
                <Menu
                  anchorEl={priorityMenuAnchor}
                  open={Boolean(priorityMenuAnchor)}
                  onClose={() => setPriorityMenuAnchor(null)}
                >
                  {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                    <MenuItem 
                      key={priority}
                      selected={displayCard.priority === priority}
                      onClick={() => {
                        handleQuickUpdate('priority', priority);
                        setPriorityMenuAnchor(null);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: '50%', 
                          bgcolor: PRIORITY_COLORS[priority],
                        }} 
                      />
                      {PRIORITY_LABELS[priority]}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            {/* Amount - Editable */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Betrag</Typography>
              {amountEditing ? (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <TextField
                    size="small"
                    type="number"
                    value={tempAmount}
                    onChange={(e) => setTempAmount(e.target.value)}
                    autoFocus
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: <Typography variant="caption">€</Typography>,
                    }}
                  />
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      handleQuickUpdate('amount', parseFloat(tempAmount) || 0);
                      setAmountEditing(false);
                    }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => setAmountEditing(false)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  sx={{ 
                    mt: 0.5, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={() => {
                    setTempAmount(displayCard.amount ? String(displayCard.amount) : '');
                    setAmountEditing(true);
                  }}
                >
                  {displayCard.amount ? displayCard.amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '--'}
                  <EditIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                </Typography>
              )}
            </Box>

            {/* Due Date - Editable */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Abschlussdatum</Typography>
              {dueDateEditing ? (
                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                  <TextField
                    size="small"
                    type="date"
                    value={tempDueDate}
                    onChange={(e) => setTempDueDate(e.target.value)}
                    autoFocus
                    sx={{ flex: 1 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => {
                      handleQuickUpdate('due_date', tempDueDate || null);
                      setDueDateEditing(false);
                    }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => setDueDateEditing(false)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 0.5, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    '&:hover': { color: 'primary.main' },
                  }}
                  onClick={() => {
                    setTempDueDate(displayCard.due_date ? displayCard.due_date.split('T')[0] : '');
                    setDueDateEditing(true);
                  }}
                >
                  {displayCard.due_date ? new Date(displayCard.due_date).toLocaleDateString('de-DE') : '--'}
                  <EditIcon sx={{ fontSize: 14, opacity: 0.5 }} />
                </Typography>
              )}
            </Box>

            {/* Last Contact */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Letzte Kontaktaufnahme</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.last_activity_at 
                  ? new Date(card.last_activity_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) + ' GMT+1'
                  : '--'
                }
              </Typography>
            </Box>

            {/* Additional Info */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">Zusatz-Infos</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.custom_fields?.additional_info || '--'}
              </Typography>
            </Box>

            {/* Description */}
            <Box>
              <Typography variant="caption" color="text.secondary">Beschreibung</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {card.description || '--'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
    
    {/* Add Activity Dialog */}
    <Dialog 
      open={addActivityDialogOpen} 
      onClose={() => setAddActivityDialogOpen(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getActivityIcon(newActivityType)}
          <Typography variant="h6">
            {getActivityLabel(newActivityType)} hinzufügen
          </Typography>
        </Box>
        <IconButton onClick={() => setAddActivityDialogOpen(false)}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        {/* Activity Type Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Aktivitätstyp</InputLabel>
          <Select
            value={newActivityType}
            label="Aktivitätstyp"
            onChange={(e) => setNewActivityType(e.target.value)}
          >
            <MenuItem value="note">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NoteIcon sx={{ color: '#2196F3', fontSize: 18 }} /> Notiz
              </Box>
            </MenuItem>
            <MenuItem value="email">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon sx={{ color: '#4CAF50', fontSize: 18 }} /> E-Mail
              </Box>
            </MenuItem>
            <MenuItem value="call">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#FF9800', fontSize: 18 }} /> Anruf
              </Box>
            </MenuItem>
            <MenuItem value="call_out">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CallOutIcon sx={{ color: '#FF9800', fontSize: 18 }} /> Ausgehender Anruf
              </Box>
            </MenuItem>
            <MenuItem value="call_in">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CallInIcon sx={{ color: '#9C27B0', fontSize: 18 }} /> Eingehender Anruf
              </Box>
            </MenuItem>
            <MenuItem value="task">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TaskIcon sx={{ color: '#E91E63', fontSize: 18 }} /> Aufgabe
              </Box>
            </MenuItem>
            <MenuItem value="meeting">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MeetingIcon sx={{ color: '#00BCD4', fontSize: 18 }} /> Meeting
              </Box>
            </MenuItem>
          </Select>
        </FormControl>
        
        {/* Call Result (only for call types) */}
        {(newActivityType === 'call' || newActivityType === 'call_out' || newActivityType === 'call_in') && (
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Anruf-Ergebnis</InputLabel>
            <Select
              value={newCallResult}
              label="Anruf-Ergebnis"
              onChange={(e) => setNewCallResult(e.target.value)}
            >
              {CALL_RESULTS.map((result) => (
                <MenuItem key={result.value} value={result.value}>
                  {result.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {/* Activity Content */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Beschreibung / Notizen"
          placeholder={
            newActivityType === 'note' ? 'Notiz eingeben...' :
            newActivityType === 'email' ? 'E-Mail-Zusammenfassung eingeben...' :
            newActivityType.includes('call') ? 'Gesprächsnotizen eingeben...' :
            newActivityType === 'task' ? 'Aufgabenbeschreibung eingeben...' :
            newActivityType === 'meeting' ? 'Meeting-Notizen eingeben...' :
            'Beschreibung eingeben...'
          }
          value={newActivityContent}
          onChange={(e) => setNewActivityContent(e.target.value)}
        />
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button onClick={() => setAddActivityDialogOpen(false)}>
          Abbrechen
        </Button>
        <Button 
          variant="contained" 
          onClick={() => {
            const metadata = (newActivityType === 'call' || newActivityType === 'call_out' || newActivityType === 'call_in')
              ? { result: newCallResult }
              : undefined;
            handleAddActivity(newActivityType, newActivityContent, metadata);
          }}
          disabled={!newActivityContent.trim()}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

