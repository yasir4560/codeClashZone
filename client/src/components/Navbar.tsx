import { Link, useNavigate } from "react-router-dom";

interface NavbarProps {
  isLoggedIn: boolean;
  onLogout?: () => void;
}

export default function Navbar({ isLoggedIn, onLogout }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (onLogout) {
        onLogout();
      }
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.log("Logout failed:", error);
    }
  }; 

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg fixed top-0 left-0 z-50">
      <Link to="/" className="text-3xl font-extrabold text-white hover:text-purple-300 transition">
        CodeClashZone
      </Link>
      <div className="flex space-x-6 text-white text-lg font-medium">
        {isLoggedIn ? (
          <>
            <Link to="#" className="hover:text-purple-300 transition duration-300">Play with friends</Link>
            <Link to="/leaderboard" className="hover:text-purple-300 transition duration-300">Leaderboard</Link>
            <Link to="/submissions" className="hover:text-purple-300 transition duration-300">Submissions</Link>
            <Link to="/community" className="hover:text-purple-300 transition duration-300">Community</Link>
            <button
              onClick={handleLogout}
              className="border border-white px-4 py-1 rounded-md hover:bg-white hover:text-indigo-900 transition duration-300"
            >
              Logout
            </button>
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

