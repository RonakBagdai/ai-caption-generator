const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imageKitFileId: { type: String, required: true },
    caption: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: {
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
    tags: [{ type: String, trim: true }],
    vibeStyle: { type: String }, // Store the style used for generation
    isPublic: { type: Boolean, default: false }, // For future public gallery feature
    likes: { type: Number, default: 0 }, // For future engagement features
  },
  { timestamps: true }
);

// Add text index for searching captions and tags
postSchema.index({ caption: "text", tags: "text" });

const postModel = mongoose.model("Post", postSchema);

module.exports = postModel;
