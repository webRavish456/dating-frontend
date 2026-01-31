"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "../../../components/Layout";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControlLabel,
  Switch,
} from "@mui/material";

export default function StaticPageEditor() {
  const { pageKey } = useParams();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageKey}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load page');
      const p = json.data;
      setTitle(p.title || '');
      setContent(p.content || '');
      setSeoTitle(p.seoTitle || '');
      setSeoDescription(p.seoDescription || '');
      setSeoKeywords((p.seoKeywords || []).join(', '));
      setIsPublished(!!p.isPublished);
    } catch (err) {
      console.error('Error loading page:', err);
      setError(err.message || 'Error loading page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (pageKey) fetchPage(); }, [pageKey]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const body = {
        title,
        content,
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords.split(',').map(s => s.trim()).filter(Boolean),
        isPublished
      };
      const res = await fetch(`${API_BASE}/api/admin/cms/pages/${pageKey}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save failed');
      alert('Page saved successfully');
      router.push('/cms');
    } catch (err) {
      console.error('Save error:', err);
      alert('Error saving: ' + (err.message || 'unknown'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <Layout>
      <Box sx={{ p: 3 }}><CircularProgress/></Box>
    </Layout>
  );

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Edit Static Page — {pageKey}</Typography>
        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Content (HTML)" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline minRows={8} sx={{ mb: 2 }} />

        <Typography variant="h6" sx={{ mt: 2 }}>SEO</Typography>
        <TextField label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="SEO Keywords (comma separated)" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <FormControlLabel control={<Switch checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />} label="Published" />

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="outlined" onClick={() => router.push('/cms')}>Back</Button>
        </Box>
      </Box>
    </Layout>
  );
}
