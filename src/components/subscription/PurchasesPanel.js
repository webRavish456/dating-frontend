import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function PurchasesPanel({ purchasesProps }) {
  // If parent provides props, respect them; otherwise manage local state
  const [purchases, setPurchases] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [filters, setFilters] = React.useState({ search: '', planName: '' });
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [details, setDetails] = React.useState(null);

  const fetchPurchases = async (p = page + 1, limit = rowsPerPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', p);
      params.set('limit', limit);
      if (filters.search) params.set('search', filters.search);
      if (filters.planName) params.set('planName', filters.planName);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/api/admin/purchases?${params.toString()}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch purchases');
      const json = await res.json();
      const list = Array.isArray(json.data)
        ? json.data
        : Array.isArray(json.data?.purchases)
          ? json.data.purchases
          : Array.isArray(json.purchases)
            ? json.purchases
            : [];
      setPurchases(list);
      setTotal(json.pagination?.total ?? json.total ?? list.length);
      setPage((json.pagination?.page ?? json.page ?? 1) - 1);
    } catch (err) {
      console.error('fetchPurchases error', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchPurchases(1, rowsPerPage); }, []);

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2}>
          <TextField label="Search by user or id" value={filters.search} onChange={(e) => setFilters(s => ({ ...s, search: e.target.value }))} size="small" />
          <TextField label="Plan name" value={filters.planName} onChange={(e) => setFilters(s => ({ ...s, planName: e.target.value }))} size="small" />
          <Button variant="contained" onClick={() => fetchPurchases(1, rowsPerPage)}>Apply</Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Coupon</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}><Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box></TableCell></TableRow>
              ) : !Array.isArray(purchases) || purchases.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">No purchases</TableCell></TableRow>
              ) : (
                purchases.map(purchase => (
                  <TableRow key={purchase._id || purchase.id} hover>
                    <TableCell>{purchase.user?.name} ({purchase.user?.email})</TableCell>
                    <TableCell>{purchase.plan?.name}</TableCell>
                    <TableCell>₹{purchase.payment?.amount}</TableCell>
                    <TableCell>{purchase.coupon?.code ?? '—'}</TableCell>
                    <TableCell>{purchase.dates?.purchased ? new Date(purchase.dates.purchased).toLocaleString() : '—'}</TableCell>
                    <TableCell>{purchase.status}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => { setDetails(purchase); setDetailsOpen(true); }} title="View details" aria-label="View details" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}><VisibilityIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={total || 0} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => { setPage(newPage); fetchPurchases(newPage + 1, rowsPerPage); }} onRowsPerPageChange={(e) => { const v = parseInt(e.target.value,10); setRowsPerPage(v); setPage(0); fetchPurchases(1, v); }} />
      </Paper>

      <Dialog open={detailsOpen} onClose={() => { setDetailsOpen(false); setDetails(null); }} maxWidth="md" fullWidth>
        <DialogTitle>Purchase Details</DialogTitle>
        <DialogContent dividers>
          {details ? (
            <Box>
              <Typography><strong>User:</strong> {details.user?.name} ({details.user?.email})</Typography>
              <Typography><strong>Plan:</strong> {details.plan?.name} ({details.plan?.type})</Typography>
              <Typography><strong>Amount:</strong> ₹{details.payment?.amount}</Typography>
              <Typography><strong>Coupon:</strong> {details.coupon?.code ?? '—'}</Typography>
              <Typography><strong>Purchased:</strong> {details.dates?.purchased ? new Date(details.dates.purchased).toLocaleString() : '—'}</Typography>
              <Typography><strong>Expires:</strong> {details.dates?.expires ? new Date(details.dates.expires).toLocaleString() : '—'}</Typography>
              <Typography><strong>Status:</strong> {details.status}</Typography>
              <Typography><strong>Days remaining:</strong> {details.daysRemaining}</Typography>
            </Box>
          ) : (
            <Typography>No details</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}