const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Derive avatar fields from username deterministically
const AVATAR_COLORS = [
  '#4338ca','#0891b2','#059669','#d97706','#dc2626',
  '#7c3aed','#db2777','#0284c7','#16a34a','#ca8a04',
];
const userPayload = (user) => {
  const initials = user.username.slice(0, 2).toUpperCase();
  const colorIdx = user.username.charCodeAt(0) % AVATAR_COLORS.length;
  return {
    _id: user._id,
    username: user.username,
    handle: `@${user.username}`,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    avatarInitials: initials,
    avatarColor: AVATAR_COLORS[colorIdx],
  };
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      username,
      email,
      passwordHash: password, // Pre-save hook hashes it
    });

    if (user) {
      res.status(201).json({
        ...userPayload(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        ...userPayload(user),
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      res.json(userPayload(user));
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe };
