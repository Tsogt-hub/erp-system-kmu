import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { apiClient } from '../services/api/client';

interface AuditLog {
  id: number;
  action: string;
  resource?: string;
  level: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

const levelColors: Record<string, string> = {
  info: 'primary',
  warning: 'warning',
  critical: 'error',
};

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await apiClient.get('/audit');
        setLogs(response.data.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Audit Logs
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Nachvollziehbarkeit sicherheitskritischer Aktionen im System.
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          {logs.map((log) => (
            <Card key={log.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {log.action}
                  </Typography>
                  <Chip
                    label={log.level.toUpperCase()}
                    color={levelColors[log.level] ?? 'default'}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Stack>
                {log.resource && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    Ressource: {log.resource}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {new Date(log.created_at).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {logs.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Noch keine Audit-Einträge vorhanden.
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}


