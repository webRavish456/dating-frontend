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
  CircularProgress,
  Grid
} from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Create form
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 10,
    maxDiscount: 0,
    minPurchase: 0,
    applicablePlans: ['all'],
    usageLimit: 0,
    perUserLimit: 1,
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);

  // Edit form
  const [openEdit, setOpenEdit] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [editForm, setEditForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscount: 0,
    minPurchase: 0,
    perUserLimit: 1,
    endDate: '',
    isActive: true,
    statistics: {}
  });
  const [updating, setUpdating] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);

  const fetchCoupons = async (p = 1, limit = 10) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons?page=${p}&limit=${limit}`, { 
        credentials: 'include' 
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch coupons');
      
      // Normalize ID field
      const normalizedData = (json.data || []).map(coupon => ({
        ...coupon,
        id: coupon._id || coupon.id
      }));
      
      setCoupons(normalizedData);
      setTotal(json.pagination?.total || 0);
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Error loading coupons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(1, rowsPerPage);
  }, []);

  useEffect(() => {
    fetchCoupons(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleCreateSubmit = async () => {
    if (!form.code || !form.endDate) {
      alert('Code and End Date are required');
      return;
    }

    setCreating(true);
    try {
      const payload = { ...form };
      if (!payload.startDate) {
        payload.startDate = new Date().toISOString();
      }

      const res = await fetch(`${API_BASE}/api/admin/coupons`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Create failed');

      alert('✅ Coupon created!');
      setOpenCreate(false);
      setForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 0,
        minPurchase: 0,
        applicablePlans: ['all'],
        usageLimit: 0,
        perUserLimit: 1,
        startDate: '',
        endDate: ''
      });
      fetchCoupons(1, rowsPerPage);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleEditClick = (coupon) => {
    setEditCouponId(coupon.id);
    setEditForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minPurchase: coupon.minPurchase,
      perUserLimit: coupon.perUserLimit,
      endDate: coupon.endDate?.substring(0, 10) || '',
      isActive: coupon.isActive,
      statistics: coupon.statistics
    });
    setOpenEdit(true);
  };

  const handleUpdateSubmit = async () => {
    if (!editCouponId) {
      alert('Coupon ID missing');
      return;
    }

    if (!editForm.endDate) {
      alert('End Date is required');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        description: editForm.description,
        discountValue: Number(editForm.discountValue),
        maxDiscount: Number(editForm.maxDiscount),
        minPurchase: Number(editForm.minPurchase),
        endDate: editForm.endDate.includes('T') 
          ? editForm.endDate 
          : new Date(editForm.endDate).toISOString()
      };

      console.log('Updating coupon:', editCouponId);
      console.log('Payload:', payload);

      const res = await fetch(`${API_BASE}/api/admin/coupons/${editCouponId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', res.status);
      const json = await res.json();
      console.log('Response:', json);

      if (!res.ok) {
        throw new Error(json.message || 'Update failed');
      }

      alert('✅ Coupon updated!');
      setOpenEdit(false);
      setEditCouponId(null);
      fetchCoupons(page + 1, rowsPerPage);
    } catch (err) {
      console.error('Update error:', err);
      alert('❌ Error: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = async (coupon) => {
    if (!window.confirm('Delete this coupon?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/coupons/${coupon.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Delete failed');

      alert('✅ Coupon deleted!');
      fetchCoupons(page + 1, rowsPerPage);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Coupons</Typography>
          <Button variant="contained" onClick={() => setOpenCreate(true)}>
            Create Coupon
          </Button>
        </Box>

        {/* Coupons Table */}
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Value</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Max Discount</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Min Purchase</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Valid Till</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Active</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Used</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Per User</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 11 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" width="90%" height={24} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : coupons.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell colSpan={11} align="center">
                      No coupons
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((c) => (
                    <TableRow key={c.id} hover sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                      <TableCell sx={{ fontWeight: 600, color: '#3FA9C5' }}>{c.code}</TableCell>
                      <TableCell>{c.description || '-'}</TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ backgroundColor: c.discountType === 'percentage' ? '#e3f2fd' : '#f3e5f5', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>
                          {c.discountType === 'percentage' ? '%' : '₹'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {c.discountValue}
                        {c.discountType === 'percentage' ? '%' : ''}
                      </TableCell>
                      <TableCell align="center">{c.maxDiscount ? `₹${c.maxDiscount}` : '-'}</TableCell>
                      <TableCell align="center">{c.minPurchase ? `₹${c.minPurchase}` : '-'}</TableCell>
                      <TableCell align="center">
                        <Typography variant="caption">
                          {c.endDate ? new Date(c.endDate).toLocaleDateString('en-IN') : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ color: c.isActive ? '#4caf50' : '#f44336', fontWeight: 600 }}>
                          {c.isActive ? '✓' : '✗'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{c.statistics?.totalUsed ?? 0}</TableCell>
                      <TableCell align="center">{c.perUserLimit ?? '-'}</TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEditClick(c)} title="Edit">
                          ✏️
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(c)}
                          disabled={deleting}
                          title="Delete"
                        >
                          🗑️
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>

        {/* Create Dialog */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Coupon</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Code"
                  fullWidth
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  fullWidth
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Type"
                  fullWidth
                  select
                  SelectProps={{ native: true }}
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </TextField>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Value"
                  type="number"
                  fullWidth
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Max Discount"
                  type="number"
                  fullWidth
                  value={form.maxDiscount}
                  onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Min Purchase"
                  type="number"
                  fullWidth
                  value={form.minPurchase}
                  onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Per User Limit"
                  type="number"
                  fullWidth
                  value={form.perUserLimit}
                  onChange={(e) => setForm({ ...form, perUserLimit: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Usage Limit"
                  type="number"
                  fullWidth
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Start Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleCreateSubmit}
              disabled={creating}
            >
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ backgroundColor: '#f5f5f5', fontWeight: 700 }}>Edit Coupon - {editForm?.code}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Code"
                  fullWidth
                  disabled
                  value={editForm?.code || ''}
                  helperText="Code cannot be changed"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={editForm?.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ display: 'block', mb: 1, color: '#666' }}>
                  <strong>Type:</strong> {editForm?.discountType === 'percentage' ? '% (Percentage)' : '₹ (Fixed Amount)'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Discount Value"
                  type="number"
                  fullWidth
                  value={editForm?.discountValue || 0}
                  onChange={(e) => setEditForm({ ...editForm, discountValue: Number(e.target.value) })}
                  helperText={editForm?.discountType === 'percentage' ? 'Max 100' : ''}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Max Discount"
                  type="number"
                  fullWidth
                  value={editForm?.maxDiscount || 0}
                  onChange={(e) => setEditForm({ ...editForm, maxDiscount: Number(e.target.value) })}
                  helperText="Maximum discount amount"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Min Purchase"
                  type="number"
                  fullWidth
                  value={editForm?.minPurchase || 0}
                  onChange={(e) => setEditForm({ ...editForm, minPurchase: Number(e.target.value) })}
                  helperText="Minimum purchase required"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  label="Per User Limit"
                  type="number"
                  fullWidth
                  disabled
                  value={editForm?.perUserLimit || 1}
                  helperText="Times per user"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="End Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={editForm?.endDate || ''}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
                  <strong>Status:</strong> {editForm?.isActive ? '🟢 Active' : '🔴 Inactive'} | <strong>Used:</strong> {editForm?.statistics?.totalUsed || 0} times
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleUpdateSubmit}
              disabled={updating}
            >
              {updating ? 'Updating...' : 'Update Coupon'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
}
