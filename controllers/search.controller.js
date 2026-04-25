const Case = require('../models/Case');

const searchCases = async (req, res) => {
  try {
    const { query, category, status, location } = req.query;
    let filter = {};

    if (query) {
      // Allow searching by exact caseId or partial title/description
      filter.$or = [
        { caseId: { $regex: query, $options: 'i' } },
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const cases = await Case.find(filter)
      .populate('createdBy', 'username avatarInitials')
      .sort({ createdAt: -1 });

    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { searchCases };
