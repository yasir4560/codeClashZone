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
import Room from "./pages/Room";
import { Toaster } from "react-hot-toast";
import CommunityPage from "./pages/CommunityPage";
import Leaderboard from "./pages/Leaderboard";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<{userId:string, name: string, email:string}|null>(null);

  
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("https://codeclashzone-2.onrender.com/api/auth/me", {
          method: "GET",
          credentials: "include", // send cookies
        });
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setUser({ userId: data.userId, name: data.name, email: data.email });
        } else {
          setIsLoggedIn(false);
          setUser(null);
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
  const handleLogin = (userData:{userId:string; name:string; email:string}) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("https://codeclashzone-2.onrender.com/api/auth/logout", {
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
     <Toaster position="top-right" reverseOrder={false} />
     
     {!checkingAuth && isLoggedIn && user && (<Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user ?? undefined} />)}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}/>

        {/* frontend challenges */}

        <Route path="/frontend-challenges" element={<FrontendChallenges />} />
        <Route path="/frontend/:id" element={<FrontendProblemPage />} />

        {/* DSA challenges */}
        
        <Route path="/dsa-challenges" element={isLoggedIn ? <DsaChallenges /> : <Navigate to="/login" replace />}/>
        <Route path="/dsa/:problemId" element={<DsaProblemPage />} />

        <Route path="/submissions" element={isLoggedIn ? <SubmissionsPage /> : <Navigate to="/login" replace />}/>

        {/* multi player routes */}
        <Route
          path="/play"
          element={
            isLoggedIn && user
              ? <PlayWithFriends user={user} />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="/room/:roomId" element={isLoggedIn ? <Room /> : <Navigate to="/login" replace />} />


        {/* community */}
        <Route path="/community" element={isLoggedIn ? <CommunityPage/> : <Navigate to="/login" replace />} />

        {/* leaderbord */}
        <Route path="/leaderboard" element={isLoggedIn ? <Leaderboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
