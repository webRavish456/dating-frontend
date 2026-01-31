"use client";
import { useState, useEffect } from "react";
import  axios  from "axios";
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
  Chip,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleIcon from "@mui/icons-material/People";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import CloseIcon from '@mui/icons-material/Close';
import SkeletonCard from "../../components/SkeletonCard";
import TableSkeleton from "../../components/TableSkeleton";

const formatDate = (val) => {
  if (!val) return '—';
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return val; }
};

export default function UserManagement() {
  const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';
  
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  // Fetch users from API
  const getUsers = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const result = await fetch(`${API_BASE}/api/admin/users`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const jsonResult = await result.json();
      
      if (jsonResult.status === true && jsonResult.data) {
        // Transform API data to match component needs (handle missing fields)
        const transformedUsers = jsonResult.data.map(user => ({
          id: user.userId || user.id || 'unknown',
          name: user.userName || user.name || 'Unknown',
          email: user.userMail || user.email || 'N/A',
          city: user.userCity || user.city || 'N/A',
          status: user.userstatus || user.status || 'Unknown',
          joinedDate: user.userJoinedOn || user.joinedDate || '—',
        }));
        
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } else {
        setError("Failed to fetch user data");
      }
    } catch (err) {
      setError("Error fetching users: " + err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    getUsers();
  },[]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      const matchesCity = cityFilter === "All" || user.city === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });
    
    setFilteredUsers(filtered);
    setPage(0);
  }, [users, searchTerm, statusFilter, cityFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const openUserDetails = async (user) => {
    handleMenuClose();
    setDetailsError(null);
    setUserDetails(null);
    setDetailsOpen(true);
    setDetailsLoading(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${user.id}/details`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch details');
      setUserDetails(json.data);
    } catch (err) {
      setDetailsError(err.message || 'Error fetching user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setUserDetails(null);
    setDetailsError(null);
  };

  const handleAction = async (action, user) => {
    const u = user || selectedUser;
    if (u) {
      const token = localStorage.getItem("token");
      if (action === "delete") {
        await fetch(`${API_BASE}/api/admin/users/${u.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          }
        });
        alert(`${action} successful!`);
        getUsers();
        handleMenuClose();
      }
      console.log(`${action} user:`, u.id);
      

      // Update local state for demo
      // setUsers(users.map(user => 
      //   user.id === selectedUser.id 
      //     ? { ...user, status: action === "approve" ? "Active" : action === "reject" ? "Inactive" : "Banned" }
      //     : user
      // ));

    }
    
  };

  const handleStatus = async (action, user) => {
    const u = user || selectedUser;
    if (!u) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/api/admin/users/${u.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status: action }),
    });
    getUsers();
    handleMenuClose();
  };




  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "success";
      case "Inactive": return "warning";
      case "Banned": return "error";
      case "Unknown": return "default";
      default: return "default";
    }
  };

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(users.map(user => user.city).filter(city => city !== "N/A"))];

  // Calculate stats
  const activeUsers = users.filter(u => u.status === "Active").length;
  const inactiveUsers = users.filter(u => u.status === "Inactive").length;
  const totalUsers = users.length;
  const usersWithEmail = users.filter(u => u.email !== "N/A").length;

  if (loading) {
    return (
      <Layout>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E", mb: 3 }}>
            User Management
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <Skeleton variant="rectangular" width={200} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
            </Box>
          </Paper>
          <TableSkeleton rows={10} cols={7} />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box>
          <Typography variant="h4" color="error" sx={{ mb: 2 }}>
            Error loading users
          </Typography>
          <Typography variant="body1">{error}</Typography>
          <Button variant="contained" onClick={getUsers} sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E", mb: 3 }}>
          User Management
        </Typography>

        {/* Stats Cards - Grid Sizes */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Active Users</Typography>
                  <PeopleIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{activeUsers}</Typography>
                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Active users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Inactive Users</Typography>
                  <PeopleIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{inactiveUsers}</Typography>
                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Inactive users</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Users with Email</Typography>
                  <PeopleIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{usersWithEmail}</Typography>
                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Users with email</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Total Users</Typography>
                  <PeopleIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{totalUsers}</Typography>
                <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>All registered users</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="Unknown">Unknown</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={cityFilter}
                  label="City"
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <MenuItem value="All">All</MenuItem>
                  {uniqueCities.map(city => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<FilterListIcon />}
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setCityFilter("All");
                }}
                sx={{ background: "linear-gradient(135deg, #F05A7E 0%, #F05A7E 100%)" }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Users Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>City</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body1" color="text.secondary">
                        No users found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {user.id.slice(-8)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {user.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{user.city}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.status}
                            color={getStatusColor(user.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(user.joinedDate)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => openUserDetails(user)} title="View details" aria-label="View details" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleStatus('Active', user)} title="Activate" aria-label="Activate" sx={{ border: '1px solid', borderColor: 'success.main', color: 'success.main', '&:hover': { bgcolor: 'success.light' } }}>
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleStatus('Inactive', user)} title="Deactivate" aria-label="Deactivate" sx={{ border: '1px solid', borderColor: 'warning.main', color: 'warning.main', '&:hover': { bgcolor: 'warning.light' } }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleStatus('Banned', user)} title="Ban" aria-label="Ban" sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light' } }}>
                              <BlockIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleAction('delete', user)} title="Delete" aria-label="Delete" sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light' } }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
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
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onClose={closeDetails} maxWidth="md" fullWidth>
          <DialogTitle>
            User Details
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
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                <CircularProgress />
              </Box>
            ) : detailsError ? (
              <Typography color="error">{detailsError}</Typography>
            ) : userDetails ? (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <Avatar src={userDetails.profile?.profileImage} sx={{ width: 120, height: 120 }} />
                    <Typography variant="h6" sx={{ mt: 2 }}>{userDetails.basicInfo.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{userDetails.basicInfo.email}</Typography>
                    <Typography variant="body2" color="text.secondary">{userDetails.basicInfo.mobile}</Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Profile</Typography>
                  <Typography variant="body2">Gender: {userDetails.basicInfo.gender}</Typography>
                  <Typography variant="body2">Age: {userDetails.basicInfo.age}</Typography>
                  <Typography variant="body2">Plan: {userDetails.basicInfo.plan}</Typography>
                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>Location</Typography>
                  <Typography variant="body2">{userDetails.location?.address?.city}, {userDetails.location?.address?.state}</Typography>
                  <Typography variant="body2">{userDetails.location?.address?.street}</Typography>
                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>Statistics</Typography>
                  <Typography variant="body2">Total Matches: {userDetails.statistics.totalMatches}</Typography>
                  <Typography variant="body2">Total Swipes: {userDetails.statistics.totalSwipes}</Typography>
                  <Typography variant="body2">Likes Given: {userDetails.statistics.likesGiven}</Typography>
                  <Typography variant="body2">Likes Received: {userDetails.statistics.likesReceived}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Buying History</Typography>
                  {userDetails.plans?.buyingHistory?.length ? (
                    userDetails.plans.buyingHistory.map((p, idx) => (
                      <Box key={idx} sx={{ my: 1 }}>
                        <Typography variant="body2">{p.planName} - Expires: {p.expiryDate}</Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2">No purchases</Typography>
                  )}
                </Grid>
              </Grid>
            ) : (
              <Typography>No details available</Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetails}>Close</Button>
          </DialogActions>
        </Dialog>      </Box>
    </Layout>
  );
}