import { useEffect, useState, useCallback } from "react";
import {
  getPosts,
  deletePost,
  deleteAllPosts,
  updatePost,
  bulkUpdatePosts,
} from "../api/posts";
import { useAuth } from "../context/AuthContext";
import { PostGridSkeleton } from "../components/LoadingSkeleton";
import Tooltip from "../components/Tooltip";
import PostShare from "../components/PostShare";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";

const CATEGORIES = [
  "all",
  "Personal",
  "Business",
  "Creative",
  "Social",
  "Marketing",
  "Other",
];

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editedCaption, setEditedCaption] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { user } = useAuth();

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      keys: "escape",
      callback: {
        action: () => {
          if (active) setActive(null);
          if (isSelectionMode) {
            setIsSelectionMode(false);
            setSelectedPosts(new Set());
          }
        },
      },
    },
    {
      keys: "a",
      callback: {
        modifiers: { ctrl: true },
        action: (e) => {
          e.preventDefault();
          if (isSelectionMode) {
            setSelectedPosts(new Set(posts.map((p) => p._id)));
          }
        },
      },
    },
    {
      keys: "s",
      callback: {
        modifiers: { ctrl: true },
        action: (e) => {
          e.preventDefault();
          setIsSelectionMode(!isSelectionMode);
          setSelectedPosts(new Set());
        },
      },
    },
  ]);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory !== "all") params.category = selectedCategory;
      params.sortBy = sortBy;
      params.order = sortOrder;

      const { data } = await getPosts(params);
      const userPosts =
        data.posts?.filter(
          (post) => user && post.user && post.user._id === user._id
        ) || [];
      setPosts(userPosts);
    } catch (e) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, selectedCategory, sortBy, sortOrder]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Delete this post permanently?")) return;
      setDeleting(id);
      const prev = posts;
      setPosts((p) => p.filter((x) => x._id !== id));
      try {
        await deletePost(id);
        if (active && active._id === id) setActive(null);
      } catch (e) {
        setPosts(prev);
        alert("Failed to delete");
      } finally {
        setDeleting(null);
      }
    },
    [posts, active]
  );

  const copyCaption = useCallback(async (caption) => {
    if (!caption) return;
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement("textarea");
      textArea.value = caption;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleDeleteAll = useCallback(async () => {
    if (!posts.length) return;

    const confirmMessage = `Are you sure you want to delete ALL ${posts.length} posts? This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    setDeletingAll(true);
    const prevPosts = posts;
    setPosts([]);

    try {
      await deleteAllPosts();
      setActive(null);
    } catch (err) {
      setPosts(prevPosts);
      alert("Failed to delete all posts. Please try again.");
    } finally {
      setDeletingAll(false);
    }
  }, [posts]);

  const handleUpdateCaption = async () => {
    if (!active || !editedCaption.trim()) return;

    try {
      await updatePost(active._id, { caption: editedCaption.trim() });

      // Update local state
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === active._id
            ? { ...post, caption: editedCaption.trim() }
            : post
        )
      );

      setActive((prev) => ({ ...prev, caption: editedCaption.trim() }));
      setIsEditingCaption(false);
      setEditedCaption("");
    } catch (error) {
      alert("Failed to update caption");
    }
  };

  const handleBulkUpdate = async (updates) => {
    if (selectedPosts.size === 0) return;

    try {
      const postIds = Array.from(selectedPosts);
      await bulkUpdatePosts({ postIds, updates });

      // Reload posts to get updated data
      await loadPosts();
      setSelectedPosts(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      alert("Failed to update posts");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPosts.size === 0) return;

    if (!window.confirm(`Delete ${selectedPosts.size} selected posts?`)) return;

    try {
      const deletePromises = Array.from(selectedPosts).map((id) =>
        deletePost(id)
      );
      await Promise.all(deletePromises);

      setPosts((prevPosts) =>
        prevPosts.filter((post) => !selectedPosts.has(post._id))
      );
      setSelectedPosts(new Set());
      setIsSelectionMode(false);
    } catch (error) {
      alert("Failed to delete selected posts");
    }
  };

  const togglePostSelection = (postId) => {
    setSelectedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const openPostModal = (post) => {
    setActive(post);
    setEditedCaption(post.caption);
  };

  const filteredPosts = posts.filter((post) => {
    if (searchTerm) {
      return (
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.tags &&
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          ))
      );
    }
    return true;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 mx-auto w-full max-w-7xl">
      {/* Header with actions */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              My Captions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your AI generated image captions.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Selection mode toggle */}
            <Tooltip content="Toggle selection mode (Ctrl+S)">
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedPosts(new Set());
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isSelectionMode
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {isSelectionMode ? "Cancel" : "Select"}
              </button>
            </Tooltip>

            {posts.length > 0 && !isSelectionMode && (
              <Tooltip content="Delete all posts">
                <button
                  onClick={handleDeleteAll}
                  disabled={deletingAll}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    className="w-4 h-4"
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
                  <span className="hidden sm:inline">
                    {deletingAll
                      ? "Deleting..."
                      : `Delete All (${posts.length})`}
                  </span>
                  <span className="sm:hidden">
                    {deletingAll ? "Deleting..." : "Delete All"}
                  </span>
                </button>
              </Tooltip>
            )}
          </div>
        </div>

        {/* Filters and bulk actions */}
        <div className="mb-6 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search captions and tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>

              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="caption-asc">Caption A-Z</option>
                <option value="caption-desc">Caption Z-A</option>
              </select>
            </div>
          </div>

          {/* Bulk actions */}
          {isSelectionMode && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-sm text-blue-700 dark:text-blue-300">
                {selectedPosts.size} post{selectedPosts.size !== 1 ? "s" : ""}{" "}
                selected
              </span>

              {selectedPosts.size > 0 && (
                <div className="flex gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value === "delete") {
                        handleBulkDelete();
                      } else {
                        const category = e.target.value;
                        handleBulkUpdate({ category });
                      }
                      e.target.value = "";
                    }}
                    className="px-3 py-2 text-sm border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="delete">Delete Selected</option>
                    <optgroup label="Change Category">
                      {CATEGORIES.slice(1).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  <button
                    onClick={() =>
                      setSelectedPosts(new Set(posts.map((p) => p._id)))
                    }
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800"
                  >
                    Select All
                  </button>

                  <button
                    onClick={() => setSelectedPosts(new Set())}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline px-3 py-2 border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-gray-800"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && <PostGridSkeleton />}

        {/* Error state */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        {/* Empty state */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || selectedCategory !== "all"
                ? "No matching captions"
                : "No captions yet"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "You haven't created any captions yet. Start by uploading your first image!"}
            </p>
            {!searchTerm && selectedCategory === "all" && (
              <a
                href="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Create Your First Caption
              </a>
            )}
          </div>
        )}

        {/* Posts grid */}
        <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPosts.map((p) => (
            <li
              key={p._id}
              className={`group relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow border transition-all ${
                isSelectionMode
                  ? selectedPosts.has(p._id)
                    ? "border-blue-500 ring-2 ring-blue-500"
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                  : "border-gray-200 dark:border-gray-700 hover:shadow-lg"
              }`}
            >
              {isSelectionMode && (
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    checked={selectedPosts.has(p._id)}
                    onChange={() => togglePostSelection(p._id)}
                    className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 shadow-md"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  isSelectionMode
                    ? togglePostSelection(p._id)
                    : openPostModal(p)
                }
                className="block w-full text-left focus:outline-none"
              >
                <img
                  src={p.image}
                  alt={p.caption.slice(0, 60)}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <p className="text-xs text-white p-3 line-clamp-3 w-full font-medium">
                    {p.caption}
                  </p>
                </div>
              </button>

              {/* Category badge */}
              {p.category && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-800">
                    {p.category}
                  </span>
                </div>
              )}

              {!isSelectionMode &&
                user &&
                p.user &&
                user._id === p.user._id && (
                  <Tooltip content="Delete post">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(p._id);
                      }}
                      disabled={deleting === p._id}
                      className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wide bg-white/90 hover:bg-white text-red-600 font-semibold px-2 py-1 rounded shadow disabled:opacity-50 transition-colors"
                    >
                      {deleting === p._id ? "..." : "Delete"}
                    </button>
                  </Tooltip>
                )}
            </li>
          ))}
        </ul>

        {/* Post detail modal */}
        {active && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
            onClick={() => setActive(null)}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActive(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm z-10"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <img
                src={active.image}
                alt="full"
                className="w-full object-contain max-h-[60vh] bg-gray-50 dark:bg-gray-900"
              />

              <div className="p-5 space-y-4">
                {/* Caption editing */}
                <div className="space-y-2">
                  {isEditingCaption ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                        rows="3"
                        placeholder="Enter caption..."
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateCaption}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingCaption(false);
                            setEditedCaption(active.caption);
                          }}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap flex-1 text-gray-900 dark:text-white">
                        {active.caption}
                      </p>
                      <div className="flex gap-1">
                        <PostShare post={active} />

                        <Tooltip content="Edit caption">
                          <button
                            type="button"
                            onClick={() => setIsEditingCaption(true)}
                            className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                        </Tooltip>

                        <Tooltip content="Copy caption">
                          <button
                            type="button"
                            onClick={() => copyCaption(active.caption)}
                            className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                          >
                            {copied ? (
                              <>
                                <svg
                                  className="h-3 w-3 text-green-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <span className="text-green-600">Copied</span>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                  />
                                </svg>
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  )}
                </div>

                {/* Post metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-600 pt-3">
                  <div className="flex items-center gap-4">
                    {active.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {active.category}
                      </span>
                    )}
                    {active.vibeStyle && <span>Style: {active.vibeStyle}</span>}
                  </div>

                  {active.user && <span>by {active.user.username}</span>}
                </div>

                {/* Tags */}
                {active.tags && active.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {active.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Delete button */}
                {user && active.user && user._id === active.user._id && (
                  <div className="border-t dark:border-gray-600 pt-3">
                    <button
                      onClick={() => handleDelete(active._id)}
                      disabled={deleting === active._id}
                      className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800 px-3 py-1 rounded disabled:opacity-50 transition-colors"
                    >
                      {deleting === active._id ? "Deleting..." : "Delete Post"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
