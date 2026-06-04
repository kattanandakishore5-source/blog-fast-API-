import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBlog();
    fetchMe();
  }, [id]);

  const fetchBlog = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/blog/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Blog not found");
        navigate("/");
        return;
      }
      setBlog(await res.json());
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCurrentUser(await res.json());
    } catch {
      // non-critical
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this post permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Delete failed");
        return;
      }
      toast.success("Post deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await fetch(`${API}/blog/${id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body: comment.trim() }),
      });
      if (!res.ok) {
        toast.error("Failed to post comment");
        return;
      }
      const newComment = await res.json();

      // Optimistic UI: append to existing comments instantly
      setBlog((prev) => ({
        ...prev,
        comments: [
          ...( prev.comments || []),
          {
            ...newComment,
            author_name: currentUser?.name || "You",
          },
        ],
      }));

      setComment("");
      toast.success("Comment posted");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-800 rounded-lg w-2/3" />
        <div className="h-4 bg-slate-800 rounded w-1/4" />
        <div className="h-64 bg-slate-800 rounded-xl mt-6" />
      </div>
    );
  }

  if (!blog) return null;

  const isOwner = currentUser && currentUser.id === blog.creator?.id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-slate-50 leading-snug">
          {blog.title}
        </h1>
        <div className="mt-3 flex items-center gap-3 text-sm text-slate-400">
          <span
            onClick={() => navigate(`/profile/${blog.creator?.id}`)}
            className="hover:text-cyan-400 cursor-pointer transition-colors"
          >
            {blog.creator?.name}
          </span>
          <span className="text-slate-600">·</span>
          <span>{formatDate(blog.created_at)}</span>
          {blog.updated_at && (
            <>
              <span className="text-slate-600">·</span>
              <span className="text-slate-500 text-xs">
                Updated {formatDate(blog.updated_at)}
              </span>
            </>
          )}
        </div>

        {/* Tags + Share */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {blog.tags?.map((tag) => (
            <span
              key={tag.id}
              className="px-2.5 py-1 text-xs rounded-full bg-slate-800 border border-slate-700 text-cyan-400"
            >
              {tag.name}
            </span>
          ))}
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        </div>
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => navigate(`/edit/${blog.id}`)}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 disabled:opacity-40 transition-all"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}

      {/* Body */}
      <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">
        {blog.body}
      </div>

      {/* Comments section */}
      <div className="mt-12 border-t border-slate-800 pt-8">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">
          {(blog.comments?.length || 0)} Comment
          {blog.comments?.length !== 1 ? "s" : ""}
        </h2>

        {/* Comment form */}
        <div className="mb-8">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-50 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleCommentSubmit}
              disabled={!comment.trim() || submittingComment}
              className="px-5 py-2 text-sm rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submittingComment ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>

        {/* Comments list */}
        {blog.comments?.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No comments yet. Be the first.
          </p>
        ) : (
          <div className="space-y-4">
            {blog.comments.map((c, index) => (
              <div
                key={c.id ?? index}
                className="bg-slate-800 border border-slate-700 rounded-lg px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-300">
                    {c.author_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "Just now"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}