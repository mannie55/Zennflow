import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../apiService/auth";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setError("");
    setUsername("");
    setEmail("");
    setPassword("");
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Validate fields
        if (!username.trim() || !password) {
          throw new Error("All fields are required.");
        }

        const data = await authApi.login({
          username: username.trim(),
          password,
        });

        // Store auth details in chrome.storage.local
        await chrome.storage.local.set({
          token: data.token,
          username: data.username,
          name: data.name || "",
        });

        navigate("/");
      } else {
        // Register flow
        if (!username.trim() || !email.trim() || !password) {
          throw new Error("Username, email, and password are required.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        if (username.trim().length < 3) {
          throw new Error("Username must be at least 3 characters long.");
        }

        const registrationResult = await authApi.register({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim() || undefined,
        });

        // Auto-login after registration
        const loginData = await authApi.login({
          username: username.trim(),
          password,
        });

        await chrome.storage.local.set({
          token: loginData.token,
          username: loginData.username,
          name: loginData.name || "",
        });

        navigate("/");
      }
    } catch (err) {
      console.error("Auth error:", err);
      const message =
        err.response?.data?.error ||
        err.message ||
        "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-transparent text-gray-100 font-sans p-4">
      <div className="w-full max-w-md bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-xl backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-500 bg-clip-text text-transparent">
            Zennflow
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            Your sanctuary for focus, organization, and inspiration.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-800 mb-6">
          <button
            onClick={() => !isLogin && handleToggle()}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              isLogin
                ? "border-teal-500 text-teal-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => isLogin && handleToggle()}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 transition-all ${
              !isLogin
                ? "border-teal-500 text-teal-400 font-bold"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              placeholder="zenn_dev"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Nnamdi Christopher"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#121212] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-teal-500/20 transform hover:-translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
