const Notification = require('../models/Notification');
const { getIo } = require('../sockets/socket');

const createNotification = async (userId, caseId, type, message) => {
  try {
    const notification = await Notification.create({
      userId,
      caseId,
      type,
      message,
    });

    const io = getIo();
    // Emit to specific user if they are online in a general notification room, or emit to their userId room
    if (io) {
      io.to(userId.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = createNotification;
