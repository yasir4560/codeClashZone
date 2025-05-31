// src/pages/Home.tsx
import { BackgroundBeams } from "@/components/ui/background-beams";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";

export default function Home() {
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

        <p className="max-w-2xl text-lg md:text-xl mt-8 mb-10 text-gray-300">
          Dive into the ultimate coding battlefield. Solve coding challenges or showcase your frontend finesse. Choose your difficulty easy, medium, or hard  and compete your way.
          Whether you're here to climb leaderboards or just vibe with the dev
          community this is where you belong.
        </p>

        <div className="space-x-4" id="auth">
          <button className="bg-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
            Login
          </button>
          <button className="bg-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
            Signup
          </button>
        </div>
      </div>

      <div
        id="about"
        className="px-6 py-16 max-w-5xl mx-auto text-center text-gray-300 z-10 relative"
      >
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

      <Footer />
    </main>
  );
}
