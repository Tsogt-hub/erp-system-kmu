import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Dashboard as BoardIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ViewKanban as KanbanIcon,
  TrendingUp as SalesIcon,
  Folder as ProjectIcon,
  Settings as CustomIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { kanbanService, KanbanBoard, CreateBoardData } from '../services/kanban.service';

const BOARD_TYPE_CONFIG = {
  sales: {
    label: 'Sales Pipeline',
    icon: SalesIcon,
    color: '#4CAF50',
    description: 'Für Verkaufsprozesse und Deal-Tracking',
  },
  project: {
    label: 'Projektmanagement',
    icon: ProjectIcon,
    color: '#2196F3',
    description: 'Für Projektaufgaben und Workflows',
  },
  custom: {
    label: 'Individuell',
    icon: CustomIcon,
    color: '#9C27B0',
    description: 'Freie Konfiguration für individuelle Prozesse',
  },
};

export default function KanbanBoards() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [boards, setBoards] = useState<KanbanBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create Dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newBoardData, setNewBoardData] = useState<CreateBoardData>({
    name: '',
    description: '',
    board_type: 'custom',
  });
  
  // Edit Dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<KanbanBoard | null>(null);
  
  // Menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    setLoading(true);
    try {
      const data = await kanbanService.getAllBoards();
      setBoards(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Boards konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!newBoardData.name.trim()) return;
    
    try {
      await kanbanService.createBoard(newBoardData);
      setCreateDialogOpen(false);
      setNewBoardData({ name: '', description: '', board_type: 'custom' });
      loadBoards();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Board konnte nicht erstellt werden');
    }
  };

  const handleUpdateBoard = async () => {
    if (!editingBoard) return;
    
    try {
      await kanbanService.updateBoard(editingBoard.id, {
        name: editingBoard.name,
        description: editingBoard.description,
      });
      setEditDialogOpen(false);
      setEditingBoard(null);
      loadBoards();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Board konnte nicht aktualisiert werden');
    }
  };

  const handleDeleteBoard = async (boardId: number) => {
    if (!window.confirm('Board wirklich löschen? Alle Spalten und Karten werden ebenfalls gelöscht.')) return;
    
    try {
      await kanbanService.deleteBoard(boardId);
      setMenuAnchor(null);
      loadBoards();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Board konnte nicht gelöscht werden');
    }
  };

  const getBoardTypeConfig = (type: string) => {
    return BOARD_TYPE_CONFIG[type as keyof typeof BOARD_TYPE_CONFIG] || BOARD_TYPE_CONFIG.custom;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4 
      }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Kanban Boards
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Erstellen und verwalten Sie Ihre eigenen Kanban Boards
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Neues Board
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Boards Grid */}
      {boards.length === 0 ? (
        <Paper sx={{ 
          p: 6, 
          textAlign: 'center',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}>
          <KanbanIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Noch keine Boards vorhanden
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Erstellen Sie Ihr erstes Kanban Board, um Projekte und Deals zu verwalten
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Erstes Board erstellen
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {boards.map((board) => {
            const typeConfig = getBoardTypeConfig(board.board_type);
            const TypeIcon = typeConfig.icon;
            
            return (
              <Grid item xs={12} sm={6} md={4} key={board.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    borderTop: `4px solid ${typeConfig.color}`,
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-4px)',
                    },
                  }}
                  onClick={() => navigate(`/kanban-boards/${board.id}`)}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: alpha(typeConfig.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <TypeIcon sx={{ color: typeConfig.color }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            {board.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={typeConfig.label}
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: alpha(typeConfig.color, 0.1),
                              color: typeConfig.color,
                            }}
                          />
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuAnchor(e.currentTarget);
                          setSelectedBoardId(board.id);
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {board.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2, lineHeight: 1.6 }}
                      >
                        {board.description}
                      </Typography>
                    )}
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {board.is_default && (
                        <Chip size="small" label="Standard" color="primary" />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions sx={{ borderTop: `1px solid ${theme.palette.divider}`, p: 2 }}>
                    <Button
                      fullWidth
                      endIcon={<OpenIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/kanban-boards/${board.id}`);
                      }}
                    >
                      Board öffnen
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
          
          {/* Add New Board Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: '100%',
                minHeight: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                bgcolor: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                },
              }}
              onClick={() => setCreateDialogOpen(true)}
            >
              <Box sx={{ textAlign: 'center' }}>
                <AddIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary">
                  Neues Board erstellen
                </Typography>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Board Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem onClick={() => {
          const board = boards.find(b => b.id === selectedBoardId);
          if (board) {
            setEditingBoard(board);
            setEditDialogOpen(true);
            setMenuAnchor(null);
          }
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Bearbeiten
        </MenuItem>
        <MenuItem
          onClick={() => selectedBoardId && handleDeleteBoard(selectedBoardId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Löschen
        </MenuItem>
      </Menu>

      {/* Create Board Dialog */}
      <Dialog 
        open={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KanbanIcon />
            Neues Kanban Board
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Board Name"
              placeholder="z.B. Sales Pipeline Q1"
              value={newBoardData.name}
              onChange={(e) => setNewBoardData({ ...newBoardData, name: e.target.value })}
              autoFocus
            />
            <TextField
              fullWidth
              label="Beschreibung"
              placeholder="Wofür wird dieses Board verwendet?"
              multiline
              rows={2}
              value={newBoardData.description || ''}
              onChange={(e) => setNewBoardData({ ...newBoardData, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Board Typ</InputLabel>
              <Select
                value={newBoardData.board_type || 'custom'}
                label="Board Typ"
                onChange={(e) => setNewBoardData({ ...newBoardData, board_type: e.target.value })}
              >
                {Object.entries(BOARD_TYPE_CONFIG).map(([key, config]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <config.icon sx={{ color: config.color, fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2">{config.label}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {config.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {/* Board Type Preview */}
            <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Vorschau der Standard-Spalten:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {newBoardData.board_type === 'sales' ? (
                  <>
                    <Chip size="small" label="Vorqualifizierung" />
                    <Chip size="small" label="Erstkontakt" />
                    <Chip size="small" label="Angebot erstellt" />
                    <Chip size="small" label="..." />
                  </>
                ) : (
                  <>
                    <Chip size="small" label="To Do" />
                    <Chip size="small" label="In Bearbeitung" />
                    <Chip size="small" label="Review" />
                    <Chip size="small" label="Fertig" />
                  </>
                )}
              </Box>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Abbrechen</Button>
          <Button
            variant="contained"
            onClick={handleCreateBoard}
            disabled={!newBoardData.name.trim()}
          >
            Board erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Board Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Board bearbeiten</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Board Name"
              value={editingBoard?.name || ''}
              onChange={(e) => editingBoard && setEditingBoard({ ...editingBoard, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Beschreibung"
              multiline
              rows={2}
              value={editingBoard?.description || ''}
              onChange={(e) => editingBoard && setEditingBoard({ ...editingBoard, description: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={handleUpdateBoard}>
            Speichern
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

