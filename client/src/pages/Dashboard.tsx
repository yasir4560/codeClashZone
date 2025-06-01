import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BackgroundBeams } from "@/components/ui/background-beams";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <BackgroundBeams />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-10 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold mb-4 text-purple-400">Welcome to the Arena!</h1>
        <p className="text-lg max-w-2xl mb-8 text-gray-300">
          You're now inside the CodeClashZone. Choose your battleground to start your coding journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <button
            onClick={() => navigate("/frontend-challenges")}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold transition cursor-pointer
"
          >
            💡 Frontend Challenges
          </button>
          <button
            onClick={() => navigate("/code-challenges")}
            className="bg-gray-800 hover:bg-gray-700 px-6 py-3 rounded-xl font-semibold transition cursor-pointer
"
          >
            ⚔️ Code Challenges
          </button>
        </div>
      </motion.div>
    </div>
  );
}
