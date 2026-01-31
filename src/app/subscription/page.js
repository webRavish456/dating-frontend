"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  Stack,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Skeleton
} from "@mui/material";
import SkeletonCard from "../../components/SkeletonCard";
import TableSkeleton from "../../components/TableSkeleton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search and filters
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");

  // Details view state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);
  const [planDetails, setPlanDetails] = useState(null);
  const [detailsEditMode, setDetailsEditMode] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    price: 0,
    type: "monthly",
    features: {
      dailyLikes: 0,
      dailySuperLikes: 0,
      unlimitedSwipes: false,
      seeWhoLiked: false,
      premiumFilters: false,
      boostProfile: false,
      readReceipts: false,
      prioritySupport: false,
      advancedAnalytics: false
    },
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${API_BASE}/api/admin/plans`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch plans');
      // Normalize plan fields for frontend (planName, likes, superLikes)
      const normalized = (json.data || []).map(p => ({
        id: p.id || p._id,
        planName: p.name || p.planName || '',
        planPrice: p.price || p.planPrice || 0,
        name: p.name || p.planName || '',
        price: p.price || p.planPrice || 0,
        features: p.features || {},
        likes: p.features?.dailyLikes ?? p.planDetail?.likes ?? 0,
        superLikes: p.features?.dailySuperLikes ?? p.planDetail?.superLikes ?? 0,
        createdAt: p.createdAt
      }));
      setPlans(normalized);
      setFilteredPlans(normalized);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filter plans when search/filters change
  useEffect(() => {
    let filtered = plans.filter((p) => {
      const name = (p.name || p.planName || '').toString().toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) || (p.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPlan = planFilter === 'All' || name === planFilter.toLowerCase();

      let matchesPrice = true;
      if (priceFilter === 'Low') {
        matchesPrice = (p.price || p.planPrice || 0) <= 500;
      } else if (priceFilter === 'Medium') {
        const price = (p.price || p.planPrice || 0);
        matchesPrice = price > 500 && price <= 800;
      } else if (priceFilter === 'High') {
        matchesPrice = (p.price || p.planPrice || 0) > 800;
      }

      return matchesSearch && matchesPlan && matchesPrice;
    });

    setFilteredPlans(filtered);
    setPage(0);
  }, [plans, searchTerm, planFilter, priceFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openMenu = (e, plan) => {
    setAnchorEl(e.currentTarget);
    setSelectedPlan(plan);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };

  // Alias for older handler name used in templates
  const handleMenuClick = (e, plan) => openMenu(e, plan);

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPlan(null);
  };
  const openCreate = () => {
    setFormState({
      name: "",
      price: 0,
      type: "monthly",
      features: {
        dailyLikes: 0,
        dailySuperLikes: 0,
        unlimitedSwipes: false,
        seeWhoLiked: false,
        premiumFilters: false,
        boostProfile: false,
        readReceipts: false,
        prioritySupport: false,
        advancedAnalytics: false
      },
      isActive: true
    });
    setCreateOpen(true);
  };

  const openEdit = (plan) => {
    setFormState({
      name: plan.name,
      price: plan.price,
      type: plan.type,
      features: plan.features || {},
      isActive: plan.isActive
    });
    setEditOpen(true);
    closeMenu();
  };

  // Open details dialog (read & edit)
  const openPlanDetails = (plan) => {
    setSelectedPlan(plan);
    // make a shallow copy to keep edits local until saved
    setPlanDetails(JSON.parse(JSON.stringify(plan)));
    setDetailsError(null);
    setDetailsEditMode(false);
    setDetailsOpen(true);
    closeMenu();
  };

  const handleDetailsChange = (field, value) => {
    setPlanDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleDetailsFeatureChange = (key, value) => {
    setPlanDetails(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));
  };
  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (key, value) => {
    setFormState(prev => ({ ...prev, features: { ...prev.features, [key]: value } }));
  };

  const tokenHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const submitCreate = async () => {
    setSubmitting(true);
    try {
      const payload = {
        planName: formState.name,
        planPrice: formState.price,
        planType: formState.type,
        features: formState.features,
        isActive: formState.isActive
      };
      const res = await fetch(`${API_BASE}/api/admin/plans`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Create failed');
      setCreateOpen(false);
      fetchPlans();
    } catch (err) {
      alert(err.message || 'Error creating subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const submitEdit = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    try {
      const payload = {
        planPrice: formState.price,
        planType: formState.type,
        features: formState.features,
        isActive: formState.isActive
      };
      const res = await fetch(`${API_BASE}/api/admin/plans/${selectedPlan.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...tokenHeader() },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Update failed');
      setEditOpen(false);
      closeMenu();
      setSelectedPlan(null);
      fetchPlans();
    } catch (err) {
      alert(err.message || 'Error updating subscription');
    } finally {
      setSubmitting(false);
    }
  };

  const deactivatePlan = async (plan) => {
    if (!confirm(`Deactivate subscription "${plan.name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/plans/${plan.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { ...tokenHeader() }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Deactivate failed');
      fetchPlans();
      closeMenu();
      setSelectedPlan(null);
    } catch (err) {
      alert(err.message || 'Error deactivating subscription');
    }
  };

  if (loading) {
    return (
      <Layout>
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Skeleton variant="text" width={220} height={40} />
            <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
          </Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
          <TableSkeleton rows={8} cols={6} />
        </Box>
      </Layout>
    );
  }

  // Derived stats for the view
  const totalPlans = plans.length;
  const premiumPlans = plans.filter(p => String(p.name || p.planName || '').toLowerCase() === 'premium').length;
  const platinumPlans = plans.filter(p => String(p.name || p.planName || '').toLowerCase() === 'platinum').length;
  const goldPlans = plans.filter(p => String(p.name || p.planName || '').toLowerCase() === 'gold').length;

  // Unique plan names (lowercased for consistent filtering)
  const uniquePlans = [...new Set(plans.map(p => (p.name || p.planName || '').toString().toLowerCase()).filter(Boolean))];

  // Helper to map plan name to Chip color
  const getPlanColor = (planName) => {
    const name = String(planName || '').toLowerCase();
    switch (name) {
      case 'gold': return 'warning';
      case 'premium': return 'success';
      case 'free': return 'default';
      case 'platinum': return 'info';
      default: return 'default';
    }
  };

  // Human-readable labels for plan features (Daily Likes, Daily Super Likes, etc.)
  const getFeatureLabel = (key) => {
    const labels = {
      dailyLikes: 'Daily Likes',
      dailySuperLikes: 'Daily Super Likes',
      unlimitedSwipes: 'Unlimited Swipes',
      rewindAllowed: 'Rewind Allowed',
      seeWhoLiked: 'See Who Liked',
      premiumFilters: 'Premium Filters',
      boostProfile: 'Boost Profile',
      readReceipts: 'Read Receipts',
      prioritySupport: 'Priority Support',
      advancedAnalytics: 'Advanced Analytics',
    };
    return labels[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Subscriptions</Typography>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={openCreate}>Create Subscription</Button>
          </Stack>
        </Box>

        <Box>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Platinum Plans</Typography>
                      <PaymentIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{platinumPlans}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Platinum plans</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Premium Plans</Typography>
                      <PaymentIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{premiumPlans}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Premium plans</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Total Plans</Typography>
                      <PaymentIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{totalPlans}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>All plans</Typography>
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
                    placeholder="Search plans..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Plan Type</InputLabel>
                    <Select
                      value={planFilter}
                      label="Plan Type"
                      onChange={(e) => setPlanFilter(e.target.value)}
                    >
                      <MenuItem value="All">All</MenuItem>
                      {uniquePlans.map(plan => (
                        <MenuItem key={plan} value={plan}>{plan}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Price Range</InputLabel>
                    <Select
                      value={priceFilter}
                      label="Price Range"
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Low">Low (≤ ₹500)</MenuItem>
                      <MenuItem value="Medium">Medium (₹501-800)</MenuItem>
                      <MenuItem value="High">High ($gt ₹800)</MenuItem>
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
                      setPlanFilter("All");
                      setPriceFilter("All");
                    }}
                    sx={{ background: "linear-gradient(135deg, #F05A7E 0%, #F05A7E 100%)" }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Plans Table */}
            <Paper sx={{ overflow: 'hidden' }}>
              <Box sx={{ px: 2, py: 1.5, bgcolor: '#fafafa', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#2E2E2E' }}>Subscription Plans</Typography>
                <Typography variant="caption" color="text.secondary">Plan name, price, daily likes & super likes, and actions</Typography>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ background: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Plan Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price (₹)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Daily Likes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Daily Super Likes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Created At</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPlans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography variant="body1" color="text.secondary">
                            No plans found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((plan) => (
                          <TableRow key={plan.id} hover>
                            <TableCell>
                              <Box>
                                <Chip
                                  label={plan.planName}
                                  color={getPlanColor(plan.planName)}
                                  size="small"
                                  sx={{ mb: 1 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                  ID: {plan.id.slice(-8)}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                ₹{plan.planPrice}
                              </Typography>
                            </TableCell>
                            <TableCell>{plan.likes}</TableCell>
                            <TableCell>{plan.superLikes}</TableCell>
                            <TableCell>{plan.createdAt ? new Date(plan.createdAt).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <IconButton size="small" onClick={() => openPlanDetails(plan)} title="View details" aria-label="View details" sx={{ border: '1px solid', borderColor: 'grey.400', color: 'grey.700', '&:hover': { borderColor: 'grey.600', bgcolor: 'action.hover' } }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => plan && confirm('Deactivate this subscription?') && deactivatePlan(plan)} title="Delete" aria-label="Delete" sx={{ border: '1px solid', borderColor: 'error.main', color: 'error.main', '&:hover': { bgcolor: 'error.light' } }}>
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
                count={filteredPlans.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>

            {/* Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => { setDetailsOpen(false); setPlanDetails(null); setDetailsEditMode(false); }} maxWidth="md" fullWidth>
              <DialogTitle>
                Subscription Details
                <Box sx={{ position: 'absolute', right: 8, top: 8 }}>
                  <Button size="small" variant="outlined" onClick={() => setDetailsEditMode(!detailsEditMode)} sx={{ mr: 1 }}>{detailsEditMode ? 'Cancel Edit' : 'Edit'}</Button>
                  <Button size="small" color="error" onClick={() => { if(planDetails) { if(confirm('Deactivate this subscription?')) { deactivatePlan(planDetails); setDetailsOpen(false); } } }}>Deactivate</Button>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                {detailsLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={160}><CircularProgress /></Box>
                ) : detailsError ? (
                  <Typography color="error">{detailsError}</Typography>
                ) : planDetails ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>{planDetails.name || planDetails.planName}</Typography>
                        <Typography variant="body2">ID: {planDetails.id}</Typography>
                        <Typography variant="body2">Type: {planDetails.type || planDetails.planType}</Typography>
                        <Typography variant="body2">Active: {planDetails.isActive ? 'Yes' : 'No'}</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="subtitle2">Statistics</Typography>
                        <Typography variant="body2">Total Purchases: {planDetails.statistics?.totalPurchases ?? planDetails.statistics?.totalPurchases ?? 0}</Typography>
                        <Typography variant="body2">Active Subscriptions: {planDetails.statistics?.activeSubscriptions ?? 0}</Typography>
                        <Typography variant="body2">Total Revenue: {planDetails.statistics?.totalRevenue ?? 0}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <Typography variant="subtitle2">Pricing</Typography>
                      {detailsEditMode ? (
                        <TextField fullWidth label="Price" type="number" value={planDetails.price ?? planDetails.planPrice} onChange={(e) => handleDetailsChange('price', Number(e.target.value))} sx={{ mb: 1 }} />
                      ) : (
                        <Typography variant="h6">₹{planDetails.price ?? planDetails.planPrice}</Typography>
                      )}

                      <Divider sx={{ my: 1 }} />

                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Features</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Daily Likes, Daily Super Likes, Unlimited Swipes, Rewind, etc.</Typography>
                      <Grid container spacing={1} sx={{ mt: 0.5 }}>
                        {Object.entries(planDetails.features || {}).map(([k,v]) => (
                          <Grid size={{ xs: 6 }} key={k}>
                            {typeof v === 'boolean' ? (
                              <FormControlLabel control={<Switch checked={v} onChange={(e) => handleDetailsFeatureChange(k, e.target.checked)} />} label={getFeatureLabel(k)} />
                            ) : (
                              <TextField label={getFeatureLabel(k)} type="number" value={v} onChange={(e) => handleDetailsFeatureChange(k, Number(e.target.value))} fullWidth />
                            )}
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography>No details available</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setDetailsOpen(false); setPlanDetails(null); setDetailsEditMode(false); }}>Close</Button>
                {detailsEditMode && <Button variant="contained" onClick={async () => {
                  if(!planDetails || !selectedPlan) return;
                  setDetailsLoading(true);
                  setDetailsError(null);
                  try {
                    const payload = {
                      planPrice: planDetails.price ?? planDetails.planPrice,
                      planType: planDetails.type ?? planDetails.planType,
                      features: planDetails.features || {},
                      isActive: planDetails.isActive
                    };
                    const res = await fetch(`${API_BASE}/api/admin/plans/${selectedPlan.id}`, {
                      method: 'PUT',
                      credentials: 'include',
                      headers: { 'Content-Type': 'application/json', ...tokenHeader() },
                      body: JSON.stringify(payload)
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.message || 'Update failed');
                    setDetailsEditMode(false);
                    setDetailsOpen(false);
                    setPlanDetails(null);
                    setSelectedPlan(null);
                    fetchPlans();
                  } catch (err) {
                    setDetailsError(err.message || 'Error updating subscription');
                  } finally {
                    setDetailsLoading(false);
                  }
                }}>Save</Button>}
              </DialogActions>
            </Dialog>

            {/* Add Plan Dialog */}
            <Dialog open={createOpen} onClose={() => { setCreateOpen(false); setFormState({ name: "", price: 0, type: "monthly", features: { dailyLikes: 0, dailySuperLikes: 0, unlimitedSwipes: false, seeWhoLiked: false, premiumFilters: false, boostProfile: false, readReceipts: false, prioritySupport: false, advancedAnalytics: false }, isActive: true }); }} maxWidth="md" fullWidth>
              <DialogTitle>Add New Subscription</DialogTitle>
              <DialogContent>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Subscription Name"
                      value={formState.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g., Premium"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={formState.price}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      placeholder="e.g., 299"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Daily Likes"
                      type="number"
                      value={formState.features.dailyLikes}
                      onChange={(e) => handleFeatureChange('dailyLikes', Number(e.target.value))}
                      placeholder="e.g., 50"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Daily Super Likes"
                      type="number"
                      value={formState.features.dailySuperLikes}
                      onChange={(e) => handleFeatureChange('dailySuperLikes', Number(e.target.value))}
                      placeholder="e.g., 5"
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { setCreateOpen(false); setFormState({ name: "", price: 0, type: "monthly", features: { dailyLikes: 0, dailySuperLikes: 0, unlimitedSwipes: false, seeWhoLiked: false, premiumFilters: false, boostProfile: false, readReceipts: false, prioritySupport: false, advancedAnalytics: false }, isActive: true }); }}>Cancel</Button>
                <Button 
                  onClick={submitCreate} 
                  variant="contained"
                  sx={{ background: "linear-gradient(135deg, #F05A7E 0%, #F05A7E 100%)" }}
                >
                  Create Subscription
                </Button>
              </DialogActions>
            </Dialog>
        </Box>
      </Box>
    </Layout>
  );
}