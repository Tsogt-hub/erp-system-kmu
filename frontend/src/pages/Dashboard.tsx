import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import { dashboardApi, DashboardStats } from '../services/api/dashboard';
import { format } from 'date-fns';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!stats) {
    return <Typography>Keine Daten verfügbar</Typography>;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FolderIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.projects.active}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Aktive Projekte
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.projects.total} gesamt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 40, color: '#dc004e', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.timeEntries.todayHours.toFixed(1)}h</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Heute erfasst
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.timeEntries.thisWeekHours.toFixed(1)}h diese Woche
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssignmentIcon sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.tickets.open}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Offene Tickets
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.tickets.total} gesamt
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.customers.total}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Kunden
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ihre Projekte
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Erstellt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Keine Projekte
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentProjects.map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={project.status}
                            size="small"
                            color={project.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{format(new Date(project.created_at), 'dd.MM.yyyy')}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ihre Tickets
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Titel</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priorität</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.recentTickets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        <Typography variant="body2" color="text.secondary">
                          Keine Tickets
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.recentTickets.map((ticket: any) => (
                      <TableRow key={ticket.id}>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>
                          <Chip
                            label={ticket.status}
                            size="small"
                            color={
                              ticket.status === 'open'
                                ? 'error'
                                : ticket.status === 'in_progress'
                                ? 'warning'
                                : 'success'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={ticket.priority} size="small" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

