
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Comment = require('./models/Comment');
const User = require('./models/User');

dotenv.config();
mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const users = await User.find({ username: { $nin: ['cyber_sec_99', 'local_resident', 'justice_seeker'] } });
  const userIds = users.map(u => u._id);
  const res = await Comment.deleteMany({ userId: { $in: userIds } });
  console.log('Deleted comments:', res.deletedCount);
  process.exit();
}).catch(console.error);

