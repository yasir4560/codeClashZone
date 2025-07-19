import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomModal from '../components/JoinRoomModal';
import { v4 as uuidv4 } from 'uuid';
import { motion } from 'framer-motion';
import Loader from '../components/ui/Loader';
import { BackgroundBeams } from '@/components/ui/background-beams';

interface Problem {
  _id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  solveTimeLimit?: string;
  participants?: number;
}

interface User{
    userId: string;
    name: string;
}

interface PlayWithFriendsProps {
  user: User;
}

export default function PlayWithFriends({ user }: PlayWithFriendsProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [filteredProblems, setFilteredProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://codeclashzone-2.onrender.com/api/dsa', {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        setProblems(data);
        setFilteredProblems(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let filtered = problems;
    if (searchTerm)
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (difficultyFilter !== 'All')
      filtered = filtered.filter((p) => p.difficulty === difficultyFilter);
    setFilteredProblems(filtered);
  }, [searchTerm, difficultyFilter, problems]);

  const handleJoin = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowJoinModal(true);
  };

  const handleCreate = (problem: { _id: any }) => {
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}?problem=${problem._id}&username=${encodeURIComponent(user.name)}&userId=${user.userId}`);
  };

  const getDifficultyStyle = (level: string) => {
    switch (level) {
      case 'Easy':
        return 'text-green-400 font-semibold';
      case 'Medium':
        return 'text-yellow-400 font-semibold';
      case 'Hard':
        return 'text-red-500 font-semibold';
      default:
        return 'text-gray-300';
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
          🤝 Play with Friends 🤝
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded-lg"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <input
            type="text"
            placeholder="Search by title..."
            className="bg-gray-800 text-white px-4 py-2 rounded-lg w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredProblems.length === 0 ? (
          <div className="text-center mt-10">
            <img
              src="/noData.png"
              alt="No match"
              className="w-60 mx-auto mb-4"
            />
            <p className="text-gray-400">No problems match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-gray-900/70 rounded-xl shadow-lg hover:cursor-pointer transition">
            <table className="min-w-full table-auto text-left">
              <thead className="bg-gray-800 text-purple-300">
                <tr>
                  <th className="px-6 py-4">Contest</th>
                  <th className="px-6 py-4">Difficulty</th>
                  <th className="px-6 py-4">Solve Time Limit</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProblems.map((problem) => (
                  <tr
                    key={problem._id}
                    className="border-t border-gray-800 hover:bg-gray-800/40 transition"
                  >
                    <td className="px-6 py-4 font-semibold text-purple-200">
                      {problem.title}
                    </td>
                    <td className={`px-6 py-4 ${getDifficultyStyle(problem.difficulty)}`}>
                      {problem.difficulty}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {problem.solveTimeLimit ?? "—"} mins
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        className="bg-[#3F0071] hover:bg-[#A459D1] text-white px-3 py-1 rounded"
                        onClick={() => handleJoin(problem)}
                      >
                        Join
                      </button>
                      <button
                        className="bg-[#FB2576] hover:bg-[#F266AB] text-white px-3 py-1 rounded"
                        onClick={() => handleCreate(problem)}
                      >
                        Create
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showJoinModal && selectedProblem && (
          <JoinRoomModal
            problem={selectedProblem}
            user={user}
            onClose={() => setShowJoinModal(false)}
          />
        )}
      </motion.div>
    </div>
  );
}
