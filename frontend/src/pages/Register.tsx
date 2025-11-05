import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
} from '@mui/material';
import { AppDispatch } from '../store/store';
import { register } from '../store/slices/authSlice';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await dispatch(register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }));

      if (register.fulfilled.match(result)) {
        navigate('/');
      } else {
        setError(result.payload as string || 'Registrierung fehlgeschlagen');
      }
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F5F5F5',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0, 0, 0, 0.12)',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#212121', fontWeight: 600 }}>
            Elite ERP
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Neuen Benutzer registrieren
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Vorname"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              margin="normal"
              required
              autoComplete="given-name"
            />
            <TextField
              fullWidth
              label="Nachname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              margin="normal"
              required
              autoComplete="family-name"
            />
            <TextField
              fullWidth
              label="E-Mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Passwort"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="new-password"
              helperText="Mindestens 6 Zeichen"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !firstName || !lastName || !email || !password}
            >
              {loading ? 'Registrieren...' : 'Registrieren'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Bereits registriert? <Link href="/login">Anmelden</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

