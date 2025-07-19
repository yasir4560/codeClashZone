import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaMedal } from "react-icons/fa";
import InitialsAvatar from "../components/InitialsAvatar";
import { BackgroundBeams } from "@/components/ui/background-beams";
import Loader from "@/components/ui/Loader";

const medalColors = ["text-yellow-400", "text-gray-400", "text-orange-500"];

interface LeaderboardEntry {
  name: string;
  score: number;
}

function Leaderboard() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const currentUser = localStorage.getItem("username");

  useEffect(() => {
    setLoading(true);
    setError("");

    
    const timer = setTimeout(() => {
      axios
        .get(`https://codeclashzone-2.onrender.com/api/leaderboard/ranks?filter=${filter}`, {
          withCredentials: true,
        })
        .then((res) => {
          setData(res.data.leaderboard);
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch leaderboard.");
          setLoading(false);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [filter]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <BackgroundBeams className="pointer-events-none" />

      <div className="max-w-4xl mx-auto p-8 mt-24 bg-gray-900 rounded-2xl shadow-2xl border border-purple-700 z-10 relative">
        <h2 className="text-4xl font-extrabold text-center text-purple-400 mb-8 tracking-wide">
          Leaderboard
        </h2>

        <div className="flex justify-end mb-8">
          <select
            className="border border-purple-600 bg-gray-800 text-purple-300 px-5 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter leaderboard by time period"
          >
            <option value="all">All Time</option>
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="yearly">This Year</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center mt-8 text-red-600 font-semibold">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center mt-12 text-purple-400 text-lg font-medium">
            No users found.
          </div>
        ) : (
          <table className="w-full table-auto border-collapse text-purple-200 rounded-lg overflow-hidden shadow-inner">
            <thead>
              <tr className="bg-purple-900 text-left uppercase text-sm tracking-wider select-none">
                <th className="p-4">#</th>
                <th className="p-4">Name</th>
                <th className="p-4 text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className={`cursor-pointer hover:bg-purple-700 transition duration-300 ${
                    entry.name === currentUser ? "bg-purple-600 font-semibold" : ""
                  }`}
                >
                  <td className="p-4 text-lg">
                    {idx < 3 ? (
                      <FaMedal
                        className={`${medalColors[idx]} text-3xl drop-shadow-lg`}
                        aria-label={`Medal rank ${idx + 1}`}
                      />
                    ) : (
                      <span className="font-mono">{idx + 1}</span>
                    )}
                  </td>
                  <td className="p-4 flex items-center gap-5">
                    <InitialsAvatar name={entry.name} size={36} />
                    <span className="text-purple-100 font-medium text-lg">{entry.name}</span>
                  </td>
                  <td className="p-4 text-center font-semibold text-lg">{entry.score}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
