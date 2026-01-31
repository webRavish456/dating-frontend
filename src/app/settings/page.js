"use client";
import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export default function SettingsPage() {
  const [emailLoading, setEmailLoading] = useState(true);
  const [razorpayLoading, setRazorpayLoading] = useState(true);
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    enabled: true,
  });
  const [razorpayConfig, setRazorpayConfig] = useState({
    keyId: "",
    apiSecret: "",
    enabled: true,
    isConfigured: false,
  });
  const [emailForm, setEmailForm] = useState({
    smtpHost: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpPassword: "",
    fromEmail: "",
    enabled: true,
  });
  const [razorpayForm, setRazorpayForm] = useState({
    keyId: "",
    apiSecret: "",
    enabled: true,
  });
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [showRazorpayKey, setShowRazorpayKey] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingRazorpay, setSavingRazorpay] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);
  const [razorpayMessage, setRazorpayMessage] = useState(null);

  const fetchEmailConfig = async () => {
    setEmailLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/admin/settings/email`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (res.ok && json.data) {
        const d = json.data;
        setEmailConfig({
          smtpHost: d.smtpHost || "",
          smtpPort: String(d.smtpPort || "587"),
          smtpUsername: d.smtpUsername || "",
          smtpPassword: d.smtpPassword || "",
          fromEmail: d.fromEmail || "",
          enabled: !!d.enabled,
        });
        setEmailForm({
          smtpHost: d.smtpHost || "",
          smtpPort: String(d.smtpPort || "587"),
          smtpUsername: d.smtpUsername || "",
          smtpPassword: "",
          fromEmail: d.fromEmail || "",
          enabled: !!d.enabled,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchRazorpayConfig = async () => {
    setRazorpayLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/admin/payment/config`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (res.ok && json.data?.razorpay) {
        const r = json.data.razorpay;
        setRazorpayConfig({
          keyId: r.keyId || "",
          apiSecret: "",
          enabled: r.isConfigured,
          isConfigured: r.isConfigured,
        });
        setRazorpayForm({
          keyId: r.keyId || "",
          apiSecret: "",
          enabled: r.isConfigured,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRazorpayLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailConfig();
    fetchRazorpayConfig();
  }, []);

  const handleSaveEmail = async () => {
    setEmailMessage(null);
    if (!emailForm.smtpHost || !emailForm.smtpUsername || !emailForm.smtpPassword) {
      setEmailMessage({ type: "error", text: "SMTP Host, SMTP Email and Password are required to validate." });
      return;
    }
    setSavingEmail(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/admin/settings/email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({
          smtpHost: emailForm.smtpHost,
          smtpPort: emailForm.smtpPort,
          smtpUsername: emailForm.smtpUsername,
          smtpPassword: emailForm.smtpPassword || "",
          fromEmail: emailForm.smtpUsername,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setEmailMessage({ type: "success", text: json.message || "Email settings saved successfully." });
        // Save (PUT) ke baad GET se data fetch karke form mein dikhao
        await fetchEmailConfig();
      } else {
        setEmailMessage({ type: "error", text: json.message || "Failed to save email settings." });
      }
    } catch (e) {
      setEmailMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveRazorpay = async () => {
    setRazorpayMessage(null);
    if (!razorpayForm.keyId || !razorpayForm.apiSecret) {
      setRazorpayMessage({ type: "error", text: "Razorpay Key ID and Key Secret are required." });
      return;
    }
    setSavingRazorpay(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch(`${API_BASE}/api/admin/payment/razorpay`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify({
          keyId: razorpayForm.keyId,
          apiSecret: razorpayForm.apiSecret,
          testMode: true,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setRazorpayMessage({ type: "success", text: json.message || "Razorpay settings saved successfully." });
        // Save (PUT) ke baad GET se data fetch karke form mein dikhao (secret preserve)
        const savedSecret = razorpayForm.apiSecret;
        await fetchRazorpayConfig();
        setRazorpayForm((prev) => ({ ...prev, apiSecret: savedSecret }));
      } else {
        setRazorpayMessage({ type: "error", text: json.message || "Failed to save Razorpay settings." });
      }
    } catch (e) {
      setRazorpayMessage({ type: "error", text: e.message || "Network error." });
    } finally {
      setSavingRazorpay(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", py: 3, px: { xs: 2, md: 3 } }}>
        <Box mb={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Settings
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your application settings and configurations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Email Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box mb={2}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Email Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure SMTP settings for email notifications
              </Typography>

              {emailLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box display="flex" flexDirection="column" gap={2} flex={1}>
                    <TextField
                      label="SMTP Host"
                      size="small"
                      fullWidth
                      value={emailForm.smtpHost}
                      onChange={(e) => setEmailForm((f) => ({ ...f, smtpHost: e.target.value }))}
                      placeholder="smtp.gmail.com"
                    />
                    <TextField
                      label="SMTP Port"
                      size="small"
                      fullWidth
                      type="number"
                      value={emailForm.smtpPort}
                      onChange={(e) => setEmailForm((f) => ({ ...f, smtpPort: e.target.value }))}
                      placeholder="587"
                    />
                    <TextField
                      label="SMTP Email"
                      size="small"
                      fullWidth
                      value={emailForm.smtpUsername}
                      onChange={(e) => setEmailForm((f) => ({ ...f, smtpUsername: e.target.value }))}
                      placeholder="your-email@gmail.com"
                    />
                    <TextField
                      label="SMTP Password"
                      size="small"
                      fullWidth
                      type={showEmailPassword ? "text" : "password"}
                      value={emailForm.smtpPassword}
                      onChange={(e) => setEmailForm((f) => ({ ...f, smtpPassword: e.target.value }))}
                      placeholder="••••••••"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowEmailPassword((s) => !s)} edge="end" size="small">
                              {showEmailPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                  {emailMessage && (
                    <Alert severity={emailMessage.type} sx={{ mt: 2 }} onClose={() => setEmailMessage(null)}>
                      {emailMessage.text}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    startIcon={savingEmail ? <CircularProgress size={20} /> : null}
                    onClick={handleSaveEmail}
                    disabled={savingEmail}
                    sx={{ mt: 2 , textTransform: "none"}}
                  >
                    Save Email Settings
                  </Button>
                </>
              )}
            </Paper>
          </Grid>

          {/* Razorpay Settings */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
            
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Razorpay Settings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure Razorpay payment gateway credentials
              </Typography>

              {razorpayLoading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Box display="flex" flexDirection="column" gap={2} flex={1}>
                    <TextField
                      label="Razorpay Key ID"
                      size="small"
                      fullWidth
                      type={showRazorpayKey ? "text" : "password"}
                      value={razorpayForm.keyId}
                      onChange={(e) => setRazorpayForm((f) => ({ ...f, keyId: e.target.value }))}
                      placeholder={razorpayConfig.keyId || "rzp_live_xxxxxxxxxxxx"}
                      helperText={razorpayConfig.isConfigured && razorpayConfig.keyId ? `Current: ${razorpayConfig.keyId}` : null}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowRazorpayKey((s) => !s)} edge="end" size="small">
                              {showRazorpayKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Razorpay Key Secret"
                      size="small"
                      fullWidth
                      type={showRazorpaySecret ? "text" : "password"}
                      value={razorpayForm.apiSecret}
                      onChange={(e) => setRazorpayForm((f) => ({ ...f, apiSecret: e.target.value }))}
                      placeholder="***********"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowRazorpaySecret((s) => !s)} edge="end" size="small">
                              {showRazorpaySecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    </Box>
                  {razorpayMessage && (
                    <Alert severity={razorpayMessage.type} sx={{ mt: 2 }} onClose={() => setRazorpayMessage(null)}>
                      {razorpayMessage.text}
                    </Alert>
                  )}
                  <Button
                    variant="contained"
                    startIcon={savingRazorpay ? <CircularProgress size={20} /> : null}
                    onClick={handleSaveRazorpay}
                    disabled={savingRazorpay}
                    sx={{ mt: 2, textTransform: "none" }}
                  >
                    Save Razorpay settings
                  </Button>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  );
}
