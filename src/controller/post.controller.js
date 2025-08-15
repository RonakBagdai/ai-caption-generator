const postModel = require("../models/post.model");
const userModel = require("../models/user.model");
const { generateCaption } = require("../service/ai.service");
const { uploadImage, deleteImage } = require("../service/storage.service");
const { v4: uuidv4 } = require("uuid");

const createPostController = async (req, res) => {
  try {
    const file = req.file;
    const {
      vibe,
      extraPrompt,
      language = "en",
      category = "Personal",
      tags = [],
      isPublic = false,
    } = req.body;

    // Convert to base64 efficiently
    const base64Image = file.buffer.toString("base64");

    // Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Parse tags if they're sent as a string
    const parsedTags = Array.isArray(tags)
      ? tags
      : tags
      ? tags.split(",").map((tag) => tag.trim())
      : [];

    // Run AI generation and image upload in parallel for speed
    const [caption, uploadResponse] = await Promise.all([
      generateCaption(base64Image, { vibe, extraPrompt, language }),
      uploadImage(file.buffer, filename),
    ]);

    // Validate caption before saving
    if (!caption || caption.trim().length < 5) {
      throw new Error("Failed to generate valid caption");
    }

    // console.log("Generated caption:", caption); // Debug log

    // Create post in database
    const post = await postModel.create({
      caption,
      image: uploadResponse.url,
      imageKitFileId: uploadResponse.fileId,
      user: req.user._id,
      category,
      tags: parsedTags,
      vibeStyle: vibe,
      isPublic,
    });

    // Update user stats
    await userModel.findByIdAndUpdate(req.user._id, {
      $inc: { "stats.totalPosts": 1 },
    });

    // Return response quickly
    res.status(201).json({
      message: "Post created successfully",
      post: {
        _id: post._id,
        caption: post.caption,
        image: post.image,
        category: post.category,
        tags: post.tags,
        vibeStyle: post.vibeStyle,
        createdAt: post.createdAt,
        user: {
          _id: req.user._id,
          username: req.user.username,
        },
      },
    });
  } catch (error) {
    console.error("Post creation error:", error);
    res.status(500).json({
      message: "Failed to create post",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

const listPostsController = async (req, res) => {
  try {
    const {
      search,
      category,
      tags,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 50,
    } = req.query;

    let query = {};

    // If user is authenticated, show only their posts
    if (req.user) {
      query.user = req.user._id;
    }

    // Build search query
    if (search) {
      query.$text = { $search: search };
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (tags) {
      const tagArray = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const posts = await postModel
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({ path: "user", select: "username _id profilePicture" })
      .lean();

    const total = await postModel.countDocuments(query);

    res.json({
      posts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error listing posts:", error);
    res.status(500).json({ error: "Failed to load posts" });
  }
};

const deletePostController = async (req, res) => {
  const { id } = req.params;
  const post = await postModel.findById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  if (post.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }
  try {
    await deleteImage(post.imageKitFileId);
  } catch (e) {
    console.error("Image deletion failed (continuing):", e.message);
  }
  await post.deleteOne();

  // Update user stats
  await userModel.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.totalPosts": -1 },
  });

  res.json({ message: "Post deleted", id });
};

const deleteAllPostsController = async (req, res) => {
  try {
    // Find all posts by the authenticated user
    const userPosts = await postModel.find({ user: req.user._id });

    if (userPosts.length === 0) {
      return res.json({ message: "No posts to delete", deletedCount: 0 });
    }

    // Delete images from ImageKit in parallel
    const imageDeletePromises = userPosts.map(async (post) => {
      try {
        if (post.imageKitFileId) {
          await deleteImage(post.imageKitFileId);
        }
      } catch (e) {
        console.error(
          `Failed to delete image ${post.imageKitFileId}:`,
          e.message
        );
      }
    });

    // Delete all posts from database
    const deleteResult = await postModel.deleteMany({ user: req.user._id });

    // Reset user stats
    await userModel.findByIdAndUpdate(req.user._id, {
      $set: { "stats.totalPosts": 0 },
    });

    // Wait for all image deletions to complete (but don't block response)
    Promise.all(imageDeletePromises).catch((e) => {
      console.error("Some images failed to delete:", e.message);
    });

    res.json({
      message: "All posts deleted successfully",
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error("Delete all posts error:", error);
    res.status(500).json({ message: "Failed to delete posts" });
  }
};

// New controller functions for enhanced features
const updatePostController = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, category, tags, isPublic } = req.body;

    const post = await postModel.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData = {};
    if (caption !== undefined) updateData.caption = caption;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map((tag) => tag.trim());
    }
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedPost = await postModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("user", "username profilePicture");

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
};

const getUserStatsController = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("stats preferences");
    const posts = await postModel.find({ user: req.user._id });

    // Calculate additional stats
    const categoryStats = posts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {});

    const styleStats = posts.reduce((acc, post) => {
      if (post.vibeStyle) {
        acc[post.vibeStyle] = (acc[post.vibeStyle] || 0) + 1;
      }
      return acc;
    }, {});

    const monthlyStats = posts.reduce((acc, post) => {
      const month = post.createdAt.toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    res.json({
      userStats: user.stats,
      preferences: user.preferences,
      categoryBreakdown: categoryStats,
      styleBreakdown: styleStats,
      monthlyActivity: monthlyStats,
      totalCategories: Object.keys(categoryStats).length,
      totalStyles: Object.keys(styleStats).length,
      avgPostsPerMonth:
        posts.length > 0
          ? (
              posts.length / Math.max(Object.keys(monthlyStats).length, 1)
            ).toFixed(1)
          : 0,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ error: "Failed to get user statistics" });
  }
};

const bulkUpdatePostsController = async (req, res) => {
  try {
    const { postIds, updates } = req.body;

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return res.status(400).json({ error: "Post IDs are required" });
    }

    const updateData = {};
    if (updates.category) updateData.category = updates.category;
    if (updates.tags) {
      updateData.tags = Array.isArray(updates.tags)
        ? updates.tags
        : updates.tags.split(",").map((tag) => tag.trim());
    }
    if (updates.isPublic !== undefined) updateData.isPublic = updates.isPublic;

    const result = await postModel.updateMany(
      { _id: { $in: postIds }, user: req.user._id },
      updateData
    );

    res.json({
      message: `Successfully updated ${result.modifiedCount} posts`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error bulk updating posts:", error);
    res.status(500).json({ error: "Failed to update posts" });
  }
};

module.exports = {
  createPostController,
  listPostsController,
  deletePostController,
  deleteAllPostsController,
  updatePostController,
  getUserStatsController,
  bulkUpdatePostsController,
};
