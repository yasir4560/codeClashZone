import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import MonacoEditor from "@monaco-editor/react";

const SOCKET_SERVER_URL = "http://localhost:8000";

interface ChatMessage {
  username: string;
  message: string;
  time: string;
}

export default function MultiplayerRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [timer, setTimer] = useState(6000);
  const [scoreboard, setScoreboard] = useState<Record<string, number>>({});
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const socketRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedJoined = sessionStorage.getItem("joined");
    const savedUsername = sessionStorage.getItem("username");
    if (savedJoined === "true" && savedUsername) {
      setUsername(savedUsername);
      setJoined(true);
    }
  }, []);

  useEffect(() => {
    if (!joined && inputRef.current) {
      inputRef.current.focus();
    }
  }, [joined]);

  useEffect(() => {
    if (!joined) return;

    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("joinRoom", { roomId, username });

    socketRef.current.on("roomData", (data: any) => {
      setUsers(data.users);
      setCode(data.code);
      setTimer(data.timer);
      setScoreboard(data.scoreboard);
      setChatMessages(data.chat);
    });

    socketRef.current.on("codeUpdate", (newCode: string) => {
      setCode(newCode);
    });

    socketRef.current.on("timerUpdate", (newTimer: number) => {
      setTimer(newTimer);
    });

    socketRef.current.on("scoreboardUpdate", (newScores: Record<string, number>) => {
      setScoreboard(newScores);
    });

    socketRef.current.on("chatUpdate", (chatMsg: ChatMessage) => {
      setChatMessages((prev) => [...prev, chatMsg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [joined, roomId, username]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value ?? "");
    if (socketRef.current) {
      socketRef.current.emit("codeChange", { roomId, code: value });
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { roomId, message: messageInput, username });
    setMessageInput("");
  };

  useEffect(() => {
    if (!joined || timer <= 0) return;

    const timerId = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerId);
          return 0;
        }
        const newTime = t - 1;
        socketRef.current.emit("timerTick", { roomId, timer: newTime });
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [joined, timer, roomId]);

  const handleJoin = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }
    sessionStorage.setItem("joined", "true");
    sessionStorage.setItem("username", username);
    setJoined(true);
  };

  const shareLink = window.location.href;

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl mb-6">Join Room: {roomId}</h1>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your username"
          className="p-2 rounded text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={handleJoin}
          className="mt-4 bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Join
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 h-screen bg-gray-900 text-white gap-2 p-2 mt-16">
      <div className="col-span-3 bg-gray-800 rounded p-4 overflow-auto">
        <h2 className="text-xl font-bold mb-4">Problems</h2>
        </div>

      <div className="col-span-5 flex flex-col rounded bg-gray-800 p-2">
        <div className="flex justify-between mb-2">
          <h2 className="text-xl font-bold">Code Editor</h2>
          <select
            className="bg-gray-700 rounded px-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>
        </div>

        <MonacoEditor
          height="calc(100vh - 120px)"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          options={{ fontSize: 14, minimap: { enabled: false }, wordWrap: "on" }}
        />
      </div>

      <div className="col-span-4 flex flex-col rounded bg-gray-800 p-4">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold mb-2">Round Ends In</h2>
          <p className="text-4xl font-mono">
            {Math.floor(timer / 60).toString().padStart(2, "0")}:
            {(timer % 60).toString().padStart(2, "0")}
          </p>
        </div>

        <div className="mb-6 flex-1 overflow-auto">
          <h3 className="text-xl font-semibold mb-2">Scoreboard</h3>
          <ul>
            {Object.entries(scoreboard).map(([user, score]) => (
              <li key={user} className="flex justify-between py-1 border-b border-gray-700">
                <span>{user}</span>
                <span>{score}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col h-64 border-t border-gray-700 pt-2">
          <h3 className="text-xl font-semibold mb-2">Chat</h3>
          <div id="chatBox" className="flex-1 overflow-auto mb-2 p-2 bg-gray-900 rounded">
            {chatMessages.map((msg, i) => (
              <div key={i} className="mb-1">
                <span className="font-semibold">{msg.username}: </span>
                <span>{msg.message}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {new Date(msg.time).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              className="flex-1 rounded px-2 py-1 text-black"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-4 py-1 rounded hover:bg-blue-700 transition"
            >
              Send
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-gray-400 break-words">
          Share this link to invite others:
          <br />
          <a href={shareLink} className="text-blue-400 underline">
            {shareLink}
          </a>
        </div>
      </div>
    </div>
  );
}
