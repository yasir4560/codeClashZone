import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import Loader from "./components/ui/Loader";
import FrontendChallenges from "./pages/FrontendChallenges";
import FrontendProblemPage from "./pages/FrontendProblemPage";
import SubmissionsPage from "./pages/Submissions";
import DsaChallenges from "./pages/DsaChallenges";
import DsaProblemPage from "./pages/DsaProblemPage";
import PlayWithFriends from "./pages/PlayWithFriends";
import MultiplayerRoom from "./pages/MultiplayerRoom";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("http://localhost:8000/api/auth/me", {
          method: "GET",
          credentials: "include", // send cookies
        });
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Called after successful login (e.g. in Login page)
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/auth/logout", {
        method: "POST",
        credentials: "include", 
      });
      if (res.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (checkingAuth) {
    return <Loader />;
  }

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route path="/frontend-challenges" element={<FrontendChallenges />} />
        <Route
          path="/dsa-challenges"
          element={isLoggedIn ? <DsaChallenges /> : <Navigate to="/login" replace />}
        />
        <Route path="/frontend/:id" element={<FrontendProblemPage />} />
         <Route path="/dsa/:problemId" element={<DsaProblemPage />} />
        <Route path="/submissions" element={isLoggedIn ? <SubmissionsPage /> : <Navigate to="/login" replace />}/>
        <Route path="/rooms" element={isLoggedIn ? <PlayWithFriends /> : <Navigate to="/login" replace />}/>
        <Route path ="/rooms/:roomId" element={isLoggedIn ? <MultiplayerRoom /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
