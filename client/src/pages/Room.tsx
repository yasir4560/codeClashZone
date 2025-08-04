import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import socket from "../services/socket";
import axios from "axios";
import toast from "react-hot-toast";
import HintsAccordion from "@/components/HintsAccordion";

// Types

type Language = "python" | "cpp" | "java";

interface Example {
  input: string;
  output: string;
  explanation?: string;
}

interface Problem {
  title: string;
  description: string;
  difficulty: string;
  hints?: string[];
  examples: Example[];
  starterCode: Record<Language, string>;
  solveTimeLimit: number;
}

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
}

interface RoomUser {
  userId: string;
  username: string;
}

const languageOptions = [
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const query = new URLSearchParams(location.search);
  const userId = query.get("userId")!;
  const username = query.get("username")!;
  const problemId = query.get("problem")!;

  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<Language>("java");
  const [code, setCode] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [usersInRoom, setUsersInRoom] = useState<RoomUser[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    axios
      .get(`https://codeclashzone-2.onrender.com/api/dsa/${problemId}`, { withCredentials: true })
      .then((res) => {
        const p: Problem = res.data;
        setProblem(p);
        setTimer(p.solveTimeLimit * 60);
        setCode(p.starterCode[language] || "");
      })
      .catch(() => toast.error("Failed to fetch problem"));
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    setCode(problem.starterCode[language] || "");
  }, [language, problem]);

  useEffect(() => {
    if (!roomId || !userId || !username || !problemId) {
      console.warn("Missing room or user info. Aborting join-room.");
      return;
    }

    socket.emit("join-room", { roomId, userId, username, problemId });

    socket.on("room-users", (users: RoomUser[]) => setUsersInRoom(users));
    socket.on("chat-message", (msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    socket.on("code-change", (newCode: string) => setCode(newCode));

    const handleLeave = () => {
      socket.emit("leave-room", { roomId, userId, username });
    };

    window.addEventListener("beforeunload", handleLeave);
    return () => {
      handleLeave();
      socket.off("room-users");
      socket.off("chat-message");
      socket.off("code-change");
      window.removeEventListener("beforeunload", handleLeave);
    };
  }, [roomId, userId, username, problemId]);

  useEffect(() => {
    const onPopState = () => {
      const leave = window.confirm("Are you sure you want to leave the room?");
      if (leave) {
        socket.emit("leave-room", { roomId, userId, username });
        navigate("/dashboard");
      } else {
        window.history.pushState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("popstate", onPopState);
    window.history.pushState(null, "", window.location.pathname);
    return () => window.removeEventListener("popstate", onPopState);
  }, [navigate, roomId, userId, username]);

  useEffect(() => {
    if (!timerStarted || timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  const leaveRoom = () => {
    socket.emit("leave-room", { roomId, userId, username });
    toast.success("Left room successfully");
    navigate("/dashboard");
  };

  const handleRun = async () => {
    setTestResult(null);
    try {
      const res = await axios.post(
        `https://codeclashzone-2.onrender.com/api/dsa/${problemId}/run`,
        { code, language },
        { withCredentials: true }
      );
      setTestResult(res.data);
    } catch {
      toast.error("Run failed");
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `https://codeclashzone-2.onrender.com/api/dsa/${problemId}/submit`,
        {
          code,
          language,
          timeTakenInSeconds: problem.solveTimeLimit * 60 - timer,
        },
        { withCredentials: true }
      );
      setTestResult(res.data);
      toast.success("Submission successful");
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat-message", { roomId, message: newMessage });
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_2.5fr_1.5fr] gap-6 p-6 pt-24 bg-black text-white min-h-screen">
      {/* Left: Problem */}
      <div className="space-y-4 overflow-y-auto max-h-[80vh]">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-purple-400">RoomId: {roomId}</h2>
          <button onClick={() => navigator.clipboard.writeText(roomId || "")}>
            <HiOutlineClipboardCopy size={24} />
          </button>
        </div>
        {problem && (
          <>
            <h3 className="text-xl font-semibold">{problem.title}</h3>
            <span className="inline-block px-2 py-1 bg-purple-700 rounded text-sm">{problem.difficulty}</span>
            <p className="mt-2 whitespace-pre-line">{problem.description}</p>
            <div className="mt-4">
              <h4 className="font-semibold">Examples:</h4>
              {problem.examples.map((ex, i) => (
                <div key={i} className="p-2 mb-2 bg-gray-800 rounded">
                  <p><code>Input:</code> {ex.input}</p>
                  <p><code>Output:</code> {ex.output}</p>
                  {ex.explanation && <p className="text-sm text-gray-400">{ex.explanation}</p>}
                </div>
              ))}
            </div>
            {problem.hints?.length ? <HintsAccordion hints={problem.hints} /> : null}
          </>
        )}
      </div>

      {/* Middle: Editor */}
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <select
            className="bg-gray-800 text-white px-4 py-2 rounded"
            value={language}
            onChange={e => setLanguage(e.target.value as Language)}>
            {languageOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
          <div className="flex gap-2">
            {timerStarted ? (
              <p className="font-mono bg-gray-800 px-4 py-2 rounded">
                ⏱ {`${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
              </p>
            ) : (
              <button
                onClick={() => setTimerStarted(true)}
                className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700"
              >
                Start Timer
              </button>
            )}
            <button onClick={handleRun} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Run</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
        <MonacoEditor
          height="600px"
          language={language === "cpp" ? "cpp" : language}
          value={code}
          onChange={v => {
            const newCode = v || "";
            setCode(newCode);
            socket.emit("code-change", { roomId, code: newCode });
          }}
          theme="vs-dark"
          options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
        />
        {testResult && (
          <div className="bg-gray-900 p-4 text-sm rounded">
            <h4 className="font-bold mb-1">Test Result</h4>
            {testResult.results ? testResult.results.map((r: any, i: number) => (
              <div key={i}>
                {r.passed ? "✅" : "❌"} Input: {r.input}, Output: {r.actual}, Expected: {r.expected}
              </div>
            )) : (
              <div>{testResult.isCorrect ? "✅" : "❌"} Output: {testResult.output}</div>
            )}
          </div>
        )}
      </div>

      {/* Right: Chat + Users */}
      <div className="flex flex-col space-y-4">
        <button
          onClick={() => { if (window.confirm("Leave room?")) leaveRoom(); }}
          className="bg-red-600 px-4 py-2 rounded"
        >
          Leave Room
        </button>
        <div
          className="bg-gray-900 p-4 rounded h-[50%] overflow-y-auto flex flex-col-reverse"
          ref={chatBoxRef}
        >
          {[...messages].reverse().map((msg, i) => (
            <div key={i} className="mb-2 text-sm text-gray-300">
              <strong className="text-blue-400">{msg.username}</strong>: {msg.message}
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-800 px-3 py-2 rounded-l"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-r"
          >
            Send
          </button>
        </div>
        <div className="bg-gray-900 p-4 rounded h-40 overflow-y-auto">
          <h4 className="font-semibold mb-2">👥 Users in Room</h4>
          <ul className="list-disc ml-5">
            {usersInRoom.map(u => <li key={u.userId}>{u.username}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
