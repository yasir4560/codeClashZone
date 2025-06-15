import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import socket from "../services/socket";

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

export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get("userId")!;
  const username = queryParams.get("username")!;
  const problemId = queryParams.get("problem")!;

  const [language, setLanguage] = useState<Language>("java");
  const [code, setCode] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [usersInRoom, setUsersInRoom] = useState<RoomUser[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (!roomId || !userId || !username) return;

    socket.emit("join-room", { roomId, userId, username, problemId });

    socket.on("room-users", (users: RoomUser[]) => {
      setUsersInRoom(users);
    });

    socket.on("chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    // socket.on("user-joined", (name: string) => {
    //   toast.success(`${name} joined the room 🎉`);
    // });

    socket.on("code-change", (newCode: string) => {
      setCode(newCode);
    });

    return () => {
      socket.off("room-users");
      socket.off("chat-message");
      socket.off("user-joined");
      socket.off("code-change");
    };
  }, [roomId, userId, username, problemId]);


  useEffect(() => {
    if (!timerStarted || timer === 0) return;

    timerRef.current = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer, timerStarted]);

  const startTimer = () => {
    if (!timerStarted) {
      setTimerStarted(true);
      setTimer(30 * 60); // need to change from db
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    socket.emit("code-change", { roomId, code: newCode });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("chat-message", { roomId, message: newMessage });
    setNewMessage("");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 pt-20 bg-black text-white min-h-screen">
      {/* Left*/}
      <div className="space-y-4 col-span-1">
        <h2 className="text-xl font-bold text-purple-400">Room: {roomId}</h2>
        <p className="text-sm text-gray-400">Username: {username}</p>
        <p className="text-sm text-gray-400">Problem ID: {problemId}</p>

        {timerStarted ? (
          <p className="text-lg font-mono bg-gray-800 px-4 py-2 rounded">
            Timer: {formatTime(timer)}
          </p>
        ) : (
          <button
            onClick={startTimer}
            className="bg-pink-600 px-4 py-2 rounded hover:bg-pink-700 transition"
          >
            Start Challenge Timer
          </button>
        )}

        <div>
          <h4 className="font-semibold text-lg mb-2">👥 Users in Room</h4>
          <ul className="list-disc ml-5 text-sm text-gray-300">
            {usersInRoom.map((u) => (
              <li key={u.userId}>{u.username}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Center*/}
      <div className="flex flex-col space-y-4 col-span-1 md:col-span-1">
        <select
          className="bg-gray-800 text-white px-4 py-2 rounded"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
        >
          {languageOptions.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <div className="border border-gray-700 rounded overflow-hidden flex-1">
          <MonacoEditor
            height="500px"
            language={language === "cpp" ? "cpp" : language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: "on",
            }}
          />
        </div>
      </div>

      {/* Right*/}
      <div className="flex flex-col space-y-4 col-span-1">
        <h4 className="text-lg font-semibold">💬 Chat</h4>
        <div className="bg-gray-900 rounded p-4 h-96 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className="text-sm text-gray-300 mb-2">
              <strong className="text-blue-400">{msg.username}</strong>: {msg.message}
            </div>
          ))}
        </div>

        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-800 px-3 py-2 rounded-l outline-none"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 px-4 py-2 rounded-r hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
