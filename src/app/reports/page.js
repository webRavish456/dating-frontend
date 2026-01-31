"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import TableSkeleton from "../../components/TableSkeleton";
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function ReportsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalReports, setTotalReports] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState(null);

  const fetchReports = async (p = 1, limit = 10, status = statusFilter) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const q = `page=${p}&limit=${limit}${status && status !== 'all' ? `&status=${status}` : ''}`;
      const res = await fetch(`${API_BASE}/api/admin/reports?${q}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load reports');
      setReports(json.data.reports || []);
      setTotalReports(json.data.pagination?.totalReports || json.data.totalReports || 0);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message || 'Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(page + 1, rowsPerPage, statusFilter);
  }, [page, rowsPerPage, statusFilter]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openDetails = async (reportId) => {
    if (!reportId) return;
    setDetailsOpen(true);
    setDetailsLoading(true);
    setReportDetails(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load report');
      setReportDetails(json.data);
    } catch (err) {
      setReportDetails({ error: err.message });
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setReportDetails(null);
  };

  const performAction = async (reportId, action, status = 'resolved') => {
    if (!confirm(`Perform '${action}' on this report?`)) return;
    const adminNotes = prompt('Admin notes (optional):', '');
    try {
      const token = localStorage.getItem('token');
      const body = { status, action, adminNotes };
      const res = await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Action failed');
      alert('Action successful');
      fetchReports(page + 1, rowsPerPage, statusFilter);
      if (detailsOpen) openDetails(reportId);
    } catch (err) {
      console.error('Action error:', err);
      alert('Error: ' + (err.message || 'unknown'));
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Reported Users — Reports</Typography>

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="ignored">Ignored</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Paper>
            <TableSkeleton rows={8} cols={8} />
          </Paper>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Report ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reported User</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reporter</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reported At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map(r => (
                    <TableRow key={r._id}>
                      <TableCell>{r._id}</TableCell>
                      <TableCell>{r.reportedUserId?.name || '—'}</TableCell>
                      <TableCell>{r.reporterUserId?.name || '—'}</TableCell>
                      <TableCell>{r.reason}</TableCell>
                      <TableCell>{r.description || '—'}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.report_date ? new Date(r.report_date).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <IconButton
                            size="small"
                            onClick={() => openDetails(r._id)}
                            title="View"
                            aria-label="View"
                            sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        <Button size="small" color="warning" onClick={() => performAction(r._id, 'warned', 'resolved')} sx={{ mr: 1 }}>Warn</Button>
                        <Button size="small" color="error" onClick={() => performAction(r._id, 'temporary_ban', 'resolved')} sx={{ mr: 1 }}>Suspend</Button>
                        <Button size="small" color="error" onClick={() => performAction(r._id, 'permanent_ban', 'resolved')}>Ban</Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalReports}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}

        <Dialog open={detailsOpen} onClose={closeDetails} fullWidth maxWidth="md">
          <DialogTitle>
            Report Details
            <IconButton
              aria-label="close"
              onClick={closeDetails}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {detailsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
            ) : reportDetails ? (
              reportDetails.error ? (
                <Typography color="error">{reportDetails.error}</Typography>
              ) : (
                <Box>
                  <Typography variant="subtitle1">Reported User</Typography>
                  <Typography sx={{ mb: 1 }}>{reportDetails.reportedUserId?.name} — {reportDetails.reportedUserId?.email}</Typography>

                  <Typography variant="subtitle1">Reporter</Typography>
                  <Typography sx={{ mb: 1 }}>{reportDetails.reporterUserId?.name} — {reportDetails.reporterUserId?.email}</Typography>

                  <Typography variant="subtitle1">Reason</Typography>
                  <Typography sx={{ mb: 1 }}>{reportDetails.reason}</Typography>

                  <Typography variant="subtitle1">Description</Typography>
                  <Typography sx={{ mb: 1 }}>{reportDetails.description || '—'}</Typography>

                  <Typography variant="subtitle1">Admin Notes</Typography>
                  <Typography sx={{ mb: 1 }}>{reportDetails.admin_notes || '—'}</Typography>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="contained" onClick={() => performAction(reportDetails._id, 'warned', 'resolved')}>Warn</Button>
                    <Button variant="contained" color="warning" onClick={() => performAction(reportDetails._id, 'temporary_ban', 'resolved')}>Suspend</Button>
                    <Button variant="contained" color="error" onClick={() => performAction(reportDetails._id, 'permanent_ban', 'resolved')}>Ban</Button>
                    <Button variant="outlined" onClick={() => performAction(reportDetails._id, 'none', 'resolved')}>Resolve</Button>
                    <Button variant="text" onClick={() => performAction(reportDetails._id, 'none', 'ignored')}>Ignore</Button>
                  </Box>
                </Box>
              )
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
