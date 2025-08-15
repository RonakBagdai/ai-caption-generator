const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    profilePictureFileId: {
      type: String,
      default: null,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      favoriteStyles: [String],
      defaultCategory: {
        type: String,
        enum: [
          "Personal",
          "Business",
          "Creative",
          "Social",
          "Marketing",
          "Other",
        ],
        default: "Personal",
      },
    },
    stats: {
      totalPosts: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      joinedAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
