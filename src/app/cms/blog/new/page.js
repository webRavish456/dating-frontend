"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../../../components/Layout";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

export default function NewPost() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState('news');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const handleCreate = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const body = {
        title,
        slug,
        excerpt,
        content,
        category,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        seoTitle,
        seoDescription,
        seoKeywords: seoKeywords.split(',').map(s => s.trim()).filter(Boolean),
        isPublished
      };
      const res = await fetch(`${API_BASE}/api/admin/cms/blog`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) {
        const errMsg = json?.message || json?.error || JSON.stringify(json) || 'Create failed';
        throw new Error(errMsg);
      }
      alert('Created');
      router.push('/cms/blog');
    } catch (err) {
      console.error('Create error:', err);
      alert('Error creating: ' + (err.message || 'unknown'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>New Blog Post</Typography>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Slug (optional)" value={slug} onChange={(e) => setSlug(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Content (HTML)" value={content} onChange={(e) => setContent(e.target.value)} fullWidth multiline minRows={8} sx={{ mb: 2 }} />

        <FormControl sx={{ minWidth: 200, mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
            <MenuItem value="news">News</MenuItem>
            <MenuItem value="tips">Tips</MenuItem>
            <MenuItem value="updates">Updates</MenuItem>
            <MenuItem value="guides">Guides</MenuItem>
          </Select>
        </FormControl>

        <TextField label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Typography variant="h6">SEO</Typography>
        <TextField label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="SEO Keywords (comma separated)" value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>{saving ? 'Creating...' : 'Create'}</Button>
          <Button variant="outlined" onClick={() => router.push('/cms/blog')}>Cancel</Button>
        </Box>
      </Box>
    </Layout>
  );
}
