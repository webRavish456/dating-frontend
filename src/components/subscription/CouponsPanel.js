"use client";
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
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
export default function CouponsPanel({ couponsProps }) {
  const [coupons, setCoupons] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [total, setTotal] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [creating, setCreating] = React.useState(false);
  const [form, setForm] = React.useState({ code: '', description: '', discountType: 'fixed', discountValue: 0, startDate: '', expiresAt: '', usageLimit: 0, isActive: true });
  const [editOpen, setEditOpen] = React.useState(false);
  const [editCoupon, setEditCoupon] = React.useState(null);
  const [editing, setEditing] = React.useState(false);
  const [usageOpen, setUsageOpen] = React.useState(false);
  const [usageData, setUsageData] = React.useState(null);

  const [message, setMessage] = React.useState(null); // { text, severity }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const showMessage = (text, severity = 'info') => {
    setMessage({ text, severity });
    setTimeout(() => setMessage(null), 5000);
  };

  React.useEffect(() => {
    console.log('[CouponsPanel] mounted (client hydrated)');
  }, []);

  const validateCouponPayload = (payload) => {
    if (!payload.code || !payload.description || !payload.discountType || payload.discountValue === undefined || !payload.endDate) {
      return 'Code, description, discountType, discountValue and end date are required';
    }
    if (!['percentage', 'fixed'].includes(payload.discountType)) return 'Invalid discount type';
    if (payload.discountType === 'percentage' && payload.discountValue > 100) return 'Percentage discount cannot exceed 100%';
    return null;
  }
  const fetchCoupons = async (p = page + 1, limit = rowsPerPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', p);
      params.set('limit', limit);
      if (search) params.set('search', search);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons?${params.toString()}`, { credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch(e){ json = { message: text }; }

      if (!res.ok) {
        const msg = json?.message || res.statusText || 'Failed to fetch coupons';
        showMessage(msg, 'error');
        throw new Error(msg);
      }

      setCoupons(json.data || []);
      setTotal(json.pagination?.total || json.total || (json.data || []).length);
      setPage((json.pagination?.page || json.page || 1) - 1);
    } catch (err) {
      console.error('fetchCoupons error', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { fetchCoupons(1, rowsPerPage); }, []);

  React.useEffect(() => {
    // If search cleared reset page
    if (!search) fetchCoupons(1, rowsPerPage);
  }, [search]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      // sanitize body
      const payload = {
        code: (form.code || '').toUpperCase(),
        description: form.description,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
        endDate: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        usageLimit: form.usageLimit || null,
        isActive: !!form.isActive
      };

      const validationError = validateCouponPayload({ ...payload, endDate: payload.endDate });
      if (validationError) {
        showMessage(validationError, 'error');
        setCreating(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch(e){ json = { message: text }; }

      if (!res.ok) {
        const msg = json?.message || 'Failed to create coupon';
        showMessage(msg, 'error');
        throw new Error(msg);
      }

      setCreateOpen(false);
      setForm({ code: '', description: '', discountType: 'fixed', discountValue: 0, startDate: '', expiresAt: '', usageLimit: 0, isActive: true });
      showMessage('Coupon created', 'success');
      fetchCoupons(1, rowsPerPage);
    } catch (err) {
      console.error('create coupon error', err);
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (c) => {
    console.log('[CouponsPanel] toggleActive clicked for', c._id || c.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${c._id || c.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        body: JSON.stringify({ isActive: !c.isActive })
      });

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch(e){ json = { message: text }; }

      console.log('[CouponsPanel] toggleActive response', res.status, json);

      if (!res.ok) {
        const msg = json?.message || 'Failed to update coupon';
        showMessage(msg, 'error');
        throw new Error(msg);
      }

      showMessage('Coupon updated', 'success');
      fetchCoupons(page+1, rowsPerPage);
    } catch (err) {
      console.error('toggleActive error', err);
    }
  };

  const handleDelete = async (c) => {
    console.log('[CouponsPanel] handleDelete clicked for', c._id || c.id);
    if (!confirm('Delete coupon?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${c._id || c.id}`, { method: 'DELETE', credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });

      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch(e){ json = { message: text }; }

      console.log('[CouponsPanel] handleDelete response', res.status, json);

      if (!res.ok) {
        const msg = json?.message || 'Failed to delete coupon';
        showMessage(msg, 'error');
        throw new Error(msg);
      }

      showMessage('Coupon deleted', 'success');
      fetchCoupons(page+1, rowsPerPage);
    } catch (err) {
      console.error('delete coupon error', err);
    }
  };

  const viewUsage = async (c) => {
    console.log('[CouponsPanel] viewUsage clicked for', c._id || c.id);
    setUsageOpen(true);
    setUsageData(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${c._id || c.id}/usage`, { credentials: 'include', headers: token ? { 'Authorization': `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error('Failed to get usage');
      const json = await res.json();
      console.log('[CouponsPanel] viewUsage response', json);
      setUsageData(json.data || null);
    } catch (err) {
      console.error('usage fetch error', err);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField label="Search" value={search} onChange={(e)=>setSearch(e.target.value)} size="small" />
          <Button variant="contained" onClick={() => fetchCoupons(1, rowsPerPage)}>Search</Button>
          <Box sx={{ flex: 1 }} />
          <Button variant="contained" onClick={() => setCreateOpen(true)}>Create Coupon</Button>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created By</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Usage</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9}><Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box></TableCell></TableRow>
              ) : coupons.length === 0 ? (
                <TableRow><TableCell colSpan={9} align="center">No coupons</TableCell></TableRow>
              ) : (
                coupons.map(c => (
                  <TableRow key={c._id || c.id} hover>
                    <TableCell>{c.code}</TableCell>
                    <TableCell>{c.createdBy?.name ?? 'System'}</TableCell>
                    <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                    <TableCell>{c.description}</TableCell>
                    <TableCell>{c.discountType}</TableCell>
                    <TableCell>{c.discountValue}{c.discountType === 'percentage' ? '%' : ''}</TableCell>
                    <TableCell>
                      <FormControlLabel control={<Switch checked={c.isActive} onChange={() => toggleActive(c)} />} label={c.isActive ? 'Yes' : 'No'} />
                    </TableCell>
                    <TableCell>{c.statistics?.totalUsed ?? 0}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => viewUsage(c)} title="Usage" aria-label="Usage" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}><VisibilityIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => { setEditCoupon(c); setEditOpen(true); }} title="Edit" aria-label="Edit" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(c)} title="Delete" aria-label="Delete" sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'error.dark' } }}><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5,10,25]} component="div" count={total || 0} rowsPerPage={rowsPerPage} page={page} onPageChange={(e,newPage)=>{ setPage(newPage); fetchCoupons(newPage+1, rowsPerPage); }} onRowsPerPageChange={(e)=>{ const v = parseInt(e.target.value,10); setRowsPerPage(v); setPage(0); fetchCoupons(1, v); }} />
      </Paper>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth>
        <DialogTitle>Create Coupon</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}><TextField required fullWidth label="Code" value={form.code} onChange={(e)=>setForm(f=>({...f, code:e.target.value}))} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField required fullWidth label="Description" value={form.description} onChange={(e)=>setForm(f=>({...f, description:e.target.value}))} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField required fullWidth label="Type" value={form.discountType} onChange={(e)=>setForm(f=>({...f, discountType:e.target.value}))} helperText='"percentage" or "fixed"' /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField required fullWidth label="Value" type="number" value={form.discountValue} onChange={(e)=>setForm(f=>({...f, discountValue:parseFloat(e.target.value||0)}))} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e)=>setForm(f=>({...f, startDate:e.target.value}))} /></Grid>
            <Grid size={{ xs: 12, md: 4 }}><TextField required fullWidth type="date" label="Expires" InputLabelProps={{ shrink: true }} value={form.expiresAt} onChange={(e)=>setForm(f=>({...f, expiresAt:e.target.value}))} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label="Usage Limit (0 = unlimited)" type="number" value={form.usageLimit} onChange={(e)=>setForm(f=>({...f, usageLimit:parseInt(e.target.value||0,10)}))} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><FormControlLabel control={<Switch checked={form.isActive} onChange={(e)=>setForm(f=>({...f, isActive:e.target.checked}))} />} label="Active" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => { setEditOpen(false); setEditCoupon(null); }} fullWidth maxWidth="sm">
        <DialogTitle>Edit Coupon - {editCoupon?.code}</DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '80vh', overflowY: 'auto', pt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Code" value={editCoupon?.code || ''} disabled helperText="Code cannot be changed" /></Grid>
            <Grid size={{ xs: 12 }}><TextField required fullWidth label="Description" value={editCoupon?.description || ''} onChange={(e)=>setEditCoupon(c=>({...c, description: e.target.value}))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField required fullWidth label="Type" value={editCoupon?.discountType || ''} onChange={(e)=>setEditCoupon(c=>({...c, discountType: e.target.value}))} helperText='"percentage" or "fixed"' /></Grid>
            <Grid size={{ xs: 12 }}><TextField required fullWidth label="Discount Value" type="number" value={editCoupon?.discountValue || 0} onChange={(e)=>setEditCoupon(c=>({...c, discountValue: parseFloat(e.target.value||0)}))} helperText="Max 100" /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Max Discount" type="number" value={editCoupon?.maxDiscount !== null && editCoupon?.maxDiscount !== undefined ? editCoupon.maxDiscount : ''} onChange={(e)=>setEditCoupon(c=>({...c, maxDiscount: e.target.value ? parseFloat(e.target.value) : null}))} helperText="Maximum discount amount" /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Min Purchase" type="number" value={editCoupon?.minPurchase || 0} onChange={(e)=>setEditCoupon(c=>({...c, minPurchase: parseFloat(e.target.value||0)}))} helperText="Minimum purchase required" /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Per User Limit" type="number" value={editCoupon?.perUserLimit || 1} onChange={(e)=>setEditCoupon(c=>({...c, perUserLimit: parseInt(e.target.value||1,10)}))} helperText="Times per user" /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth label="Usage Limit" type="number" value={editCoupon?.usageLimit !== null && editCoupon?.usageLimit !== undefined ? editCoupon.usageLimit : ''} onChange={(e)=>setEditCoupon(c=>({...c, usageLimit: e.target.value ? parseInt(e.target.value,10) : null}))} helperText="0 = unlimited" /></Grid>
            <Grid size={{ xs: 12 }}><TextField fullWidth type="date" label="Start Date" InputLabelProps={{ shrink: true }} value={editCoupon?.startDate ? (typeof editCoupon.startDate === 'string' ? editCoupon.startDate.split('T')[0] : editCoupon.startDate) : ''} onChange={(e)=>setEditCoupon(c=>({...c, startDate: e.target.value}))} /></Grid>
            <Grid size={{ xs: 12 }}><TextField required fullWidth type="date" label="End Date *" InputLabelProps={{ shrink: true }} value={editCoupon?.endDate ? (typeof editCoupon.endDate === 'string' ? editCoupon.endDate.split('T')[0] : editCoupon.endDate) : ''} onChange={(e)=>setEditCoupon(c=>({...c, endDate: e.target.value}))} /></Grid>
            <Grid size={{ xs: 12 }}><FormControlLabel control={<Switch checked={Boolean(editCoupon?.isActive)} onChange={(e)=>setEditCoupon(c=>({...c, isActive: e.target.checked}))} />} label="Active" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setEditOpen(false); setEditCoupon(null); }}>Cancel</Button>
          <Button onClick={async () => {
            if(!editCoupon) return;
            setEditing(true);
            try {
              const id = editCoupon.id || editCoupon._id;

              // validate (include code so the shared validator doesn't fail)
              const validationError = validateCouponPayload({
                code: editCoupon.code,
                description: editCoupon.description,
                discountType: editCoupon.discountType,
                discountValue: editCoupon.discountValue,
                endDate: editCoupon.endDate
              });
              if (validationError) {
                showMessage(validationError, 'error');
                setEditing(false);
                return;
              }

              const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/coupons/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: JSON.stringify({
                  description: editCoupon.description,
                  discountType: editCoupon.discountType,
                  discountValue: editCoupon.discountValue,
                  maxDiscount: editCoupon.maxDiscount !== '' ? editCoupon.maxDiscount : null,
                  minPurchase: editCoupon.minPurchase || 0,
                  perUserLimit: editCoupon.perUserLimit || 1,
                  startDate: editCoupon.startDate ? new Date(editCoupon.startDate).toISOString() : undefined,
                  endDate: editCoupon.endDate ? new Date(editCoupon.endDate).toISOString() : undefined,
                  usageLimit: editCoupon.usageLimit !== '' ? editCoupon.usageLimit : null,
                  isActive: editCoupon.isActive
                })
              });

              const text = await res.text();
              let json = null;
              try { json = text ? JSON.parse(text) : null; } catch(e){ json = { message: text }; }

              if (!res.ok) {
                const msg = json?.message || 'Failed to update coupon';
                showMessage(msg, 'error');
                throw new Error(msg);
              }

              showMessage('Coupon updated', 'success');
              setEditOpen(false);
              setEditCoupon(null);
              fetchCoupons(page+1, rowsPerPage);
            } catch (err) {
              console.error('update coupon error', err);
            } finally {
              setEditing(false);
            }
          }} variant="contained" disabled={editing}>{editing ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={usageOpen} onClose={() => setUsageOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Coupon Usage</DialogTitle>
        <DialogContent dividers>
          {usageData ? (
            <Box>
              <Typography variant="body2">Total used: {usageData.pagination?.total || usageData.total || 0}</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Purchase</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Discount</TableCell>
                      <TableCell>Final</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageData.usage && usageData.usage.length ? usageData.usage.map(u => (
                      <TableRow key={u.id || u._id}><TableCell>{u.user?.name} ({u.user?.email})</TableCell><TableCell>{u.purchase?.planName} (₹{u.purchase?.amount})</TableCell><TableCell>{u.usedAt ? new Date(u.usedAt).toLocaleString() : '—'}</TableCell><TableCell>₹{u.discountAmount}</TableCell><TableCell>₹{u.finalAmount}</TableCell></TableRow>
                    )) : <TableRow><TableCell colSpan={5} align="center">No usage</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={2}><CircularProgress /></Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      {message && (
        <Box sx={{ position: 'fixed', right: 20, bottom: 20, zIndex: 9999 }}>
          <Paper sx={{ p: 1, background: message.severity === 'error' ? '#f44336' : message.severity === 'success' ? '#4caf50' : '#2196f3', color: 'white' }}>
            <Typography>{message.text}</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
}
