import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentDrawerWidth = sidebarOpen ? drawerWidth : collapsedDrawerWidth;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F2F2F7 0%, #E5E5EA 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glass Background Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-20%',
          left: '-10%',
          width: '40%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-20%',
          right: '-10%',
          width: '40%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(88, 86, 214, 0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Sidebar drawerWidth={currentDrawerWidth} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 1,
          ml: 0,
        }}
      >
        <Header />
        <Box sx={{ mt: 2 }}>
        <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
