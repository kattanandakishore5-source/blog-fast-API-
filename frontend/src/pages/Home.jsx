import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";
const LIMIT = 6;

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function excerpt(text, max = 120) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

export default function Home() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchBlogs(skip);
  }, [skip]);

  const fetchBlogs = async (currentSkip) => {
    setLoading(true);
    try {
      // fetch one extra to detect if next page exists
      const res = await fetch(
        `${API}/blog/?skip=${currentSkip}&limit=${LIMIT + 1}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        toast.error("Failed to load feed");
        return;
      }
      const data = await res.json();
      setHasNext(data.length > LIMIT);
      setBlogs(data.slice(0, LIMIT));
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => setSkip((s) => Math.max(0, s - LIMIT));
  const handleNext = () => setSkip((s) => s + LIMIT);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-50">Feed</h1>
        <p className="mt-1 text-sm text-slate-400">Latest published posts</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl bg-slate-800 border border-slate-700 animate-pulse"
            />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-24 text-slate-500 text-sm">
          No published posts yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="group cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all"
            >
              <h2 className="text-base font-semibold text-slate-50 group-hover:text-cyan-400 transition-colors leading-snug line-clamp-2">
                {blog.title}
              </h2>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed line-clamp-3">
                {excerpt(blog.body)}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/profile/${blog.creator?.id}`);
                  }}
                  className="hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  {blog.creator?.name || "Unknown"}
                </span>
                <span>{formatDate(blog.created_at)}</span>
              </div>
              {blog.tags?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && (skip > 0 || hasNext) && (
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={skip === 0}
            className="px-5 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {Math.floor(skip / LIMIT) + 1}
          </span>
          <button
            onClick={handleNext}
            disabled={!hasNext}
            className="px-5 py-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
