import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";
const DRAFT_KEY = "blog_draft";

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    body: "",
    is_published: false,
    tags: "",
  });
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);

  // Ref to prevent auto-save from firing on the initial draft restore render
  const isFirstRender = useRef(true);

  const token = localStorage.getItem("token");

  // On mount: restore draft if creating new post
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (isEditMode) {
      fetchBlog();
      return;
    }

    // Create mode: check for saved draft
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({
          ...prev,
          title: parsed.title || "",
          body: parsed.body || "",
          tags: parsed.tags || "",
        }));
        setDraftRestored(true);
        toast("Draft restored", {
          icon: "📝",
          style: {
            background: "#1e293b",
            color: "#f8fafc",
            border: "1px solid #334155",
          },
        });
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [id]);

  // Auto-save to localStorage on form change (create mode only)
  useEffect(() => {
    if (isEditMode) return;

    // Skip the very first render to avoid overwriting a just-restored draft
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const payload = {
      title: form.title,
      body: form.body,
      tags: form.tags,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, [form.title, form.body, form.tags, isEditMode]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Post not found");
        navigate("/dashboard");
        return;
      }
      const data = await res.json();
      setForm({
        title: data.title || "",
        body: data.body || "",
        is_published: data.is_published || false,
        tags: data.tags?.map((t) => t.name).join(", ") || "",
      });
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const parseTags = (raw) =>
    raw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      body: form.body.trim(),
      is_published: form.is_published,
      tags: parseTags(form.tags),
    };

    try {
      const url = isEditMode ? `${API}/blog/${id}` : `${API}/blog/`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.detail || "Save failed");
        return;
      }

      const data = await res.json();

      // Clear draft only on successful create
      if (!isEditMode) {
        localStorage.removeItem(DRAFT_KEY);
      }

      toast.success(isEditMode ? "Post updated" : "Post created");
      navigate(`/blog/${data.id}`);
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm({ title: "", body: "", is_published: false, tags: "" });
    setDraftRestored(false);
    toast.success("Draft discarded");
  };

  const isDisabled = !form.title.trim() || !form.body.trim() || saving;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4 animate-pulse">
        <div className="h-7 bg-slate-800 rounded w-48" />
        <div className="h-10 bg-slate-800 rounded-lg mt-6" />
        <div className="h-64 bg-slate-800 rounded-lg mt-4" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            {isEditMode ? "Edit Post" : "New Post"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isEditMode
              ? "Update your post details below"
              : "Write something worth reading"}
          </p>
        </div>

        {/* Draft restored banner */}
        {draftRestored && !isEditMode && (
          <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 shrink-0">
            <span className="text-xs text-slate-400">Draft restored</span>
            <button
              onClick={handleDiscardDraft}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Discard
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Title
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Your post title"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Body */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Body
            </label>
            {/* Live auto-save indicator (create mode only) */}
            {!isEditMode && (form.title || form.body) && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Auto-saving
              </span>
            )}
          </div>
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            placeholder="Write your post content here..."
            rows={14}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
            Tags{" "}
            <span className="normal-case text-slate-500 font-normal">
              (comma separated)
            </span>
          </label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="python, fastapi, web"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Publish toggle */}
        <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-5 py-4">
          <div>
            <p className="text-sm font-medium text-slate-50">Publish</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {form.is_published
                ? "This post is visible in the public feed"
                : "This post is saved as a draft"}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({ ...prev, is_published: !prev.is_published }))
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              form.is_published ? "bg-cyan-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.is_published ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="px-6 py-2.5 text-sm rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : isEditMode ? "Update Post" : "Create Post"}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}