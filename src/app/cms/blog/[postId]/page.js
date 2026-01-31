"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function EditPost() {
  const { postId } = useParams();
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [loading, setLoading] = useState(true);
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

  const fetchPost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/admin/cms/blog/${postId}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load post');
      const p = json.data;
      setTitle(p.title || '');
      setSlug(p.slug || '');
      setExcerpt(p.excerpt || '');
      setContent(p.content || '');
      setCategory(p.category || 'news');
      setTags((p.tags || []).join(', '));
      setSeoTitle(p.seoTitle || '');
      setSeoDescription(p.seoDescription || '');
      setSeoKeywords((p.seoKeywords || []).join(', '));
      setIsPublished(!!p.isPublished);
    } catch (err) {
      console.error('Error loading post:', err);
      alert('Error loading post: ' + (err.message || 'unknown'));
      router.push('/cms/blog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (postId) fetchPost(); }, [postId]);

  const handleSave = async () => {
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
      const res = await fetch(`${API_BASE}/api/admin/cms/blog/${postId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Save failed');
      alert('Saved');
      router.push('/cms/blog');
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
        <Typography variant="h5" sx={{ mb: 2 }}>Edit Post</Typography>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth sx={{ mb: 2 }} />
        <TextField label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} fullWidth sx={{ mb: 2 }} />
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
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          <Button variant="outlined" onClick={() => router.push('/cms/blog')}>Back</Button>
        </Box>
      </Box>
    </Layout>
  );
}
