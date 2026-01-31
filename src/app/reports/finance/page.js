"use client";
import { useEffect, useState } from "react";
import Layout from "../../../components/Layout";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function FinanceReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState(365);
  const [period, setPeriod] = useState("monthly");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/admin/purchases/analytics?period=${period}&days=${days}`,
        {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load finance data");
      setAnalytics(json.data);
    } catch (err) {
      setError(err.message || "Error loading finance report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days, period]);

  if (loading && !analytics) {
    return (
      <Layout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  const ov = analytics?.overview || analytics?.overallStats || {};

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
          Finance Report
        </Typography>

        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Period</InputLabel>
            <Select label="Period" value={period} onChange={(e) => setPeriod(e.target.value)}>
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Days</InputLabel>
            <Select label="Days" value={String(days)} onChange={(e) => setDays(Number(e.target.value))}>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
              <MenuItem value={365}>Last 365 days</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {analytics && (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Total Revenue</Typography>
                      <PaymentIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{ov.totalRevenue != null ? Number(ov.totalRevenue).toLocaleString() : "—"}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Total revenue</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Net Revenue</Typography>
                      <AccountBalanceIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{ov.netRevenue != null ? Number(ov.netRevenue).toLocaleString() : (ov.totalRevenue != null ? Number(ov.totalRevenue).toLocaleString() : "—")}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Net revenue</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Refunded</Typography>
                      <ReceiptIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{ov.refundedAmount != null ? Number(ov.refundedAmount).toLocaleString() : "0"}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Refunded amount</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Total Transactions</Typography>
                      <TrendingUpIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>{ov.totalPurchases ?? "—"}</Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Total transactions</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {analytics.planPerformance && analytics.planPerformance.length > 0 && (
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Revenue by Plan
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Transactions</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Avg. Order</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {analytics.planPerformance.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.planName ?? row._id ?? "—"}</TableCell>
                          <TableCell align="right">{row.totalPurchases ?? "—"}</TableCell>
                          <TableCell align="right">{row.totalRevenue != null ? Number(row.totalRevenue).toLocaleString() : "—"}</TableCell>
                          <TableCell align="right">{row.averageRevenue != null ? Number(row.averageRevenue).toFixed(0) : "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}

            {(() => {
              const trends = analytics.trends?.data || analytics.revenueTrends || [];
              return trends.length > 0 && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Revenue Trends
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Period</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Revenue</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Purchases</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="right">Unique Users</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {trends.slice(-12).map((row, i) => (
                          <TableRow key={i}>
                            <TableCell>{row.period ?? "—"}</TableCell>
                            <TableCell align="right">{row.revenue != null ? Number(row.revenue).toLocaleString() : "—"}</TableCell>
                            <TableCell align="right">{row.purchases ?? "—"}</TableCell>
                            <TableCell align="right">{row.uniqueUsers ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })()}
          </>
        )}
      </Box>
    </Layout>
  );
}
