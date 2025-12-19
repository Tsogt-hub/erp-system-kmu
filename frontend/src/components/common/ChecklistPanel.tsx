import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  LinearProgress,
  Chip,
  Collapse,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  checklistsApi,
  Checklist,
  ChecklistItem,
  CreateChecklistData,
  CreateChecklistItemData,
} from '../../services/api/checklists';

interface ChecklistPanelProps {
  entityType: 'project' | 'contact' | 'offer';
  entityId: number;
  title?: string;
}

export default function ChecklistPanel({ entityType, entityId, title = 'Checklisten' }: ChecklistPanelProps) {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [templates, setTemplates] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [expandedChecklists, setExpandedChecklists] = useState<Set<number>>(new Set());
  
  // Dialogs
  const [newChecklistOpen, setNewChecklistOpen] = useState(false);
  const [newItemOpen, setNewItemOpen] = useState(false);
  const [selectedChecklistId, setSelectedChecklistId] = useState<number | null>(null);
  const [templateMenuAnchor, setTemplateMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Forms
  const [checklistForm, setChecklistForm] = useState<Partial<CreateChecklistData>>({ name: '', description: '' });
  const [itemForm, setItemForm] = useState<Partial<CreateChecklistItemData>>({ title: '', description: '' });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [checklistsData, templatesData] = await Promise.all([
        checklistsApi.getByEntity(entityType, entityId),
        checklistsApi.getTemplates(),
      ]);
      setChecklists(checklistsData);
      setTemplates(templatesData);
      // Expand all checklists by default
      setExpandedChecklists(new Set(checklistsData.map(c => c.id)));
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateChecklist = async () => {
    try {
      await checklistsApi.create({
        ...checklistForm,
        entity_type: entityType,
        entity_id: entityId,
      } as CreateChecklistData);
      setNewChecklistOpen(false);
      setChecklistForm({ name: '', description: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateFromTemplate = async (templateId: number) => {
    try {
      await checklistsApi.createFromTemplate(templateId, entityType, entityId);
      setTemplateMenuAnchor(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteChecklist = async (id: number) => {
    if (window.confirm('Möchten Sie diese Checkliste wirklich löschen?')) {
      try {
        await checklistsApi.delete(id);
        loadData();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleAddItem = async () => {
    if (!selectedChecklistId) return;
    try {
      await checklistsApi.addItem(selectedChecklistId, itemForm as CreateChecklistItemData);
      setNewItemOpen(false);
      setItemForm({ title: '', description: '' });
      setSelectedChecklistId(null);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleItem = async (itemId: number) => {
    try {
      await checklistsApi.toggleItem(itemId);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await checklistsApi.deleteItem(itemId);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleChecklistExpand = (id: number) => {
    const newExpanded = new Set(expandedChecklists);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedChecklists(newExpanded);
  };

  const totalItems = checklists.reduce((sum, c) => sum + (c.items?.length || 0), 0);
  const completedItems = checklists.reduce(
    (sum, c) => sum + (c.items?.filter(i => i.is_completed).length || 0),
    0
  );
  const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <ChecklistIcon color="primary" />
          <Typography variant="h6">{title}</Typography>
          <Chip
            label={`${completedItems}/${totalItems}`}
            size="small"
            color={overallProgress === 100 ? 'success' : 'primary'}
            variant="outlined"
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={loadData} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          {templates.length > 0 && (
            <>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ContentCopyIcon />}
                onClick={(e) => setTemplateMenuAnchor(e.currentTarget)}
              >
                Vorlage
              </Button>
              <Menu
                anchorEl={templateMenuAnchor}
                open={Boolean(templateMenuAnchor)}
                onClose={() => setTemplateMenuAnchor(null)}
              >
                {templates.map((template) => (
                  <MenuItem key={template.id} onClick={() => handleCreateFromTemplate(template.id)}>
                    {template.name}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setNewChecklistOpen(true)}
          >
            Neu
          </Button>
        </Box>
      </Box>

      {/* Overall Progress */}
      {totalItems > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Gesamtfortschritt
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {overallProgress}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={overallProgress}
            sx={{ height: 8, borderRadius: 4 }}
            color={overallProgress === 100 ? 'success' : 'primary'}
          />
        </Box>
      )}

      <Collapse in={expanded}>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {loading ? (
          <Typography color="text.secondary">Lädt...</Typography>
        ) : checklists.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            Keine Checklisten vorhanden
          </Typography>
        ) : (
          checklists.map((checklist) => (
            <Paper key={checklist.id} variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
              {/* Checklist Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                }}
                onClick={() => toggleChecklistExpand(checklist.id)}
              >
                <IconButton size="small">
                  {expandedChecklists.has(checklist.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Box sx={{ flex: 1, ml: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {checklist.name}
                  </Typography>
                  {checklist.description && (
                    <Typography variant="body2" color="text.secondary">
                      {checklist.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={`${checklist.progress || 0}%`}
                  size="small"
                  color={checklist.progress === 100 ? 'success' : 'default'}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedChecklistId(checklist.id);
                    setNewItemOpen(true);
                  }}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChecklist(checklist.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>

              {/* Checklist Items */}
              <Collapse in={expandedChecklists.has(checklist.id)}>
                {checklist.items && checklist.items.length > 0 ? (
                  <List dense>
                    {checklist.items.map((item) => (
                      <ListItem
                        key={item.id}
                        sx={{
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          opacity: item.is_completed ? 0.7 : 1,
                        }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={item.is_completed}
                            onChange={() => handleToggleItem(item.id)}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              sx={{
                                textDecoration: item.is_completed ? 'line-through' : 'none',
                              }}
                            >
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <>
                              {item.description}
                              {item.completed_at && (
                                <Typography variant="caption" display="block" color="success.main">
                                  ✓ {item.completed_by_name} • {new Date(item.completed_at).toLocaleString('de-DE')}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip title="Löschen">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    Keine Einträge
                  </Typography>
                )}
              </Collapse>
            </Paper>
          ))
        )}
      </Collapse>

      {/* New Checklist Dialog */}
      <Dialog open={newChecklistOpen} onClose={() => setNewChecklistOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neue Checkliste</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name *"
            value={checklistForm.name || ''}
            onChange={(e) => setChecklistForm({ ...checklistForm, name: e.target.value })}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={checklistForm.description || ''}
            onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewChecklistOpen(false)}>Abbrechen</Button>
          <Button onClick={handleCreateChecklist} variant="contained" disabled={!checklistForm.name}>
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Item Dialog */}
      <Dialog open={newItemOpen} onClose={() => setNewItemOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Neuer Eintrag</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel *"
            value={itemForm.title || ''}
            onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Beschreibung"
            value={itemForm.description || ''}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewItemOpen(false)}>Abbrechen</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!itemForm.title}>
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}






