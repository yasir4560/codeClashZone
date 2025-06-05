const Room = require('../models/room');


async function createRoom(req, res) {
     try {
    const { problemId, userId, username } = req.body;

    if (!problemId || !userId || !username) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newRoom = await Room.create({
      problemId,
      roomCode,
      participants: [{ userId, username }],
    });

    res.status(201).json(newRoom);
  } catch (err) {
    console.error("Create Room Failed:", err);
    res.status(500).json({ message: "Server error" });
  }
}


async function getRooms(req, res) {
  try {
    const rooms = await Room.find({})
      .populate("problemId").populate("hostId", "username")
      .populate("participants.userId", "username")
      .sort({ createdAt: -1 });

    res.json(rooms);
  } catch (err) {
    console.error("Fetch Rooms Failed:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function getRoomByCode(req, res) {
     try {
    const room = await Room.findOne({ roomCode: req.params.roomCode }).populate("problemId");

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json(room);
  } catch (err) {
    console.error("Fetch Room by Code Failed:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function joinRoom(req, res) {
    try {
    const { userId, username } = req.body;
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(404).json({ message: "Room not found" });
    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ message: "Room is full" });
    }

    const alreadyJoined = room.participants.some((p) => p.userId.toString() === userId);
    if (alreadyJoined) return res.status(400).json({ message: "User already joined" });

    room.participants.push({ userId, username });
    if (room.participants.length > 0) room.status = "live";

    await room.save();
    res.json(room);
  } catch (err) {
    console.error("Join Room Failed:", err);
    res.status(500).json({ message: "Server error" });
  }
}

async function leaveRoom(req, res) {
      try {
    const { userId } = req.body;
    const { roomCode } = req.params;

    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(404).json({ message: "Room not found" });

    room.participants = room.participants.filter((p) => p.userId.toString() !== userId);
    if (room.participants.length === 0) {
      room.status = "waiting";
    }

    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  createRoom,
  getRooms,
  getRoomByCode,
  joinRoom,
  leaveRoom
};