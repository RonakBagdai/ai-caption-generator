const userModel = require("../models/user.model");
const { uploadImage, deleteImage } = require("../service/storage.service");

const getUserProfileController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ error: "Failed to get user profile" });
  }
};

const updateUserProfileController = async (req, res) => {
  try {
    const { username, preferences } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (username) updateData.username = username;
    if (preferences) updateData.preferences = preferences;

    const user = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password");

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

const uploadProfilePictureController = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "Profile picture file is required" });
    }

    const userId = req.user._id;
    const user = await userModel.findById(userId);

    // Delete old profile picture if exists
    if (user.profilePictureFileId) {
      try {
        await deleteImage(user.profilePictureFileId);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    // Upload new profile picture
    const filename = `profile_${userId}_${Date.now()}`;
    const uploadResponse = await uploadImage(req.file.buffer, filename);

    // Update user record
    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          profilePicture: uploadResponse.url,
          profilePictureFileId: uploadResponse.fileId,
        },
        { new: true }
      )
      .select("-password");

    res.json({
      message: "Profile picture updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Failed to upload profile picture" });
  }
};

const deleteProfilePictureController = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);

    if (user.profilePictureFileId) {
      try {
        await deleteImage(user.profilePictureFileId);
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(
        userId,
        {
          profilePicture: null,
          profilePictureFileId: null,
        },
        { new: true }
      )
      .select("-password");

    res.json({
      message: "Profile picture deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    res.status(500).json({ error: "Failed to delete profile picture" });
  }
};

const updateUserPreferencesController = async (req, res) => {
  try {
    const { theme, favoriteStyles, defaultCategory } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (theme) updateData["preferences.theme"] = theme;
    if (favoriteStyles)
      updateData["preferences.favoriteStyles"] = favoriteStyles;
    if (defaultCategory)
      updateData["preferences.defaultCategory"] = defaultCategory;

    const user = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("-password");

    res.json({
      message: "Preferences updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ error: "Failed to update preferences" });
  }
};

module.exports = {
  getUserProfileController,
  updateUserProfileController,
  uploadProfilePictureController,
  deleteProfilePictureController,
  updateUserPreferencesController,
};
