const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const { postLimiter } = require("../middlewares/rateLimiter");
const { validatePostInput } = require("../middlewares/validation");
const postModel = require("../models/post.model");
const {
  createPostController,
  listPostsController,
  deletePostController,
  deleteAllPostsController,
  updatePostController,
  getUserStatsController,
  bulkUpdatePostsController,
} = require("../controller/post.controller");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB limit
});

/* GET /api/posts - list recent posts */
router.get("/", listPostsController);

/* GET /api/posts/shared/:id - get shared post (public) */
router.get("/shared/:id", async (req, res) => {
  try {
    const post = await postModel
      .findById(req.params.id)
      .populate("user", "username");
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json({ success: true, data: { post } });
  } catch (error) {
    res.status(500).json({ error: "Failed to get shared post" });
  }
});

/* GET /api/posts/stats [protected] - get user statistics */
router.get("/stats", authMiddleware, getUserStatsController);

/* POST /api/posts [protected] */
router.post(
  "/",
  postLimiter,
  authMiddleware,
  upload.single("image"),
  validatePostInput,
  createPostController
);

/* PUT /api/posts/bulk [protected] - bulk update posts */
router.put("/bulk", authMiddleware, bulkUpdatePostsController);

/* PUT /api/posts/:id [protected] - update single post */
router.put("/:id", authMiddleware, updatePostController);

/* DELETE /api/posts [protected] - delete all user posts */
router.delete("/", authMiddleware, deleteAllPostsController);

/* DELETE /api/posts/:id [protected] */
router.delete("/:id", authMiddleware, deletePostController);

module.exports = router;
