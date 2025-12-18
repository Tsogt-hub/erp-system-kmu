import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import { fetchUser } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';

const drawerWidth = 280;
const collapsedDrawerWidth = 72;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUser());
    }
  }, [token, user, dispatch]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const currentDrawerWidth = sidebarOpen ? drawerWidth : collapsedDrawerWidth;

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        minHeight: '100vh',
        // macOS Tahoe - Premium Gradient Background
        background: `
          linear-gradient(135deg, 
            #FAFBFC 0%, 
            #F0F1F5 20%, 
            #F5F6FA 40%, 
            #ECEEF2 60%, 
            #F2F3F7 80%, 
            #F8F9FB 100%
          )
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* macOS Tahoe - Dynamic Ambient Light Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-30%',
          left: '-10%',
          width: '55%',
          height: '75%',
          background: 'radial-gradient(ellipse, rgba(0, 122, 255, 0.08) 0%, rgba(0, 122, 255, 0.03) 35%, transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientFloat1 25s ease-in-out infinite',
          '@keyframes ambientFloat1': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.8 },
            '33%': { transform: 'translate(40px, 20px) scale(1.05)', opacity: 1 },
            '66%': { transform: 'translate(-20px, 30px) scale(0.98)', opacity: 0.9 },
          },
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '15%',
          right: '-15%',
          width: '50%',
          height: '65%',
          background: 'radial-gradient(ellipse, rgba(175, 82, 222, 0.07) 0%, rgba(175, 82, 222, 0.02) 35%, transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientFloat2 30s ease-in-out infinite',
          '@keyframes ambientFloat2': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.7 },
            '50%': { transform: 'translate(-30px, 40px) scale(1.1)', opacity: 1 },
          },
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-25%',
          left: '25%',
          width: '45%',
          height: '55%',
          background: 'radial-gradient(ellipse, rgba(90, 200, 250, 0.06) 0%, rgba(90, 200, 250, 0.02) 35%, transparent 65%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientFloat3 28s ease-in-out infinite',
          '@keyframes ambientFloat3': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.6 },
            '33%': { transform: 'translate(25px, -20px) scale(1.03)', opacity: 0.8 },
            '66%': { transform: 'translate(-15px, -10px) scale(0.97)', opacity: 0.7 },
          },
        }}
      />
      
      {/* Accent Orb - Green */}
      <Box
        sx={{
          position: 'fixed',
          top: '60%',
          left: '5%',
          width: '25%',
          height: '35%',
          background: 'radial-gradient(ellipse, rgba(52, 199, 89, 0.05) 0%, transparent 60%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientFloat4 22s ease-in-out infinite',
          '@keyframes ambientFloat4': {
            '0%, 100%': { transform: 'translate(0, 0)', opacity: 0.5 },
            '50%': { transform: 'translate(15px, -25px)', opacity: 0.8 },
          },
        }}
      />

      {/* Subtle Noise Texture Overlay */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: 0.012,
          pointerEvents: 'none',
          zIndex: 0,
          mixBlendMode: 'overlay',
        }}
      />

      <Sidebar drawerWidth={currentDrawerWidth} isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: 2.5,
          width: '100%',
          minHeight: '100vh',
          transition: 'all 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
          position: 'relative',
          zIndex: 1,
          ml: 0,
        }}
      >
        <Header />
        <Box 
          sx={{ 
            mt: 1.5,
            animation: 'contentFadeIn 0.3s ease-out',
            '@keyframes contentFadeIn': {
              from: { opacity: 0, transform: 'translateY(6px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
