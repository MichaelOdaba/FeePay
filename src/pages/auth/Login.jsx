import { useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") navigate("/admin");
    else if (profile?.role === "parent") navigate("/parent");
    else navigate("/student");

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-0">
      <div className="bg-white rounded-lg md:rounded-2xl shadow-md p-6 md:p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700">
            FeePay
          </h1>
          <p className="text-slate-500 mt-1 text-xs md:text-sm">
            FAUM Fee Payment Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@faum.edu.ng"
              className="w-full border border-slate-200 rounded-lg px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-200 rounded-lg px-3 md:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && <p className="text-red-500 text-xs md:text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50 text-sm md:text-base"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs md:text-sm text-slate-500 mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
