import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Slider,
  ButtonGroup,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

interface PDFPreviewPanelProps {
  pdfBase64: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function PDFPreviewPanel({ pdfBase64, loading, onRefresh }: PDFPreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // PDF als Blob-URL erzeugen für iframe
  const pdfUrl = pdfBase64 
    ? `data:application/pdf;base64,${pdfBase64}` 
    : null;

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 25, 50));
  };

  const handleDownload = () => {
    if (!pdfBase64) return;
    
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'angebot-vorschau.pdf';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFullscreen = () => {
    if (!pdfUrl) return;
    window.open(pdfUrl, '_blank');
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          bgcolor: 'grey.100',
        }}
      >
        <CircularProgress size={48} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          PDF wird generiert...
        </Typography>
      </Box>
    );
  }

  if (!pdfBase64) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          bgcolor: 'grey.100',
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Noch keine PDF-Vorschau
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Klicken Sie auf "PDF-Vorschau" um eine Vorschau zu generieren.
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
        >
          PDF generieren
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      {/* Thumbnails Sidebar */}
      <Paper 
        sx={{ 
          width: 120, 
          flexShrink: 0, 
          p: 1, 
          overflowY: 'auto',
          bgcolor: 'grey.200',
          borderRadius: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Seiten
        </Typography>
        
        {/* Thumbnail-Vorschau - vereinfacht als Platzhalter */}
        {[1, 2, 3, 4, 5].map((page) => (
          <Paper
            key={page}
            elevation={currentPage === page ? 3 : 1}
            sx={{
              p: 0.5,
              mb: 1,
              cursor: 'pointer',
              border: currentPage === page ? '2px solid' : '1px solid',
              borderColor: currentPage === page ? 'primary.main' : 'divider',
              '&:hover': { borderColor: 'primary.light' },
            }}
            onClick={() => setCurrentPage(page)}
          >
            <Box 
              sx={{ 
                height: 100, 
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {page}
              </Typography>
            </Box>
            <Typography variant="caption" align="center" display="block">
              Seite {page}
            </Typography>
          </Paper>
        ))}
      </Paper>

      {/* Main Preview Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Toolbar */}
        <Paper 
          sx={{ 
            p: 1, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            borderRadius: 0,
          }}
        >
          <ButtonGroup size="small">
            <Tooltip title="Verkleinern">
              <Button onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOutIcon />
              </Button>
            </Tooltip>
            <Button disabled sx={{ minWidth: 60 }}>
              {zoom}%
            </Button>
            <Tooltip title="Vergrößern">
              <Button onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomInIcon />
              </Button>
            </Tooltip>
          </ButtonGroup>

          <Box sx={{ width: 150 }}>
            <Slider
              value={zoom}
              onChange={(_e, value) => setZoom(value as number)}
              min={50}
              max={200}
              step={25}
              size="small"
            />
          </Box>

          <Box sx={{ flex: 1 }} />

          <Typography variant="body2" color="text.secondary">
            Seite {currentPage} von {totalPages || '?'}
          </Typography>

          <Tooltip title="Aktualisieren">
            <IconButton onClick={onRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Vollbild">
            <IconButton onClick={handleFullscreen} size="small">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Herunterladen">
            <IconButton onClick={handleDownload} size="small">
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* PDF Viewer */}
        <Box 
          sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: 'grey.300',
            display: 'flex',
            justifyContent: 'center',
            p: 2,
          }}
        >
          <Box
            sx={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s',
            }}
          >
            <iframe
              src={pdfUrl}
              style={{
                width: '800px',
                height: '1131px', // A4 aspect ratio
                border: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                backgroundColor: 'white',
              }}
              title="PDF Vorschau"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
