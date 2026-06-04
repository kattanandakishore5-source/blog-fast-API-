import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          BlogR
        </Link>

        <div className="flex items-center gap-2">
          {token ? (
            <>
              <Link
                to="/"
                className="px-4 py-1.5 text-sm text-slate-300 hover:text-slate-50 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-1.5 text-sm text-slate-300 hover:text-slate-50 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-sm rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-50 border border-slate-700 transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 text-sm text-slate-300 hover:text-slate-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 text-sm rounded-md bg-cyan-500 text-slate-900 font-medium hover:bg-cyan-400 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}