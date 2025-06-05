import { useEffect, useState } from "react";
import axios from "axios";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import MultiplayerRoom from "./MultiplayerRoom";

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
}

interface Room {
  _id: string;
  roomCode: string;
  participants: { userId: string; username: string }[];
  maxParticipants: number;
  status: "waiting" | "live" | "ended";
  problemId: DsaProblem;
}

export default function PlayWithFriends() {
  const [problems, setProblems] = useState<DsaProblem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filtered, setFiltered] = useState<(DsaProblem | Room)[]>([]);
  const [search, setSearch] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [problemsRes, roomsRes] = await Promise.all([
        axios.get<DsaProblem[]>("http://localhost:8000/api/dsa", { withCredentials: true }),
        axios.get<Room[]>("http://localhost:8000/api/rooms", { withCredentials: true }),
      ]);

      setProblems(problemsRes.data);
      setRooms(roomsRes.data);
      setFiltered([...problemsRes.data, ...roomsRes.data]);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const lower = search.trim().toLowerCase();

    const filteredData = [...problems, ...rooms].filter((item) => {
      const title = "title" in item ? item.title : item.problemId?.title || "";
      const diff = "difficulty" in item ? item.difficulty : item.problemId?.difficulty || "";

      const matchesSearch = title.toLowerCase().includes(lower);
      const matchesDifficulty = difficulty === "All" || diff === difficulty;

      return matchesSearch && matchesDifficulty;
    });

    setFiltered(filteredData);
  }, [search, difficulty, problems, rooms]);

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
          🎮 Play with Friends
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
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

          <input
            type="text"
            placeholder="Search contests..."
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center mt-10">
            <img src="/noData.png" alt="No rooms" className="w-60 mx-auto mb-4" />
            <p className="text-gray-400">No contests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900/70 rounded-xl shadow-lg">
            <table className="min-w-full table-auto text-left hover:cursor-pointer">
              <thead className="bg-gray-800 text-purple-300">
                <tr>
                  <th className="px-6 py-4">Contest Name</th>
                  <th className="px-6 py-4">Participants</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const isRoom = "roomCode" in item;
                  const title = isRoom ? item.problemId?.title : item.title;
                  const difficulty = isRoom ? item.problemId?.difficulty : item.difficulty;
                  const participants = isRoom ? item.participants.length : 0;
                  const max = isRoom ? item.maxParticipants : 4;
                  const status = isRoom ? item.status : "waiting";
                  const id = item._id;
                  const link = `/multiplayer/${id}`;

                  return (
                    <tr
                      key={id}
                      className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                    >
                      <td className="px-6 py-4 font-semibold text-purple-200">
                        {title}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {participants}/{max}
                      </td>
                      <td className={`px-6 py-4 ${getDifficultyStyle(difficulty || "Easy")}`}>
                        {difficulty}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "live"
                              ? "bg-green-700 text-green-300"
                              : "bg-yellow-800 text-yellow-300"
                          }`}
                        >
                          {status === "live" ? "Live" : "Waiting"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-lg"
                            onClick={() => navigate(`/rooms/${id}`, { state: { roomId: id } })}
                            disabled={status !== "waiting"}
                          >
                            Join
                          </button>
                          <button
                            className="bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-1 rounded-lg"
                            onClick={() =>
                              navigator.clipboard.writeText(`${window.location.origin}${link}`)
                            }
                          >
                            Share
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
