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

interface TextDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description?: string }) => void;
  text?: any;
}

export default function TextDialog({ open, onClose, onSave, text }: TextDialogProps) {
  const [formData, setFormData] = useState({
    title: text?.title || '',
    description: text?.description || '',
  });

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {text ? 'Text bearbeiten' : 'Neuen Text anlegen'}
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
        <TextField
          fullWidth
          label="Beschreibung"
          multiline
          rows={15}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          placeholder="Beschreibung eingeben..."
          sx={{
            mt: 2,
            '& .MuiInputBase-root': {
              fontFamily: 'Arial',
              fontSize: '15px',
            },
          }}
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

