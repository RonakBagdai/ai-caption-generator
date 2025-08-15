import { useState, useEffect } from "react";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  deleteProfilePicture,
  updateUserPreferences,
} from "../api/user";
import { getUserStats } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  ProfileSkeleton,
  StatsSkeleton,
  TimelineSkeleton,
} from "../components/LoadingSkeleton";
import { useToast } from "../components/Toast";
import Tooltip from "../components/Tooltip";
import CaptionAnalytics from "../components/CaptionAnalytics";
import PerformanceDashboard from "../components/PerformanceDashboard";

const UserProfile = () => {
  const { user: authUser, setUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [user, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    theme: "system",
    defaultCategory: "Personal",
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [profileResponse, statsResponse] = await Promise.all([
        getUserProfile(),
        getUserStats(),
      ]);

      setUserData(profileResponse.data.user);
      setStats(statsResponse.data);
      setFormData({
        username: profileResponse.data.user.username,
        theme: profileResponse.data.user.preferences?.theme || "system",
        defaultCategory:
          profileResponse.data.user.preferences?.defaultCategory || "Personal",
      });
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB limit
      toast.error("Image must be less than 2MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await uploadProfilePicture(formData);
      setUserData(response.data.user);
      setUser(response.data.user);
      toast.success("Profile picture updated successfully!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (
      !window.confirm("Are you sure you want to delete your profile picture?")
    )
      return;

    try {
      const response = await deleteProfilePicture();
      setUserData(response.data.user);
      setUser(response.data.user);
      toast.success("Profile picture deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete profile picture");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      // Update profile
      const profileResponse = await updateUserProfile({
        username: formData.username,
      });

      // Update preferences
      const preferencesResponse = await updateUserPreferences({
        theme: formData.theme,
        defaultCategory: formData.defaultCategory,
      });

      setUserData(preferencesResponse.data.user);
      setUser(preferencesResponse.data.user);
      setTheme(formData.theme);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container-padding space-y-6 sm:space-y-8">
        <ProfileSkeleton />
        <StatsSkeleton />
        <TimelineSkeleton />
      </div>
    );
  }

  return (
    <div className="container-padding space-y-6 sm:space-y-8">
      {/* Profile Header */}
      <div className="mobile-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>

            {/* Upload/Delete buttons */}
            <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 flex gap-1">
              <Tooltip content="Upload profile picture">
                <label className="touch-icon-button w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 hover:bg-blue-700 text-white">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </Tooltip>

              {user.profilePicture && (
                <Tooltip content="Delete profile picture">
                  <button
                    onClick={handleDeleteProfilePicture}
                    className="touch-icon-button w-7 h-7 sm:w-8 sm:h-8 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </Tooltip>
              )}
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Theme Preference
                    </label>
                    <select
                      value={formData.theme}
                      onChange={(e) =>
                        setFormData({ ...formData, theme: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">☀️ Light</option>
                      <option value="dark">🌙 Dark</option>
                      <option value="system">💻 System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Category
                    </label>
                    <select
                      value={formData.defaultCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          defaultCategory: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Personal">Personal</option>
                      <option value="Business">Business</option>
                      <option value="Creative">Creative</option>
                      <option value="Social">Social</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="submit"
                    className="touch-button-primary w-full sm:w-auto"
                  >
                    💾 Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="touch-button-secondary w-full sm:w-auto"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {user.username}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline touch-target"
                  >
                    ✏️ Edit Profile
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    📅 Joined{" "}
                    {formatDate(user.stats?.joinedAt || user.createdAt)}
                  </span>
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    🎨 Theme: {user.preferences?.theme || "system"}
                  </span>
                  <span className="flex items-center justify-center sm:justify-start gap-1">
                    📁 Default:{" "}
                    {user.preferences?.defaultCategory || "Personal"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Total Posts */}
          <div className="mobile-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Posts
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.userStats?.totalPosts || 0}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Categories Used */}
          <div className="mobile-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Categories
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalCategories}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Styles Used */}
          <div className="mobile-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Styles
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.totalStyles}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Avg Posts/Month */}
          <div className="mobile-card p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left mb-2 sm:mb-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                  Avg/Month
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.avgPostsPerMonth}
                </p>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
                <svg
                  className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caption Analytics */}
      <CaptionAnalytics />

      {/* Performance Dashboard */}
      <div className="mobile-card p-4 sm:p-6">
        <PerformanceDashboard />
      </div>

      {/* Authentication Info */}
      <div className="mobile-card p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔐 Authentication
        </h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            Token-Based Security
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Your login session expires automatically after 1 hour</li>
            <li>• No complex session management or tracking</li>
            <li>• Simply log in again when your session expires</li>
            <li>• Your work is always saved and won't be lost</li>
            <li>• Enhanced security with automatic logout</li>
          </ul>
        </div>
      </div>

      {/* Category and Style Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <div className="mobile-card p-4 sm:p-6">
            <h3 className="responsive-subheading font-semibold text-gray-900 dark:text-white mb-4">
              📊 Posts by Category
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.categoryBreakdown || {}).map(
                ([category, count]) => {
                  const percentage =
                    stats.userStats?.totalPosts > 0
                      ? Math.round((count / stats.userStats.totalPosts) * 100)
                      : 0;

                  return (
                    <div
                      key={category}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-6 sm:w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Style Breakdown */}
          <div className="mobile-card p-4 sm:p-6">
            <h3 className="responsive-subheading font-semibold text-gray-900 dark:text-white mb-4">
              🎨 Posts by Style
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.styleBreakdown || {}).map(
                ([style, count]) => {
                  const percentage =
                    stats.userStats?.totalPosts > 0
                      ? Math.round((count / stats.userStats.totalPosts) * 100)
                      : 0;

                  return (
                    <div
                      key={style}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-3 h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {style}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-12 sm:w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-6 sm:w-8 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Activity */}
      {stats &&
        stats.monthlyActivity &&
        Object.keys(stats.monthlyActivity).length > 0 && (
          <div className="mobile-card p-4 sm:p-6">
            <h3 className="responsive-subheading font-semibold text-gray-900 dark:text-white mb-4">
              📅 Monthly Activity
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {Object.entries(stats.monthlyActivity)
                .sort(
                  ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
                )
                .slice(0, 6)
                .map(([month, count]) => {
                  const monthName = new Date(month + "-01").toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      year: "2-digit",
                    }
                  );

                  return (
                    <div
                      key={month}
                      className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        {count}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {monthName}
                      </p>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
    </div>
  );
};

export default UserProfile;
