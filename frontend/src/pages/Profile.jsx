import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function excerpt(text, max = 100) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trimEnd() + "..." : text;
}

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCurrentUser();
    fetchProfile();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${API}/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.id);
      }
    } catch {
      // non-critical
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("User not found");
        navigate("/");
        return;
      }
      setProfile(await res.json());
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const res = await fetch(`${API}/user/${id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        toast.error("Action failed");
        return;
      }
      const data = await res.json();
      const didFollow = data.detail === "Followed successfully";

      // Optimistic UI update
      setProfile((prev) => ({
        ...prev,
        is_following: didFollow,
        followers_count: didFollow
          ? prev.followers_count + 1
          : prev.followers_count - 1,
      }));

      toast.success(data.detail);
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-4 animate-pulse">
        <div className="h-7 bg-slate-800 rounded w-48" />
        <div className="h-4 bg-slate-800 rounded w-32 mt-2" />
        <div className="h-24 bg-slate-800 rounded-xl mt-6" />
        <div className="h-64 bg-slate-800 rounded-xl mt-4" />
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUserId === profile.id;
  const publishedBlogs = profile.blogs?.filter((b) => b.is_published) || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Profile card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-50">{profile.name}</h1>
            {profile.bio ? (
              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-lg">
                {profile.bio}
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-2 italic">No bio.</p>
            )}
          </div>

          {/* Follow button — only shown if not own profile */}
          {!isOwnProfile && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`shrink-0 px-5 py-2 text-sm rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                profile.is_following
                  ? "bg-slate-700 border border-slate-600 text-slate-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
                  : "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
              }`}
            >
              {followLoading
                ? "..."
                : profile.is_following
                ? "Unfollow"
                : "Follow"}
            </button>
          )}

          {/* Own profile — link to dashboard */}
          {isOwnProfile && (
            <button
              onClick={() => navigate("/dashboard")}
              className="shrink-0 px-4 py-2 text-sm rounded-lg bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600 transition-all"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Posts", value: publishedBlogs.length },
            { label: "Followers", value: profile.followers_count },
            { label: "Following", value: profile.following_count },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-center"
            >
              <p className="text-xl font-semibold text-slate-50">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Published posts */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-50">
          Posts by {profile.name}
        </h2>
      </div>

      {publishedBlogs.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No published posts yet.
        </div>
      ) : (
        <div className="space-y-4">
          {publishedBlogs.map((blog) => (
            <div
              key={blog.id}
              onClick={() => navigate(`/blog/${blog.id}`)}
              className="group cursor-pointer bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all"
            >
              <h3 className="text-sm font-semibold text-slate-50 group-hover:text-cyan-400 transition-colors leading-snug">
                {blog.title}
              </h3>
              <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                {excerpt(blog.body)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {blog.tags?.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-slate-500 shrink-0 ml-3">
                  {formatDate(blog.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate(-1)}
        className="mt-10 text-sm text-slate-500 hover:text-slate-300 transition-colors"
      >
        ← Back
      </button>
    </div>
  );
}