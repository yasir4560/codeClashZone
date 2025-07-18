import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Loader from "@/components/ui/Loader";

export default function Signup() {
  const [name, setName] = useState("");
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
      const res = await fetch("https://codeclashzone-2.onrender.com/api/auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      await delay(2000);

      if (!res.ok) {
        setError(data.message || "Signup failed");
      } else {
        navigate("/login");
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

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <Loader />
        </div>
      )}

      {!loading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-full max-w-md bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-purple-300">
            <h2 className="text-3xl font-bold text-center text-purple-800 mb-6">
              Sign Up
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
                <label htmlFor="name" className="block text-sm text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Your name"
                />
              </div>

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
                Sign Up
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-700">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-700 hover:underline font-semibold">
                Login
              </Link>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
