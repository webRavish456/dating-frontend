"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
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
import Skeleton from "@mui/material/Skeleton";
import VisibilityIcon from '@mui/icons-material/Visibility';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', planName: '', status: '' });
  const [error, setError] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchPurchases = async (p = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      // build query with only non-empty values
      const params = new URLSearchParams();
      params.set('page', p);
      params.set('limit', limit);
      if (filters.search) params.set('search', filters.search);
      if (filters.planName) params.set('planName', filters.planName);
      if (filters.status) params.set('status', filters.status);

      const res = await fetch(`${API_BASE}/api/admin/purchases?${params.toString()}`, { credentials: 'include' });

      // Attempt to read response body safely
      const text = await res.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        // If body isn't JSON, keep text
        json = { message: text };
      }

      if (!res.ok) {
        const msg = (json && json.message) ? json.message : res.statusText || 'Failed to fetch purchases';
        // If 401, suggest login
        if (res.status === 401) {
          setError('Unauthorized. Please log in as admin.');
        } else {
          setError(msg);
        }
        throw new Error(msg);
      }

      setPurchases((json?.data?.purchases) || json?.data || []);
      setTotal(json?.pagination?.total || json?.total || 0);
      // normalize page if provided
      if (json?.pagination?.page) setPage((json.pagination.page || 1) - 1);
    } catch (err) {
      console.error('fetchPurchases error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(1, rowsPerPage); }, []);

  useEffect(() => { fetchPurchases(page + 1, rowsPerPage); }, [page, rowsPerPage]);

  const openDetails = (item) => {
    setDetails(item);
    setDetailsOpen(true);
  };

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Purchase History</Typography>
        </Box>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField label="Search by user or id" value={filters.search} onChange={(e) => setFilters(s => ({ ...s, search: e.target.value }))} size="small" />
            <TextField label="Plan name" value={filters.planName} onChange={(e) => setFilters(s => ({ ...s, planName: e.target.value }))} size="small" />
            <TextField label="Status" value={filters.status} onChange={(e) => setFilters(s => ({ ...s, status: e.target.value }))} size="small" />
            <Button variant="contained" onClick={() => fetchPurchases(1, rowsPerPage)}>Apply</Button>
          </Box>
          {error && (
            <Box mt={2}>
              <Typography color="error">{error}</Typography>
            </Box>
          )}
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
                  <TableCell sx={{ fontWeight: 700 }}>Expiry Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" width="90%" height={24} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : purchases.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center">No purchases</TableCell></TableRow>
                ) : (
                  purchases.map(purchase => (
                    <TableRow key={purchase.id || purchase._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>{purchase.user?.name || '—'}</Typography>
                        {(purchase.user?.email || purchase.user?.mobile) && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {[purchase.user?.email, purchase.user?.mobile].filter(Boolean).join(' • ')}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{purchase.plan?.name}</TableCell>
                      <TableCell>₹{purchase.payment?.amount}</TableCell>
                      <TableCell>{purchase.coupon?.code ?? '—'}</TableCell>
                      <TableCell>{purchase.dates?.purchased ? new Date(purchase.dates.purchased).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                      <TableCell>{purchase.dates?.expires ? new Date(purchase.dates.expires).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}</TableCell>
                      <TableCell>{purchase.status}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openDetails(purchase)} title="View details" aria-label="View details" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}><VisibilityIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={total} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value,10)); setPage(0); }} />
        </Paper>

        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Purchase Details</DialogTitle>
          <DialogContent dividers>
            {details ? (
              <Box>
                <Typography><strong>User:</strong> {details.user?.name || '—'}</Typography>
                {(details.user?.email || details.user?.mobile) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {details.user?.email && <span>{details.user.email}</span>}
                    {details.user?.email && details.user?.mobile && ' • '}
                    {details.user?.mobile && <span>{details.user.mobile}</span>}
                  </Typography>
                )}
                <Typography><strong>Plan:</strong> {details.plan?.name} ({details.plan?.type})</Typography>
                <Typography><strong>Amount:</strong> ₹{details.payment?.amount}</Typography>
                <Typography><strong>Coupon:</strong> {details.coupon?.code ?? '—'}</Typography>
                <Typography><strong>Purchased:</strong> {details.dates?.purchased ? new Date(details.dates.purchased).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</Typography>
                <Typography><strong>Expires:</strong> {details.dates?.expires ? new Date(details.dates.expires).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</Typography>
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
    </Layout>
  );
}
