import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { pipelinesApi, PipelineStats } from '../services/api/pipelines';
import { projectsApi, Project } from '../services/api/projects';

interface StepProjects {
  stepId: string;
  stepName: string;
  projects: Project[];
  count: number;
  overdue: number;
}

export default function PipelineKanban() {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [stepProjects, setStepProjects] = useState<StepProjects[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedProject, setDraggedProject] = useState<{ projectId: number; sourceStep: string } | null>(null);

  useEffect(() => {
    loadPipelineData();
  }, [type]);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      if (type) {
        const stats = await pipelinesApi.getStats(type);
        const pipeline = Array.isArray(stats) 
          ? stats.find((s) => s.pipeline.id === type) 
          : stats;
        
        if (pipeline) {
          setPipelineStats(pipeline);
          
          // Lade Projekte für alle Schritte
          const projectsByStep = await Promise.all(
            pipeline.pipeline.steps.map(async (step) => {
              const projects = await pipelinesApi.getProjectsByStep(type, step.id);
              const stepStat = pipeline.stats.find((s) => s.step === step.id);
              return {
                stepId: step.id,
                stepName: step.name,
                projects,
                count: stepStat?.count || 0,
                overdue: stepStat?.overdue || 0,
              };
            })
          );
          
          setStepProjects(projectsByStep);
        }
      }
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, projectId: number, sourceStep: string) => {
    setDraggedProject({ projectId, sourceStep });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', '');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStep: string) => {
    e.preventDefault();
    
    if (!draggedProject || draggedProject.sourceStep === targetStep) {
      setDraggedProject(null);
      return;
    }

    try {
      await pipelinesApi.moveProject(draggedProject.projectId, targetStep);
      setDraggedProject(null);
      loadPipelineData(); // Reload data
    } catch (error) {
      console.error('Error moving project:', error);
      alert('Fehler beim Verschieben des Projekts');
      setDraggedProject(null);
    }
  };

  const getStepColor = (index: number): string => {
    const colors = [
      '#1976d2',
      '#2e7d32',
      '#ed6c02',
      '#d32f2f',
      '#9c27b0',
      '#0288d1',
      '#388e3c',
      '#f57c00',
      '#c2185b',
      '#7b1fa2',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pipelineStats) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Pipeline nicht gefunden</Typography>
        <IconButton onClick={() => navigate('/projects')}>
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate('/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {pipelineStats.pipeline.icon} {pipelineStats.pipeline.name}
        </Typography>
        <Chip label={`Gesamt: ${pipelineStats.total} Projekte`} color="primary" />
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          overflowY: 'hidden',
          flex: 1,
          pb: 2,
        }}
      >
        {stepProjects.map((stepData, index) => (
          <Paper
            key={stepData.stepId}
            sx={{
              minWidth: 300,
              maxWidth: 300,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderTop: `4px solid ${getStepColor(index)}`,
            }}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stepData.stepId)}
          >
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.1)',
                backgroundColor: 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {stepData.stepName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip
                  label={`${stepData.count}`}
                  size="small"
                  color={stepData.count > 0 ? 'primary' : 'default'}
                />
                {stepData.overdue > 0 && (
                  <Chip
                    label={`${stepData.overdue} überfällig`}
                    size="small"
                    color="error"
                  />
                )}
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                p: 1,
                backgroundColor: 'rgba(0,0,0,0.01)',
              }}
            >
              {stepData.projects.map((project) => (
                <Card
                  key={project.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, project.id, stepData.stepId)}
                  sx={{
                    mb: 1,
                    cursor: 'grab',
                    '&:active': {
                      cursor: 'grabbing',
                    },
                    '&:hover': {
                      boxShadow: 3,
                    },
                    opacity: draggedProject?.projectId === project.id ? 0.5 : 1,
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {project.reference}
                    </Typography>
                    {project.customer_name && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {project.customer_name}
                      </Typography>
                    )}
                    {project.end_date && new Date(project.end_date) < new Date() && project.status !== 'completed' && (
                      <Chip
                        label="Überfällig"
                        size="small"
                        color="error"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
              {stepData.projects.length === 0 && (
                <Box
                  sx={{
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed rgba(0,0,0,0.1)',
                    borderRadius: 1,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">Keine Projekte</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}








