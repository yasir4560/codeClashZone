import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

export default function Navbar({ isLoggedIn, user, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (onLogout) onLogout();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.name?.[0]?.toUpperCase();
  // console.log("User:", user);
  // console.log(user?.email)

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg fixed top-0 left-0 z-50">
      <Link to="/dashboard" className="text-3xl font-extrabold text-white hover:text-purple-300 transition">
        CodeClashZone
      </Link>

      <div className="flex items-center space-x-6 text-white text-lg font-medium relative">
        {isLoggedIn ? (
          <>
            <Link to="/play" className="hover:text-purple-300 transition duration-300">Play with friends</Link>
            <Link to="/leaderboard" className="hover:text-purple-300 transition duration-300">Leaderboard</Link>
            <Link to="/submissions" className="hover:text-purple-300 transition duration-300">Submissions</Link>
            <Link to="/community" className="hover:text-purple-300 transition duration-300">Community</Link>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-white text-indigo-800 font-bold flex items-center justify-center hover:opacity-90 cursor-pointer"
              >
                {initial ||""}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#974EC3] text-white rounded-md shadow-lg z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">Welcome, <span className="text-[#E0DEDE]">{user?.name}</span></p>
                    <p className="text-sm text-[#EEF2F5]">{user?.email}</p>
                  </div>
                  <div className="flex justify-center px-4 py-2">
                    <button onClick={handleLogout} className="px-6 py-2 bg-[#FF008E] hover:bg-[#D22779] rounded-md text-white hover:cursor-pointer">Logout</button>
                    </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="border border-white px-4 py-1 rounded-md hover:bg-white hover:text-indigo-900 transition duration-300"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
