const Subscription = require('../models/Subscription');
const Case = require('../models/Case');
const User = require('../models/User');

const subscribeToCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    const existingSub = await Subscription.findOne({ userId: req.user._id, caseId: caseItem._id });
    if (existingSub) return res.status(400).json({ message: 'Already subscribed' });

    await Subscription.create({ userId: req.user._id, caseId: caseItem._id });

    // Update case subscribers array
    caseItem.subscribers.push(req.user._id);
    await caseItem.save();

    // Update user subscribed cases
    await User.findByIdAndUpdate(req.user._id, {
      $push: { subscribedCases: caseItem._id },
    });

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const unsubscribeFromCase = async (req, res) => {
  try {
    const caseItem = await Case.findOne({ caseId: req.params.caseId });
    if (!caseItem) return res.status(404).json({ message: 'Case not found' });

    await Subscription.deleteOne({ userId: req.user._id, caseId: caseItem._id });

    caseItem.subscribers = caseItem.subscribers.filter(sub => sub.toString() !== req.user._id.toString());
    await caseItem.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { subscribedCases: caseItem._id },
    });

    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMySubscriptions = async (req, res) => {
  try {
    const OfficialUpdate = require('../models/OfficialUpdate');

    const subscriptions = await Subscription.find({ userId: req.user._id })
      .populate('caseId', 'title caseId status category location updateCount commentCount subscribers createdAt updatedAt');

    // Attach the most recent approved official update date to each subscription
    const enriched = await Promise.all(
      subscriptions.map(async (sub) => {
        const caseDoc = sub.caseId;
        if (!caseDoc) return sub.toObject();

        const lastUpdate = await OfficialUpdate
          .findOne({ caseId: caseDoc._id, isApproved: true })
          .sort({ createdAt: -1 })
          .select('createdAt title');

        const obj = sub.toObject();
        if (lastUpdate) {
          obj.caseId.lastUpdateAt = lastUpdate.createdAt;
          obj.caseId.lastUpdateTitle = lastUpdate.title;
        }
        return obj;
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { subscribeToCase, unsubscribeFromCase, getMySubscriptions };
