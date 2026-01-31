"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        // include credentials if you expect the server to set an httpOnly cookie
        credentials: 'include'
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Login failed");
      } else {
        setSuccess(result.message || "Login Successful!");
        // store token (if returned) and/or rely on cookie-based auth
        if (result.access_token) {
          localStorage.setItem("token", result.access_token);
        }
        setTimeout(() => {
          router.push("/");
        }, 500);
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Custom style for transparent background and dark text
  const inputSx = {
    marginTop: 1,
    '& .MuiInputBase-root': {
      background: 'transparent',
      color: '#2E2E2E',
    },
    '& .MuiInputBase-input': {
      background: 'transparent',
      color: '#2E2E2E',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#fff',
    },
    // Helper text color white
    '& .MuiFormHelperText-root': {
      color: '#fff',
    },
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f7" }}>
      <div style={{ width: 400, padding: 24, border: "none", borderRadius: 16, background: "#3FA9C5", boxShadow: "0 2px 16px rgba(63,169,197,0.3)", position: "relative" }}>
        <h2 style={{ textAlign: "center", color: "#fff", fontWeight: 700, letterSpacing: 1, marginBottom: 28 }}>Admin Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: 16 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              variant="outlined"
              error={!!errors.email}
              helperText={errors.email ? errors.email.message : ""}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email address"
                }
              })}
              sx={inputSx}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password ? errors.password.message : ""}
              {...register("password", { required: "Password is required" })}
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      tabIndex={-1}
                      sx={{ color: '#111' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
          </div>
          {error && <div style={{ color: "#fff", marginBottom: 12, textAlign: "center" }}>{error}</div>}
          {success && <div style={{ color: "#fff", marginBottom: 12, textAlign: "center" }}>{success}</div>}
          <button type="submit" style={{ width: "100%", padding: 12, background: "#2E2E2E", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 16, marginTop: 8, cursor: "pointer", letterSpacing: 1 }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
} 