const Submission = require('../models/submission');
const User = require('../models/user');

async function getRanks(req, res, next) {
  try {
    const rawFilter = req.query.filter || 'all';
    const filter = rawFilter.toLowerCase();

    const now = new Date();
    let startDate = new Date(0);

    if (filter === 'weekly') {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      startDate.setDate(now.getDate() - diff);
    } else if (filter === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (filter === 'yearly') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); 
    }

    const submissionCounts = await Submission.aggregate([
      {
        $match: {
          isSuccess: true,
          submittedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          submissions: { $sum: 1 },
          latestCreatedAt: { $max: "$submittedAt" },
        },
      },
    ]);

    const userIds = submissionCounts.map((item) => item._id);
    const users = await User.find({ _id: { $in: userIds } }, { name: 1 });

    const leaderboard = submissionCounts.map((entry) => {
      const user = users.find((u) => u._id.toString() === entry._id.toString());
      return {
        name: user ? user.name : "Unknown",
        score: entry.submissions * 10,
        createdAt: entry.latestCreatedAt,
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Error in getRanks:", error);
    res.status(500).json({ success: false, message: "Failed to generate leaderboard scores" });
  }
}

module.exports = {
  getRanks,
};