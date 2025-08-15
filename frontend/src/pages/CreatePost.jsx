import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import { compressImage, validateImageFile } from "../utils/helpers";
import { useToast } from "../components/Toast";
import Tooltip from "../components/Tooltip";
import performanceTracker from "../utils/performanceTracker";

const CATEGORIES = [
  "Personal",
  "Business",
  "Creative",
  "Social",
  "Marketing",
  "Other",
];
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [vibe, setVibe] = useState("Fun");
  const [language, setLanguage] = useState("en");
  const [extraPrompt, setExtraPrompt] = useState("");

  // Track page view
  useEffect(() => {
    performanceTracker.trackPageView("/create");
  }, []);
  const [category, setCategory] = useState("Personal");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const MAX_MB = 4;
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Function to handle saving/viewing the created post
  const savePost = () => {
    navigate("/feed");
    toast({
      title: "Post saved successfully!",
      description: "Your post has been created and is now visible in the feed.",
      variant: "default",
    });
  };

  const onSelectFile = useCallback(
    async (f) => {
      try {
        setProgress("Processing image...");
        validateImageFile(f, MAX_MB);

        // Show immediate feedback
        setProgress("Compressing image...");
        const compressed = await compressImage(f);

        setFile(compressed);
        setPreview(URL.createObjectURL(compressed));
        setResult(null);
        setError("");
        setProgress("");

        // Calculate compression ratio for user feedback
        const savedKB = Math.round((f.size - compressed.size) / 1024);
        if (savedKB > 0) {
          toast.success(`Image optimized! Saved ${savedKB}KB`);
        } else {
          toast.success("Image ready for caption generation!");
        }
      } catch (err) {
        setError(err.message);
        setProgress("");
        toast.error(err.message);
      }
    },
    [toast]
  );

  const copyCaption = useCallback(async () => {
    if (!result?.caption) return;
    try {
      await navigator.clipboard.writeText(result.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Caption copied to clipboard!");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = result.caption;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Caption copied to clipboard!");
    }
  }, [result?.caption, toast]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file || loading) return;

    setError("");
    setLoading(true);
    setResult(null);
    setProgress("Analyzing image with AI...");

    // Track caption generation start
    performanceTracker.trackCaptionGeneration({
      vibe,
      language,
      category,
      hasExtraPrompt: !!extraPrompt.trim(),
      hasTags: !!tags.trim(),
      isPublic,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("vibe", vibe);
      fd.append("language", language);
      fd.append("category", category);
      fd.append("isPublic", isPublic);
      if (extraPrompt.trim()) fd.append("extraPrompt", extraPrompt.trim());
      if (tags.trim()) {
        // Split tags by comma and clean them
        const tagArray = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        tagArray.forEach((tag) => fd.append("tags", tag));
      }

      // Add progress updates
      setProgress("Generating creative caption...");

      const startTime = Date.now();
      const { data } = await createPost(fd);
      const endTime = Date.now();

      setResult(data.post);
      setProgress("");

      const duration = ((endTime - startTime) / 1000).toFixed(1);

      // Track successful completion
      performanceTracker.completeCaptionGeneration(true, {
        duration: endTime - startTime,
        captionLength: data.post.caption.length,
        resultId: data.post._id,
      });

      toast.success(`Caption generated in ${duration}s! 🎉`);
    } catch (err) {
      const message = err.response?.data?.message || "Upload failed";
      setError(message);
      setProgress("");

      // Track failed completion
      performanceTracker.completeCaptionGeneration(false, {
        error: message,
        errorCode: err.response?.status,
      });

      performanceTracker.trackError(new Error(message), "caption_generation");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  function handleFileInput(e) {
    const f = e.target.files?.[0];
    if (f) onSelectFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) onSelectFile(f);
  }

  const handleTagInput = (e) => {
    const value = e.target.value;
    // Only allow letters, numbers, spaces, and commas
    const sanitized = value.replace(/[^a-zA-Z0-9\s,]/g, "");
    setTags(sanitized);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 sm:py-12">
      <header className="mb-8 sm:mb-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
          Image Caption Generator
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-4">
          Use AI to generate captions for any images with custom categories and
          tags.
        </p>
      </header>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Step 1 */}
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400 mb-3">
            1. UPLOAD AN IMAGE OR PHOTO (MAX {MAX_MB}MB)
          </h2>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 sm:px-6 py-8 sm:py-14 text-center hover:border-gray-400 dark:hover:border-gray-500 transition cursor-pointer"
            onClick={() => document.getElementById("file-input").click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="preview"
                className="max-h-48 sm:max-h-72 w-auto rounded-md object-contain"
              />
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <div className="mx-auto h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 7.5m0 0L7.5 12M12 7.5V18"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Tap to Upload
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    PNG, JPG up to {MAX_MB}MB
                  </p>
                </div>
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
          {file && !loading && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
                document.getElementById("file-input").value = "";
              }}
              className="mt-3 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Remove image
            </button>
          )}
        </section>

        {/* Step 2 */}
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400 mb-3">
            2. SELECT A VIBE
          </h2>
          <select
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {[
              "Fun",
              "Professional",
              "Dramatic",
              "Minimal",
              "Adventurous",
              "Wholesome",
            ].map((v) => (
              <option key={v} value={v}>
                {v === "Fun"
                  ? "😄 Fun"
                  : v === "Professional"
                  ? "💼 Professional"
                  : v === "Dramatic"
                  ? "🎭 Dramatic"
                  : v === "Minimal"
                  ? "✨ Minimal"
                  : v === "Adventurous"
                  ? "🧭 Adventurous"
                  : "💖 Wholesome"}
              </option>
            ))}
          </select>
        </section>

        {/* Step 3 - Language */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400">
              3. LANGUAGE
            </h2>
            <Tooltip content="Choose the language for your caption">
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Tooltip>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </section>

        {/* Step 4 */}
        <section>
          <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400 mb-3">
            4. ADDITIONAL PROMPT (OPTIONAL)
          </h2>
          <input
            value={extraPrompt}
            onChange={(e) => setExtraPrompt(e.target.value)}
            placeholder="eg. sunset over the city skyline"
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </section>

        {/* Step 5 - Categories and Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400">
                5. CATEGORY
              </h2>
              <Tooltip content="Choose a category to organize your posts">
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Tooltip>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400">
                6. TAGS (OPTIONAL)
              </h2>
              <Tooltip content="Add tags separated by commas (e.g., nature, sunset, peaceful)">
                <svg
                  className="w-3 h-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </Tooltip>
            </div>
            <input
              value={tags}
              onChange={handleTagInput}
              placeholder="nature, sunset, peaceful"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <p className="text-[10px] text-gray-400 mt-2">
              Separate tags with commas
            </p>
          </section>
        </div>

        {/* Step 7 - Privacy */}
        <section className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="isPublic"
              className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>Make this post public</span>
                <Tooltip content="Public posts can be featured in the gallery (future feature)">
                  <svg
                    className="w-3 h-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                When enabled, your posts may be featured in the public gallery
              </p>
            </label>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={!file || loading}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-medium tracking-wide py-4 disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {loading ? "Generating..." : "✨ Generate Caption"}
          </button>
          {progress && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
                {progress}
              </p>
            </div>
          )}
        </div>

        <section className="min-h-[140px] rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm">
          <h2 className="text-[11px] font-semibold tracking-wider text-gray-600 dark:text-gray-400 mb-3">
            RESULT
          </h2>
          {!result && !loading && (
            <p className="text-xs text-gray-400">
              Your caption will appear here after generation.
            </p>
          )}
          {loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400/30 border-t-gray-600" />
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {progress || "Processing..."}
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div
                  className="bg-gray-600 dark:bg-gray-400 h-1 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm leading-relaxed font-medium text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {result.caption}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={copyCaption}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {copied ? (
                    <>
                      <svg
                        className="h-4 w-4 text-green-600"
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
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
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

                <button
                  type="button"
                  onClick={savePost}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Post
                </button>
              </div>

              {/* Show metadata */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  📁 {result.category}
                </span>
                {result.vibeStyle && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    🎨 {result.vibeStyle}
                  </span>
                )}
                {result.tags &&
                  result.tags.length > 0 &&
                  result.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    >
                      #{tag}
                    </span>
                  ))}
              </div>

              {result.image && (
                <div className="mt-4">
                  <img
                    src={result.image}
                    alt="Generated post preview"
                    className="w-full max-h-64 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/feed")}
                  className="flex-1 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  📱 View My Posts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setFile(null);
                    setPreview(null);
                    setVibe("Fun");
                    setExtraPrompt("");
                    setCategory("Personal");
                    setTags("");
                    setIsPublic(false);
                    document.getElementById("file-input").value = "";
                  }}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  🔄 Create Another
                </button>
              </div>
            </div>
          )}
        </section>
      </form>
    </div>
  );
}
