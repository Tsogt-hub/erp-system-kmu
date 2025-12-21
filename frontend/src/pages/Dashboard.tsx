import { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { dashboardApi, DashboardStats } from '../services/api/dashboard';
import { format } from 'date-fns';

// macOS Tahoe Glass Card Component
const GlassCard = ({ 
  children, 
  gradient = 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
  sx = {} 
}: { 
  children: React.ReactNode; 
  gradient?: string;
  sx?: object;
}) => (
  <Card
    sx={{
      background: gradient,
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      borderRadius: '16px',
      border: '0.5px solid rgba(255, 255, 255, 0.5)',
      boxShadow: `
        0 1px 1px rgba(0, 0, 0, 0.02),
        0 2px 2px rgba(0, 0, 0, 0.02),
        0 4px 4px rgba(0, 0, 0, 0.02),
        0 8px 8px rgba(0, 0, 0, 0.02),
        0 16px 16px rgba(0, 0, 0, 0.02),
        inset 0 0.5px 0 rgba(255, 255, 255, 0.8)
      `,
      transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `
          0 2px 2px rgba(0, 0, 0, 0.02),
          0 4px 4px rgba(0, 0, 0, 0.03),
          0 8px 8px rgba(0, 0, 0, 0.03),
          0 16px 16px rgba(0, 0, 0, 0.03),
          0 24px 32px rgba(0, 0, 0, 0.04),
          inset 0 0.5px 0 rgba(255, 255, 255, 0.9)
        `,
      },
      ...sx,
    }}
  >
    {children}
  </Card>
);

