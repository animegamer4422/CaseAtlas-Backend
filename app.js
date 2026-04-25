const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/error.middleware');

// Route files
const authRoutes = require('./routes/auth.routes');
const caseRoutes = require('./routes/case.routes');
const updateRoutes = require('./routes/update.routes');
const commentRoutes = require('./routes/comment.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const notificationRoutes = require('./routes/notification.routes');
const uploadRoutes = require('./routes/upload.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Global user routes (e.g. /api/users/me/subscriptions) goes through subscription routes or dedicated user routes
// Mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/cases', caseRoutes);

// Nest updates and comments inside cases
app.use('/api/cases/:caseId/updates', updateRoutes);
app.use('/api/cases/:caseId/comments', commentRoutes);
app.use('/api/cases/:caseId/subscribe', subscriptionRoutes);

// Top level routes
app.use('/api/updates', updateRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', subscriptionRoutes); // for /me/subscriptions
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
