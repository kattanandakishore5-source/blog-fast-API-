import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BlogDetail from "./pages/BlogDetail";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-900 text-slate-50 font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1e293b",
              color: "#f8fafc",
              border: "1px solid #334155",
              borderRadius: "8px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22d3ee", secondary: "#0f172a" } },
            error: { iconTheme: { primary: "#f87171", secondary: "#0f172a" } },
          }}
        />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<Editor />} />
          <Route path="/edit/:id" element={<Editor />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}