// Stats Card with Icon
const StatsCard = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color,
  gradient,
}: { 
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  gradient: string;
}) => (
  <GlassCard>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(60, 60, 67, 0.6)',
              fontWeight: 500,
              fontSize: '0.75rem',
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 700,
              fontSize: '2rem',
              letterSpacing: '-0.03em',
              color: 'rgba(29, 29, 31, 0.95)',
              mt: 0.5,
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(60, 60, 67, 0.5)',
                fontSize: '0.75rem',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            background: gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 4px 12px ${color}30`,
          }}
        >
          <Box sx={{ color: '#fff', display: 'flex', '& svg': { fontSize: '1.5rem' } }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </GlassCard>
);

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
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress 
          size={40}
          sx={{ 
            color: '#0071E3',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Typography 
          sx={{ 
            color: 'rgba(60, 60, 67, 0.6)',
            fontSize: '0.875rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          Lädt...
        </Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography 
          sx={{ 
            color: 'rgba(60, 60, 67, 0.6)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          }}
        >
          Keine Daten verfügbar
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          fontSize: '1.75rem',
          letterSpacing: '-0.03em',
          color: 'rgba(29, 29, 31, 0.95)',
          mb: 3,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
        }}
      >
        Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<FolderIcon />}
            title="Aktive Projekte"
            value={stats.projects.active}
            subtitle={`${stats.projects.total} gesamt`}
            color="#0071E3"
            gradient="linear-gradient(135deg, #0071E3 0%, #40C8E0 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<AccessTimeIcon />}
            title="Heute erfasst"
            value={`${stats.timeEntries.todayHours.toFixed(1)}h`}
            subtitle={`${stats.timeEntries.thisWeekHours.toFixed(1)}h diese Woche`}
            color="#BF5AF2"
            gradient="linear-gradient(135deg, #BF5AF2 0%, #FF6BF3 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<AssignmentIcon />}
            title="Offene Tickets"
            value={stats.tickets.open}
            subtitle={`${stats.tickets.total} gesamt`}
            color="#FF9F0A"
            gradient="linear-gradient(135deg, #FF9F0A 0%, #FFD60A 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            icon={<PeopleIcon />}
            title="Kunden"
            value={stats.customers.total}
            color="#34C759"
            gradient="linear-gradient(135deg, #34C759 0%, #30D158 100%)"
          />
        </Grid>
      </Grid>

      {/* Data Tables */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #0071E3 0%, #40C8E0 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0, 113, 227, 0.25)',
                    }}
                  >
                    <TrendingUpIcon sx={{ color: '#fff', fontSize: '1.25rem' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Ihre Projekte
                  </Typography>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Name
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Erstellt
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentProjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, border: 'none' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(60, 60, 67, 0.5)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}
                          >
                            Keine Projekte
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.recentProjects.map((project: any) => (
                        <TableRow 
                          key={project.id}
                          sx={{ 
                            '&:hover': { background: 'rgba(0, 0, 0, 0.02)' },
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <TableCell sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                            py: 1.25,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '0.8125rem',
                          }}>
                            {project.name}
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', py: 1.25 }}>
                            <Chip
                              label={project.status === 'active' ? 'Aktiv' : project.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                borderRadius: '6px',
                                background: project.status === 'active' 
                                  ? 'rgba(52, 199, 89, 0.12)' 
                                  : 'rgba(142, 142, 147, 0.12)',
                                color: project.status === 'active' ? '#248A3D' : '#636366',
                                border: 'none',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                            py: 1.25,
                            color: 'rgba(60, 60, 67, 0.6)',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '0.8125rem',
                          }}>
                            {format(new Date(project.created_at), 'dd.MM.yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF9F0A 0%, #FFD60A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(255, 159, 10, 0.25)',
                    }}
                  >
                    <ReceiptLongIcon sx={{ color: '#fff', fontSize: '1.25rem' }} />
                  </Box>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '1rem',
                      letterSpacing: '-0.01em',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
                    }}
                  >
                    Ihre Tickets
                  </Typography>
                </Box>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Titel
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ 
                        fontWeight: 600, 
                        fontSize: '0.75rem',
                        color: 'rgba(60, 60, 67, 0.6)',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                        py: 1.5,
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                      }}>
                        Priorität
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4, border: 'none' }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(60, 60, 67, 0.5)',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            }}
                          >
                            Keine Tickets
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.recentTickets.map((ticket: any) => (
                        <TableRow 
                          key={ticket.id}
                          sx={{ 
                            '&:hover': { background: 'rgba(0, 0, 0, 0.02)' },
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <TableCell sx={{ 
                            borderBottom: '1px solid rgba(0, 0, 0, 0.04)',
                            py: 1.25,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                            fontSize: '0.8125rem',
                          }}>
                            {ticket.title}
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', py: 1.25 }}>
                            <Chip
                              label={
                                ticket.status === 'open' ? 'Offen' : 
                                ticket.status === 'in_progress' ? 'In Bearbeitung' : 
                                'Erledigt'
                              }
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                borderRadius: '6px',
                                background: ticket.status === 'open' 
                                  ? 'rgba(255, 59, 48, 0.12)' 
                                  : ticket.status === 'in_progress'
                                  ? 'rgba(255, 159, 10, 0.12)'
                                  : 'rgba(52, 199, 89, 0.12)',
                                color: ticket.status === 'open' 
                                  ? '#D70015' 
                                  : ticket.status === 'in_progress'
                                  ? '#C93400'
                                  : '#248A3D',
                                border: 'none',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.04)', py: 1.25 }}>
                            <Chip 
                              label={
                                ticket.priority === 'high' ? 'Hoch' :
                                ticket.priority === 'medium' ? 'Mittel' :
                                'Niedrig'
                              }
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.6875rem',
                                fontWeight: 600,
                                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                                borderRadius: '6px',
                                background: ticket.priority === 'high' 
                                  ? 'rgba(255, 59, 48, 0.12)' 
                                  : ticket.priority === 'medium'
                                  ? 'rgba(255, 159, 10, 0.12)'
                                  : 'rgba(142, 142, 147, 0.12)',
                                color: ticket.priority === 'high' 
                                  ? '#D70015' 
                                  : ticket.priority === 'medium'
                                  ? '#C93400'
                                  : '#636366',
                                border: 'none',
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
