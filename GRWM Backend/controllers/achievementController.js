const Achievement = require("../models/Achiements");
const User = require("../models/User");
const Notification = require("../models/Notification");

// 🎖 Define Achievement Milestones
const milestones = [
  {
    count: 1,
    title: "First Sale",
    description: "Sold your first product!",
    badge: "Bronze",
  },
  {
    count: 5,
    title: "Rising Star",
    description: "Sold 5+ products!",
    badge: "Silver",
  },
  {
    count: 20,
    title: "Elite Seller",
    description: "Sold 20+ products!",
    badge: "Gold",
  },
  {
    count: 50,
    title: "Power Seller",
    description: "Sold 50+ products!",
    badge: "Platinum",
  },
  {
    count: 100,
    title: "Top Merchant",
    description: "Sold 100+ products!",
    badge: "Diamond",
  },
];

// 🏆 Get User Achievements Based on `totalSold`
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    const { totalSold } = user;

    const existingAchievements = await Achievement.find({ user: userId });

    let newAchievements = [];
    for (const milestone of milestones) {
      const alreadyExists = existingAchievements.some(
        (a) => a.title === milestone.title
      );
      if (totalSold >= milestone.count && !alreadyExists) {
        const newAchievement = await Achievement.create({
          ...milestone,
          user: userId,
          popupSeen: false,
        });
        newAchievements.push(newAchievement);

        // 🔔 Create a notification for the achievement
        await Notification.create({
          userId: userId,
          title: "🎉 Achievement Unlocked!",
          message: `You've earned the "${milestone.title}" badge.`,
          type: "achievement",
          read: false,
        });
      }
    }

    const achievementsList = milestones.map((milestone) => {
      const completed = totalSold >= milestone.count;

      // ✅ Calculate progress relative to current milestone
      let progress = completed
        ? 100
        : Math.min(100, (totalSold / milestone.count) * 100);

      progress = Math.round(progress);
      return {
        ...milestone,
        completed,
        progress,
      };
    });

    const popupAchievements = await Achievement.find({
      user: userId,
      popupSeen: false,
    });

    res.status(200).json({
      success: true,
      message: "User achievements fetched successfully.",
      data: {
        totalSold,
        achievements: achievementsList,
        popupAchievements,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user achievements.",
      error: error.message,
    });
  }
};

const markAchievementPopupSeen = async (req, res) => {
  const { userId } = req.params;
  try {
    await Achievement.updateMany(
      { user: userId, popupSeen: false },
      { $set: { popupSeen: true } }
    );

    return res.status(200).json({
      success: true,
      message: "Popup achievements marked as seen.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update achievements.",
      error: error.message,
    });
  }
};

module.exports = { getUserAchievements, markAchievementPopupSeen };
