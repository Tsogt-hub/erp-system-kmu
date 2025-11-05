import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Tabs,
  Tab,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface TitleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string }) => void;
  title?: any;
}

export default function TitleDialog({ open, onClose, onSave, title }: TitleDialogProps) {
  const [formData, setFormData] = useState({
    title: title?.title || '',
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {title ? 'Zwischenüberschrift bearbeiten' : 'Neuen Zwischenüberschrift anlegen'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <Tabs value={0}>
          <Tab label="ALLGEMEIN" />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        <TextField
          fullWidth
          label="Titel"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          margin="normal"
          required
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button onClick={handleSave} variant="contained" disabled={!formData.title}>
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

