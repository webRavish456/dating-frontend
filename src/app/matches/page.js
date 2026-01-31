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
} from "@mui/material";
import TableSkeleton from "../../components/TableSkeleton";
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

export default function MatchesPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMatches, setTotalMatches] = useState(0);

  // Conversation modal
  const [convOpen, setConvOpen] = useState(false);
  const [convLoading, setConvLoading] = useState(false);
  const [conversation, setConversation] = useState(null);

  const fetchMatches = async (p = 1, limit = 10) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/matches?page=${p}&limit=${limit}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load matches");
      setMatches(json.data.matches || []);
      setTotalMatches(json.data.pagination?.totalMatches || 0);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err.message || "Error fetching matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(page + 1, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openConversation = async (conversationId) => {
    if (!conversationId) return;
    setConvOpen(true);
    setConvLoading(true);
    setConversation(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/conversations/${conversationId}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load conversation');
      setConversation(json.data);
    } catch (err) {
      setConversation({ error: err.message });
    } finally {
      setConvLoading(false);
    }
  };

  const closeConversation = () => {
    setConvOpen(false);
    setConversation(null);
  };

  const deleteConversation = async (conversationId) => {
    if (!confirm("Delete this conversation? This will remove messages and deactivate the conversation.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/conversations/${conversationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to delete conversation');
      // Refresh list
      fetchMatches(page + 1, rowsPerPage);
      alert('Conversation deleted successfully');
    } catch (err) {
      console.error('Delete conversation error:', err);
      alert('Error deleting conversation: ' + (err.message || 'unknown'));
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Match & Chat — Matches</Typography>

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
                    <TableCell sx={{ fontWeight: 700 }}>Match ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Matched At</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Match Type</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Activity</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Has Conversation</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Last Message</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {matches.map((m) => (
                    <TableRow key={m._id}>
                      <TableCell>{m._id}</TableCell>
                      <TableCell>
                        {m.users?.map(u => u.name).join(' — ')}
                      </TableCell>
                      <TableCell>{m.matchedAt ? new Date(m.matchedAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                      <TableCell>{m.matchType}</TableCell>
                      <TableCell>{m.lastActivity ? new Date(m.lastActivity).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                      <TableCell>{m.hasConversation ? 'Yes' : 'No'}</TableCell>
                      <TableCell>{m.lastMessage?.content || '—'}</TableCell>
                      <TableCell>
                        {m.conversationId && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => openConversation(m.conversationId)}
                              title="View"
                              aria-label="View"
                              sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => deleteConversation(m.conversationId)}
                              title="Delete"
                              aria-label="Delete"
                              sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light', color: 'error.dark' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalMatches}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        )}

        <Dialog open={convOpen} onClose={closeConversation} fullWidth maxWidth="md">
          <DialogTitle>
            Conversation Details
            <IconButton
              aria-label="close"
              onClick={closeConversation}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {convLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}><CircularProgress /></Box>
            ) : conversation ? (
              conversation.error ? (
                <Typography color="error">{conversation.error}</Typography>
              ) : (
                <Box>
                  <Typography variant="subtitle1">Conversation</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>Participants: {conversation.conversation?.participants?.map(p => p.name).join(', ')}</Typography>
                  <Typography variant="subtitle2">Messages</Typography>
                  {conversation.messages?.length ? (
                    conversation.messages.map(msg => (
                      <Box key={msg._id} sx={{ mb: 1, p: 1, borderRadius: 1, background: '#fafafa' }}>
                        <Typography variant="body2"><strong>{msg.sender?.name || msg.sender}</strong>: {msg.content}</Typography>
                        <Typography variant="caption">{msg.createdAt ? new Date(msg.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography>No messages found</Typography>
                  )}
                </Box>
              )
            ) : null}
          </DialogContent>
        </Dialog>
      </Box>
    </Layout>
  );
}
