import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Loader from "@/components/ui/Loader";

interface LoginProps {
  onLogin: (userData: { userId: string; name: string; email: string }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("https://codeclashzone-2.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const loginData = await res.json();
      await delay(2000); 

      if (!res.ok) {
        setError(loginData.message || "Login failed");
      } else {
        //  refresh logic
        const meRes = await fetch("https://codeclashzone-2.onrender.com/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!meRes.ok) {
          setError("Could not fetch user data after login.");
          return;
        }

        const userData = await meRes.json();
        onLogin({ userId: userData.userId, name: userData.name, email: userData.email });
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <BackgroundBeams />

      {/* Fullscreen Loader */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <Loader />
        </div>
      )}

      {/* Login Form */}
      {!loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-300">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
              Login
            </h2>

            {error && (
              <motion.p
                className="text-red-600 text-sm bg-red-100 border border-red-200 rounded p-2 mb-4 text-center"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {error}
              </motion.p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition hover:cursor-pointer"
              >
                Login
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-700">
              Don't have an account?{" "}
              <Link to="/signup" className="text-purple-700 hover:underline font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}