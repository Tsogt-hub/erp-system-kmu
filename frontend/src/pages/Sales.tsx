import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { offersApi, Offer } from '../services/api/offers';
import { getInvoices, Invoice } from '../services/api/invoices';

export default function Sales() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const offersData = await offersApi.getAll();
      const invoicesData = await getInvoices();
      setOffers(offersData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error('Error loading sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalOffers = offers.length;
  const totalInvoices = invoices.length;
  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount * (1 + inv.tax_rate / 100), 0);
  const pendingOffers = offers.filter((o) => o.status === 'sent' || o.status === 'draft').length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Verkauf
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Gesamt Angebote
              </Typography>
              <Typography variant="h4">{totalOffers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Offene Angebote
              </Typography>
              <Typography variant="h4">{pendingOffers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Gesamt Rechnungen
              </Typography>
              <Typography variant="h4">{totalInvoices}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom>
                Umsatz (bezahlt)
              </Typography>
              <Typography variant="h4">{totalRevenue.toFixed(2)} €</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Übersicht
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hier finden Sie eine Übersicht über alle Verkaufsaktivitäten, Angebote und Rechnungen.
        </Typography>
      </Paper>
    </Box>
  );
}





