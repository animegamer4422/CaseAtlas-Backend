const http = require('http');
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const { initSocket } = require('./sockets/socket');

// Connect to Database
connectDB();

// Config Cloudinary
connectCloudinary();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
