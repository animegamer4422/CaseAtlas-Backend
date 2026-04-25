const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust this for production to the frontend URL
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins a case room to receive updates for that particular case
    socket.on('join_case', (payload) => {
      // payload could be a string directly OR an object
      const caseId = typeof payload === 'string' ? payload : payload?.caseId;
      if (caseId) {
        socket.join(caseId);
        console.log(`Socket ${socket.id} joined case room ${caseId}`);
      }
    });

    // User joins their own personal room to receive personal notifications
    socket.on('join_user', ({ userId }) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room ${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized.');
  }
  return io;
};

module.exports = { initSocket, getIo };
