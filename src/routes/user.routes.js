const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getUserProfileController,
  updateUserProfileController,
  uploadProfilePictureController,
  deleteProfilePictureController,
  updateUserPreferencesController,
} = require("../controller/user.controller");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit for profile pictures
});

/* GET /api/user/profile [protected] - get user profile */
router.get("/profile", authMiddleware, getUserProfileController);

/* PUT /api/user/profile [protected] - update user profile */
router.put("/profile", authMiddleware, updateUserProfileController);

/* POST /api/user/profile-picture [protected] - upload profile picture */
router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePictureController
);

/* DELETE /api/user/profile-picture [protected] - delete profile picture */
router.delete(
  "/profile-picture",
  authMiddleware,
  deleteProfilePictureController
);

/* PUT /api/user/preferences [protected] - update user preferences */
router.put("/preferences", authMiddleware, updateUserPreferencesController);

module.exports = router;
