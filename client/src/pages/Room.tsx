import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import { HiOutlineClipboardCopy } from "react-icons/hi";
import socket from "../services/socket";
import axios from "axios";
import toast from "react-hot-toast"; 
import HintsAccordion from "@/components/HintsAccordion";

type Language = "python" | "cpp" | "java";
const languageOptions = [
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
];

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
}
interface RoomUser {
  userId: string;
  username: string;
}
interface Problem {
  title: string;
  description: string;
  difficulty: string;
  hints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<Language, string>;
  solveTimeLimit: number;
}

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
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
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);


  useEffect(() => {
  if (chatBoxRef.current) {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  }
}, [messages]);

  useEffect(() => {
    if (!problemId) return;

    axios.get(`https://codeclashzone-2.onrender.com/api/dsa/${problemId}`, {
      withCredentials: true,
    })
      .then(res => {
        const data: Problem = res.data;
        setProblem(data);
        setTimer(data.solveTimeLimit * 60);
        setCode(data.starterCode[language] || "");
      })
      .catch(err => {
        console.error("Failed to fetch problem:", err);
        toast.error("Unauthorized or failed to fetch problem.");
      });
  }, [problemId]);

  useEffect(() => {
    if (!problem) return;
    const starter = problem.starterCode[language];
    setCode(starter !== undefined ? starter : "");
  }, [language, problem]);

  useEffect(() => {
    if (!roomId || !userId || !username) return;
    socket.emit("join-room", { roomId, userId, username, problemId });

    socket.on("room-users", setUsersInRoom);
    socket.on("chat-message", (msg: ChatMessage) =>
      setMessages(prev => [...prev, msg])
    );
    socket.on("code-change", (newCode: string) => setCode(newCode));

    return () => {
      socket.off("room-users");
      socket.off("chat-message");
      socket.off("code-change");
    };
  }, [roomId, userId, username, problemId]);

  useEffect(() => {
    if (!timerStarted || timer < 0) return;
    timerRef.current = setTimeout(() => setTimer(prev => prev - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  const startTimer = () => setTimerStarted(true);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat-message", { roomId, message: newMessage });
    setNewMessage("");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId!).then(() => toast.success("Room ID copied!"));
  };

  const handleRun = () => {
    toast("Run button clicked");
    
  };

  const handleSubmit = () => {
    toast("Submit button clicked");
    
  };

return (
  <div className="relative bg-black text-white min-h-screen p-6 pt-24 grid grid-cols-1 lg:grid-cols-[2fr_2.5fr_1.5fr] gap-6">
    {/* left*/}
    <div className="space-y-4 col-span-1 overflow-y-auto max-h-[80vh]">
      <div className="flex items-center space-x-2">
        <h2 className="text-2xl font-bold text-purple-400">RoomId: {roomId}</h2>
        <button onClick={copyRoomId} className="text-white hover:text-purple-300">
          <HiOutlineClipboardCopy size={24} />
        </button>
      </div>
      {problem && (
        <>
          <h3 className="text-xl font-semibold">{problem.title}</h3>
          <span className="inline-block px-2 py-1 bg-purple-700 rounded text-sm">
            {problem.difficulty}
          </span>
          <p className="mt-2 whitespace-pre-line">{problem.description}</p>
          <div className="mt-4">
            <h4 className="font-semibold">Examples:</h4>
            {problem.examples.map((ex, idx) => (
              <div key={idx} className="p-2 mb-2 bg-gray-800 rounded">
                <p><code>Input:</code> {ex.input}</p>
                <p><code>Output:</code> {ex.output}</p>
                {ex.explanation && <p className="text-sm text-gray-400">{ex.explanation}</p>}
              </div>
            ))}
          </div>
          {problem.hints && problem.hints.length > 0 && (<HintsAccordion hints={problem.hints} />)}

        </>
      )}
    </div>

    {/* middle */}
    <div className="col-span-1 flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <select
          className="bg-gray-800 text-white px-4 py-2 rounded"
          value={language}
          onChange={e => setLanguage(e.target.value as Language)}
        >
          {languageOptions.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <div className="flex gap-2">
          {timerStarted ? (
            <p className="font-mono bg-gray-800 px-4 py-2 rounded">⏱ {formatTime(timer)}</p>
          ) : (
            <button
              onClick={startTimer}
              className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 courser-pointer">
              Start Timer
            </button>
          )}
          <button className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 cursor-pointer" onClick={handleRun}>
            Run
          </button>
          <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 cursor-pointer" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
      <div className="flex-1 border border-gray-700 rounded overflow-hidden">
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
      </div>
    </div>

    {/* right*/}
    <div className="col-span-1 flex flex-col space-y-4">
      <button className="bg-[#33186B] px-4 py-2 rounded hover:bg-[#150050] cursor-pointer">Leaderboard</button>
      <div className="bg-gray-900 p-4 rounded h-[50%] overflow-y-auto flex flex-col-reverse" ref={chatBoxRef}>
        {[...messages].reverse().map((msg, idx) => (<div key={idx} className="mb-2 text-sm text-gray-300">
        <strong className="text-blue-400">{msg.username}</strong>: {msg.message}
    </div>
  ))}
</div>


      <div className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="flex-1 bg-gray-800 px-3 py-2 rounded-l outline-none"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700 cursor-pointer">
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
