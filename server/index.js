const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/connection');

const authRoute = require('./routes/user');
const problemRoute = require('./routes/problems');
const submissionRoute = require('./routes/submissions');
const dsaProblemRoute = require('./routes/dsaProblems');
const roomRoutes = require('./routes/room');

const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const server = http.createServer(app);


const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    credentials: true,
  }
});

connectDB(process.env.MongoDB_URI);


app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/auth', authRoute);
app.use('/api/problems', problemRoute);
app.use('/api/frontend', problemRoute);
app.use('/api/', submissionRoute);
app.use('/api/users/', submissionRoute);
app.use('/api/dsa', dsaProblemRoute);
app.use('/api/rooms', roomRoutes);


const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("joinRoom", ({ roomId, username }) => {
    socket.join(roomId);
    console.log(`${username} joined room ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = {
        users: {},
        code: "",
        language: "javascript",
        timer: 600,
        scoreboard: {},
        chat: [],
      };
    }

    rooms[roomId].users[socket.id] = username;
    rooms[roomId].scoreboard[username] = 0;

    io.to(roomId).emit("roomData", {
      users: Object.values(rooms[roomId].users),
      scoreboard: rooms[roomId].scoreboard,
      code: rooms[roomId].code,
      timer: rooms[roomId].timer,
      chat: rooms[roomId].chat,
    });
  });

  socket.on("codeChange", ({ roomId, code }) => {
    if (rooms[roomId]) {
      rooms[roomId].code = code;
      socket.to(roomId).emit("codeUpdate", code);
    }
  });

  socket.on("sendMessage", ({ roomId, message, username }) => {
    if (rooms[roomId]) {
      const chatMsg = { username, message, time: new Date().toISOString() };
      rooms[roomId].chat.push(chatMsg);
      io.to(roomId).emit("chatUpdate", chatMsg);
    }
  });

  socket.on("timerTick", ({ roomId, timer }) => {
    if (rooms[roomId]) {
      rooms[roomId].timer = timer;
      socket.to(roomId).emit("timerUpdate", timer);
    }
  });

  socket.on("updateScore", ({ roomId, username, score }) => {
    if (rooms[roomId]) {
      rooms[roomId].scoreboard[username] = score;
      io.to(roomId).emit("scoreboardUpdate", rooms[roomId].scoreboard);
    }
  });

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (rooms[roomId]) {
        delete rooms[roomId].users[socket.id];
        io.to(roomId).emit("roomData", {
          users: Object.values(rooms[roomId].users),
          scoreboard: rooms[roomId].scoreboard,
          code: rooms[roomId].code,
          timer: rooms[roomId].timer,
          chat: rooms[roomId].chat,
        });
      }
    }
  });
});


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
