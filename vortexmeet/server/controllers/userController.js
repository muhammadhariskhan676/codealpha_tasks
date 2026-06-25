// controllers/userController.js
// User profile lookups and the follow/unfollow social action.

const User = require("../models/User");

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("followers", "name profileImage")
      .populate("following", "name profileImage");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user });
  } catch (err) {
    console.error("GetProfile error:", err.message);
    res.status(500).json({ message: "Could not fetch profile" });
  }
};

// ─── POST /api/users/:id/follow ───────────────────────────────────────────────
// Toggle follow — follow if not already following, unfollow if already following.
const followUser = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id.toString();

    if (targetId === myId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const [me, target] = await Promise.all([
      User.findById(myId),
      User.findById(targetId),
    ]);

    if (!target) return res.status(404).json({ message: "User not found" });

    const alreadyFollowing = me.following.map(String).includes(targetId);

    if (alreadyFollowing) {
      // Unfollow: remove from both sides
      me.following = me.following.filter((id) => id.toString() !== targetId);
      target.followers = target.followers.filter((id) => id.toString() !== myId);
    } else {
      // Follow: add to both sides
      me.following.push(target._id);
      target.followers.push(me._id);
    }

    // Save both documents in parallel
    await Promise.all([me.save(), target.save()]);

    res.status(200).json({
      message: alreadyFollowing ? "Unfollowed" : "Followed",
      following: !alreadyFollowing,
    });
  } catch (err) {
    console.error("FollowUser error:", err.message);
    res.status(500).json({ message: "Could not update follow status" });
  }
};

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Search/list users (useful for "find people" feature)
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = search
      ? { name: { $regex: search, $options: "i" }, _id: { $ne: req.user._id } }
      : { _id: { $ne: req.user._id } };

    const users = await User.find(query)
      .select("name email profileImage bio followers following")
      .limit(20);

    res.status(200).json({ users });
  } catch (err) {
    console.error("GetUsers error:", err.message);
    res.status(500).json({ message: "Could not fetch users" });
  }
};

// ─── PUT /api/users/profile ───────────────────────────────────────────────────
// Update bio or profile image
const updateProfile = async (req, res) => {
  try {
    const { bio, profileImage } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { bio, profileImage },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", user: updated });
  } catch (err) {
    console.error("UpdateProfile error:", err.message);
    res.status(500).json({ message: "Could not update profile" });
  }
};

module.exports = { getUserProfile, followUser, getUsers, updateProfile };
