import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API = "http://127.0.0.1:8000";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({ name: false, email: false, password: false });
  const [loading, setLoading] = useState(false);

  const errors = {
    name:
      touched.name && !form.name.trim()
        ? "Name is required"
        : "",
    email:
      touched.email && !validateEmail(form.email)
        ? "Enter a valid email address"
        : "",
    password:
      touched.password && form.password.length < 6
        ? "Password must be at least 6 characters"
        : "",
  };

  const isDisabled =
    !form.name.trim() ||
    !form.email.trim() ||
    !form.password.trim() ||
    !!errors.name ||
    !!errors.email ||
    !!errors.password ||
    loading;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, password: true });
    if (isDisabled) return;

    setLoading(true);
    try {
      const res = await fetch(`${API}/user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Signup failed");
        return;
      }

      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch {
      toast.error("Could not reach the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-slate-50">Create account</h1>
          <p className="mt-1 text-sm text-slate-400">Start writing today</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border text-slate-50 placeholder-slate-500 text-sm focus:outline-none transition-colors ${
                errors.name
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-cyan-500"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border text-slate-50 placeholder-slate-500 text-sm focus:outline-none transition-colors ${
                errors.email
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-cyan-500"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-400 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Min. 6 characters"
              onKeyDown={(e) => e.key === "Enter" && !isDisabled && handleSubmit()}
              className={`w-full px-4 py-2.5 rounded-lg bg-slate-900 border text-slate-50 placeholder-slate-500 text-sm focus:outline-none transition-colors ${
                errors.password
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-600 focus:border-cyan-500"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isDisabled}
            className="w-full py-2.5 rounded-lg bg-cyan-500 text-slate-900 font-semibold text-sm hover:bg-cyan-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}