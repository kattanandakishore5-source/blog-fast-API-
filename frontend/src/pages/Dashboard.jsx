import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatCard({ label, value }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl px-6 py-4 text-center">
      <p className="text-2xl font-semibold text-slate-50">{value}</p>
      <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchMe();
  }, []);

  const fetchMe = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setUser(await res.json());
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4 animate-pulse">
        <div className="h-7 bg-slate-800 rounded w-48" />
        <div className="h-4 bg-slate-800 rounded w-32 mt-2" />
        <div className="h-24 bg-slate-800 rounded-xl mt-6" />
        <div className="h-64 bg-slate-800 rounded-xl mt-4" />
      </div>
    );
  }

  const blogs = user?.blogs || [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Profile header */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">{user?.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{user?.email}</p>
            {user?.bio && (
              <p className="text-sm text-slate-300 mt-3 max-w-lg leading-relaxed">
                {user.bio}
              </p>
            )}
            {!user?.bio && (
              <p className="text-sm text-slate-500 mt-3 italic">No bio yet.</p>
            )}
          </div>
          <button
            onClick={() => navigate(`/profile/${user?.id}`)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors shrink-0 ml-4"
          >
            View public profile →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <StatCard label="Posts" value={blogs.length} />
          <StatCard label="Followers" value={user?.followers_count ?? 0} />
          <StatCard label="Following" value={user?.following_count ?? 0} />
        </div>
      </div>

      {/* Blog list header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-slate-50">Your Posts</h2>
        <button
          onClick={() => navigate("/create")}
          className="px-5 py-2 text-sm rounded-lg bg-cyan-500 text-slate-900 font-semibold hover:bg-cyan-400 transition-all"
        >
          + New Post
        </button>
      </div>

      {/* Blog list */}
      {blogs.length === 0 ? (
        <div className="text-center py-24 text-slate-500 text-sm">
          No posts yet.{" "}
          <button
            onClick={() => navigate("/create")}
            className="text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            Create your first post →
          </button>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800 text-left text-xs text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">Created</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {blogs.map((blog) => (
                <tr
                  key={blog.id}
                  className="bg-slate-900 hover:bg-slate-800/60 transition-colors"
                >
                  <td className="px-5 py-4 text-slate-50 font-medium max-w-xs truncate">
                    {blog.title}
                  </td>
                  <td className="px-5 py-4">
                    {blog.is_published ? (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-400 hidden sm:table-cell">
                    {formatDate(blog.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/blog/${blog.id}`)}
                        className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/edit/${blog.id}`)}
                        className="px-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}