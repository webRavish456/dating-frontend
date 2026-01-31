"use client";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import ChatIcon from "@mui/icons-material/Chat";
import PaymentIcon from "@mui/icons-material/Payment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SkeletonCard from "../components/SkeletonCard";
import ChartSkeleton from "../components/ChartSkeleton";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

const CHART_COLORS = ["#3FA9C5", "#6C63FF", "#00C49F", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#ff7c7c"];

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    paidUsers: 0,
    newUsersLastWeek: 0,
  });
  const [dailySignups, setDailySignups] = useState([]);
  const [purchasesByDate, setPurchasesByDate] = useState([]);
  const [planDistribution, setPlanDistribution] = useState([]);
  const [couponDistribution, setCouponDistribution] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const [systemRes, purchaseRes, couponRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/analytics/system`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_BASE}/api/admin/purchases/analytics?period=daily&days=90`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }),
          fetch(`${API_BASE}/api/admin/coupons/analytics`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }),
        ]);

        const systemJson = await systemRes.json();
        const purchaseJson = await purchaseRes.json();
        const couponJson = await couponRes.json();

        if (!systemRes.ok) throw new Error(systemJson.message || "Failed to fetch analytics");

        const d = systemJson.data || {};
        const ov = d.overview || {};
        const plans = d.plans || {};
        const trends = d.trends || {};

        setStats({
          totalUsers: ov.totalUsers ?? 0,
          totalMatches: ov.totalMatches ?? 0,
          paidUsers: plans.paid ?? 0,
          newUsersLastWeek: ov.newUsersLastWeek ?? 0,
        });

        const daily = trends.dailySignups || [];
        setDailySignups(
          daily.map((x) => ({
            date: x._id || x.date,
            signups: x.count ?? 0,
          }))
        );

        if (purchaseRes.ok && purchaseJson.data) {
          const trendsObj = purchaseJson.data.trends || {};
          const trendsData = Array.isArray(trendsObj) ? trendsObj : (trendsObj.data || []);
          setPurchasesByDate(
            (Array.isArray(trendsData) ? trendsData : []).map((x) => ({
              period: x.period || x._id || "-",
              purchases: x.purchases ?? 0,
              revenue: x.revenue ?? 0,
            }))
          );
          const planPerf = purchaseJson.data.planPerformance || [];
          setPlanDistribution(
            planPerf.map((p, i) => ({
              name: p.planName || p._id || "Plan",
              value: p.totalPurchases ?? 0,
              color: CHART_COLORS[i % CHART_COLORS.length],
            })).filter((x) => x.value > 0)
          );
        } else {
          setPurchasesByDate([]);
          setPlanDistribution([]);
        }

        if (couponRes.ok && couponJson.data) {
          const topCoupons = couponJson.data.topCoupons || [];
          setCouponDistribution(
            topCoupons.map((c, i) => ({
              name: c.code || "Coupon",
              value: c.usageCount ?? 0,
              color: CHART_COLORS[i % CHART_COLORS.length],
            })).filter((x) => x.value > 0)
          );
        } else {
          setCouponDistribution([]);
        }
      } catch (e) {
        setError(e.message || "Something went wrong");
        setStats({ totalUsers: 0, totalMatches: 0, paidUsers: 0, newUsersLastWeek: 0 });
        setDailySignups([]);
        setPurchasesByDate([]);
        setPlanDistribution([]);
        setCouponDistribution([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <Layout>
      <Box>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: "#2E2E2E" }}>
          Welcome to Dating App Admin Panel
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <SkeletonCard />
                </Grid>
              ))}
            </>     
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Total Users</Typography>
                      <PeopleIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>
                      {stats.totalUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>All registered users</Typography>
                  </CardContent>
                </Card>
              </Grid> 
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Active Matches</Typography>
                      <ChatIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>
                      {stats.totalMatches.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Active matches</Typography>
                  </CardContent>
                </Card>                         
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>Premium Users</Typography>
                      <PaymentIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>
                      {stats.paidUsers.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>Premium subscribers</Typography>
                  </CardContent>      
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}> 
                <Card sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#2E2E2E" }}>New This Week</Typography>
                      <TrendingUpIcon sx={{ fontSize: 28, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: "#2E2E2E" }}>
                      {stats.newUsersLastWeek.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>New signups (last 7 days)</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600, color: "#2E2E2E" }}>
          Dashboard Charts
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* 1) User kis date mein kaun sa plan liya - Plan purchases by date */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Plan purchases by date 
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={purchasesByDate} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="period" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="purchases" fill="#3FA9C5" name="Purchases" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Grid>

          {/* 2) Plan distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Plan distribution
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={planDistribution.length ? planDistribution : [{ name: "No data", value: 1, color: "#ccc" }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(planDistribution.length ? planDistribution : []).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Grid>

          {/* 3) User signup */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
               User signup (last 30 days)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dailySignups} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="signups" stroke="#00C49F" strokeWidth={2} name="Signups" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Grid>

          {/* 4) Coupon distribution */}
          <Grid size={{ xs: 12, md: 6 }}>
            {loading ? (
              <ChartSkeleton height={280} />
            ) : (
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Coupon distribution
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={couponDistribution.length ? couponDistribution : [{ name: "No data", value: 1, color: "#ccc" }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {(couponDistribution.length ? couponDistribution : []).map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </Grid>
        </Grid>

       
      </Box>
    </Layout>
  );
}
