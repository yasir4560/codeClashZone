const roomUsers = {};



module.exports = function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log("✅ New connection:", socket.id);


    // 🔹 Join Room
    socket.on('join-room', (data) => {
        
         let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
      console.error('Invalid JSON received in join-room:', data);
      return;
    }
  }

  const { roomId, userId, username } = parsedData || {};
  console.log('✅ join-room data:', parsedData);


      socket.join(roomId);

      // Store user info on the socket object
      socket.data.userId = userId;
      socket.data.roomId = roomId;
      socket.data.username = username;

      // Add user to room map
      if (!roomUsers[roomId]) {
        roomUsers[roomId] = new Map();
      }

      roomUsers[roomId].set(userId, username);

      // Send updated user list to room
      const userList = Array.from(roomUsers[roomId], ([id, name]) => ({
        userId: id,
        username: name,
      }));

      io.to(roomId).emit('room-users', userList);
    
      // io.to(roomId).emit("user-joined", username);


      // Broadcast join message
      console.log("users", roomUsers);


      io.to(roomId).emit('chat-message', {
        userId: 'system',
        username: 'system',
        message: `🎉 ${username} has joined the room 🎉`,
      });
      console.log("hello", username);
    });

    // 🔹 Chat Message
    socket.on('chat-message', (data) => {
    

         let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (err) {
      console.error('Invalid JSON received in join-room:', data);
      return;
    }
  }

  const { message } = parsedData || {};
  console.log('✅ join-room data:', parsedData);

const { roomId, userId, username } = socket.data;
      if (!roomId || !userId) return;
          console.log(message);
      io.to(roomId).emit('chat-message', {
        userId,
        username,
        message,
      });
    });

    // 🔹 Disconnect
    socket.on('disconnect', () => {
      const { roomId, userId, username } = socket.data;

      if (roomId && userId && roomUsers[roomId]) {
        roomUsers[roomId].delete(userId);

        const userList = Array.from(roomUsers[roomId], ([id, name]) => ({
          userId: id,
          username: name,
        }));

        io.to(roomId).emit('room-users', userList);

        socket.to(roomId).emit('chat-message', {
          userId: 'system',
          username: 'system',
          message: `❌ ${username} has left the room.`,
        });

        if (roomUsers[roomId].size === 0) {
          delete roomUsers[roomId];
        }

        console.log("❌ Disconnect:", socket.id);
      }
    });
  });
};
