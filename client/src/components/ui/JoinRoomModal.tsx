import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface JoinRoomModalProps {
  problem: { _id: string; title: string; difficulty: string };
  user: { userId: string; name: string };
  onClose: () => void;
}

export default function JoinRoomModal({ problem, user, onClose }: JoinRoomModalProps) {
  const roomIdRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const username = user.name || '';

  const handleJoin = () => {
    const roomId = roomIdRef.current?.value.trim();
    if (roomId && username) {
      navigate(`/room/${roomId}?problem=${problem._id}&username=${encodeURIComponent(username)}&userId=${user.userId}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-black text-center">Join Room</h2>
        <input
          ref={roomIdRef}
          className="w-full mb-3 p-2 border rounded text-gray-700"
          placeholder="Enter Room ID"
        />
        <input
          className="w-full mb-4 p-2 border rounded text-gray-700"
          placeholder="Enter Username"
          value={username}
          readOnly
        />
        <div className="flex justify-between">
          <button
            className="bg-[#CE0F3D] px-4 py-2 rounded hover:bg-[#E41749]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-[#3F0071] text-white px-4 py-2 rounded hover:bg-[#A459D1]"
            onClick={handleJoin}
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
