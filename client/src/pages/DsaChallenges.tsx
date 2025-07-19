import { useEffect, useState } from "react";
import axios from "axios";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";

interface Example {
  input?: string;
  output?: string;
  explanation?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

interface DsaProblem {
  _id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  constraints?: string;
  examples?: Example[];
  testCases?: TestCase[];
  tags: string[];
  solveTimeLimit?: number; 
  timeLimit?: number; 
  spaceLimit?: number; 
  acceptanceRate?: number | null;
  createdAt?: string;
}

export default function DsaChallenges() {
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [filtered, setFiltered] = useState<DsaProblem[]>([]);
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [allTags, setAllTags] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const res = await axios.get<DsaProblem[]>(
        "https://codeclashzone-2.onrender.com/api/dsa",
        { withCredentials: true }
      );
      setProblems(res.data);
      setFiltered(res.data);

      const tagsSet = new Set<string>();
      res.data.forEach((p) => p.tags.forEach((t) => tagsSet.add(t)));
      setAllTags(Array.from(tagsSet).sort());
    } catch (err) {
      console.error("Failed to fetch DSA problems", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = [...problems];

    // Filter by difficulty
    if (difficulty !== "All") {
      list = list.filter((item) => item.difficulty === difficulty);
    }

    // Filter by tag
    if (tagFilter !== "All") {
      list = list.filter((item) => item.tags.includes(tagFilter));
    }

    // Search filter by title or tags
    if (search.trim() !== "") {
      const lower = search.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.tags.some((tag) => tag.toLowerCase().includes(lower))
      );
    }

    setFiltered(list);
  }, [search, difficulty, tagFilter, problems]);

  const getDifficultyStyle = (level: string) => {
    switch (level) {
      case "Easy":
        return "text-green-400 font-semibold";
      case "Medium":
        return "text-yellow-400 font-semibold";
      case "Hard":
        return "text-red-500 font-semibold";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden px-4 pt-20 pb-10">
      <BackgroundBeams />

      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <Loader />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-purple-400 mb-6 text-center mt-10">
          🧩 DSA Challenges
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          {/* Difficulty Filter */}
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Tag Filter */}
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="All">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search by title or tag..."
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center mt-10">
            <img
              src="/noData.png"
              alt="No match"
              className="w-60 mx-auto mb-4"
            />
            <p className="text-gray-400">No challenges match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900/70 rounded-xl shadow-lg hover:cursor-pointer transition">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-gray-800 text-purple-300">
                <tr>
                  <th className="px-6 py-4">Problem</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Expected Time</th>
                  <th className="px-6 py-4">Acceptance Rate</th>
                  <th className="px-6 py-4">Tags</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((problem) => (
                  <tr
                    key={problem._id}
                    className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                    onClick={() => navigate(`/dsa/${problem._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-purple-200">
                        {problem.title}
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${getDifficultyStyle(problem.difficulty)}`}>
                      {problem.difficulty}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {problem.solveTimeLimit ?? "—"} mins
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {problem.acceptanceRate != null ? `${problem.acceptanceRate}%` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full border border-purple-500"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
