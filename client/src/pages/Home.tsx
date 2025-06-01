// src/pages/Home.tsx
import { BackgroundBeams } from "@/components/ui/background-beams";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      <BackgroundBeams />
      <Navbar isLoggedIn={false}/>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4 z-10 relative pt-20">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
          Welcome to <span className="text-purple-500">CodeClashZone</span>
        </h1>
        <h2 className="text-lg md:text-2xl text-gray-400 mb-6 font-medium">
          Where coders rise, rivals clash, and skills shine.
        </h2>

        <TypewriterEffect
          words={[
            { text: "Compete", className: "text-purple-400" },
            { text: "Practice", className: "text-blue-400" },
            { text: "Level-Up.", className: "text-green-400" },
          ]}
        />

        <p className="max-w-2xl text-lg md:text-xl mt-8 mb-10 text-gray-300 tracking-wide ">
          Dive into the ultimate coding battlefield. Solve coding challenges or showcase your frontend finesse. Choose your difficulty easy, medium, or hard  and compete your way.
          Whether you're here to climb leaderboards or just vibe with the dev
          community this is where you belong.
        </p>

        <div className="space-x-4" id="auth">
          <button className="bg-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition cursor-pointer" onClick={() => navigate('/login')}>
            Login
          </button>
          <button className="bg-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition cursor-pointer" onClick={() => navigate('/signup')}>
            Signup
          </button>
        </div>
      </div>

      <div
        id="about"
        className="px-6 py-16 max-w-5xl mx-auto text-center text-gray-300 z-10 relative">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          What Makes CodeClashZone Different?
        </h2>
        <p className="text-lg leading-relaxed">
          CodeClashZone isn't just another platform it's a warzone for code warriors.
          Challenge friends or strangers in live duels, compete in time-bound contests,
          or test your UI creativity in visual frontend battles. Track your progress,
          earn respect, climb the ranks, and grow with a community that thrives on learning, competition, and collaboration.
        </p>
      </div>

      <div
id="features"
  className="px-6 py-6 max-w-6xl mx-auto text-center text-gray-300 z-10 relative"
>
  <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
    Features & Benefits
  </h2>
  <p className="text-lg max-w-3xl mx-auto mb-12 text-gray-400">
    CodeClashZone helps you grow through challenges, and real-world interview preparation.
  </p>

  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {/* Feature 1 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-purple-600">
      <div className="flex items-center mb-4 text-purple-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Real Interview Questions</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Practice with challenges inspired by actual frontend interviews from top tech companies.
      </p>
    </div>

    {/* Feature 2 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-blue-600">
      <div className="flex items-center mb-4 text-blue-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Interactive Editor</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Code in a fully-featured editor with live preview and error checking.
      </p>
    </div>

    {/* Feature 3 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-green-600">
      <div className="flex items-center mb-4 text-green-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
        </svg>

        <h3 className="text-xl font-semibold text-white">Compete with Friends</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Join battles with your friends to solve coding challenges and climb the leaderboard.
      </p>
    </div>

    {/* Feature 4 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-pink-600">
      <div className="flex items-center mb-4 text-pink-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Community Solutions</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Learn from peers by exploring different approaches to the same problem.
      </p>
    </div>

    {/* Feature 5 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-yellow-600">
      <div className="flex items-center mb-4 text-yellow-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
        </svg>

        <h3 className="text-xl font-semibold text-white">Progress Tracking</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Monitor your improvement with performance analytics.
      </p>
    </div>

    {/* Feature 6 */}
    <div className="bg-gray-900 p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform cursor-pointer border border-red-600">
      <div className="flex items-center mb-4 text-red-400 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h3 className="text-xl font-semibold text-white">Timed Challenges</h3>
      </div>
      <p className="text-gray-400 text-sm text-left">
        Practice under realistic interview conditions with timed coding sessions.
      </p>
    </div>
  </div>
</div>



      <Footer />
    </main>
  );
}
