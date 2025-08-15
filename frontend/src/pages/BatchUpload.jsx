import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import { compressImage, validateImageFile } from "../utils/helpers";
import { useToast } from "../components/Toast";
import Tooltip from "../components/Tooltip";
import LoadingSkeleton from "../components/LoadingSkeleton";
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

export default function BatchUpload() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  const [vibe, setVibe] = useState("Fun");
  const [language, setLanguage] = useState("en");

  // Track page view
  useEffect(() => {
    performanceTracker.trackPageView("/batch");
  }, []);
  const [extraPrompt, setExtraPrompt] = useState("");
  const [category, setCategory] = useState("Personal");
  const [tags, setTags] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [errors, setErrors] = useState([]);
  const [processingStatus, setProcessingStatus] = useState([]);
  const { toast } = useToast();

  const MAX_MB = 4;
  const MAX_FILES = 10;

  const onSelectFiles = useCallback(
    async (selectedFiles) => {
      const fileArray = Array.from(selectedFiles);

      if (fileArray.length > MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed`);
        return;
      }

      try {
        setProgress("Processing images...");
        const newFiles = [];
        const newPreviews = [];
        const newErrors = [];
        const newStatus = [];

        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          newStatus[i] = "processing";

          try {
            validateImageFile(file, MAX_MB);
            const compressed = await compressImage(file);

            newFiles.push(compressed);
            newPreviews.push(URL.createObjectURL(compressed));
            newErrors.push(null);
            newStatus[i] = "ready";
          } catch (err) {
            newFiles.push(null);
            newPreviews.push(null);
            newErrors.push(err.message);
            newStatus[i] = "error";
          }
        }

        setFiles(newFiles);
        setPreviews(newPreviews);
        setErrors(newErrors);
        setProcessingStatus(newStatus);
        setResults([]);
        setProgress("");

        const validFiles = newFiles.filter((f) => f !== null).length;
        toast.success(
          `${validFiles} of ${fileArray.length} images ready for processing`
        );
      } catch (err) {
        toast.error(err.message);
        setProgress("");
      }
    },
    [toast]
  );

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    const newErrors = [...errors];
    const newStatus = [...processingStatus];

    // Revoke the object URL to prevent memory leaks
    if (newPreviews[index]) {
      URL.revokeObjectURL(newPreviews[index]);
    }

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newErrors.splice(index, 1);
    newStatus.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
    setErrors(newErrors);
    setProcessingStatus(newStatus);

    // Also remove results if any
    const newResults = [...results];
    if (newResults[index]) {
      newResults.splice(index, 1);
      setResults(newResults);
    }
  };

  const generateCaptions = async () => {
    if (files.filter((f) => f !== null).length === 0) {
      toast.error("Please select at least one valid image");
      return;
    }

    const validFiles = files.filter((f) => f !== null);

    // Track batch upload start
    performanceTracker.trackBatchUpload(validFiles.length);

    setLoading(true);
    setProgress("Generating captions...");

    const newResults = [];
    const newStatus = [...processingStatus];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file) {
          newResults[i] = null;
          continue;
        }

        newStatus[i] = "generating";
        setProcessingStatus([...newStatus]);
        setProgress(
          `Generating caption ${i + 1} of ${files.filter((f) => f).length}...`
        );

        try {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("vibe", vibe);
          formData.append("language", language);
          if (extraPrompt.trim()) {
            formData.append("extraPrompt", extraPrompt.trim());
          }
          formData.append("category", category);
          formData.append("tags", tags);
          formData.append("isPublic", isPublic);

          const response = await createPost(formData);
          newResults[i] = { ...response.data, success: true };
          newStatus[i] = "completed";

          // Brief delay to show progress
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Error generating caption for image ${i + 1}:`, err);
          newResults[i] = {
            error: err.response?.data?.message || "Caption generation failed",
            success: false,
          };
          newStatus[i] = "error";
        }

        setResults([...newResults]);
        setProcessingStatus([...newStatus]);
      }

      const successCount = newResults.filter((r) => r && r.success).length;
      const errorCount = newResults.filter(
        (r) => r && !r.success && r.error
      ).length;

      // Track batch upload completion
      performanceTracker.completeBatchUpload(
        newResults.filter((r) => r !== null)
      );

      if (successCount > 0) {
        toast.success(`Successfully generated ${successCount} captions!`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} captions failed to generate`);
      }
    } catch (err) {
      console.error("Batch processing error:", err);
      performanceTracker.trackError(err, "batch_upload");
      toast.error("Failed to process batch upload");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const copyAllCaptions = () => {
    const allCaptions = results
      .filter((r) => r && !r.error && r.caption)
      .map((r, i) => `Image ${i + 1}: ${r.caption}`)
      .join("\n\n");

    if (allCaptions) {
      navigator.clipboard.writeText(allCaptions);
      toast.success("All captions copied to clipboard!");
    }
  };

  const downloadResults = () => {
    const data = results
      .map((result, i) => ({
        imageIndex: i + 1,
        fileName: files[i]?.name || `image_${i + 1}`,
        caption: result?.caption || "Failed to generate",
        vibe,
        language,
        category,
        tags,
        isPublic,
        timestamp: new Date().toISOString(),
      }))
      .filter((item) => item.caption !== "Failed to generate");

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch_captions_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Results downloaded successfully!");
  };

  return (
    <div className="container-padding space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="responsive-heading font-bold text-gray-900 dark:text-gray-100 mb-2">
          📸 Batch Caption Generator
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Upload multiple images and generate captions for all of them at once
        </p>
      </div>

      {/* Upload Section */}
      <div className="mobile-card p-4 sm:p-6">
        <h2 className="responsive-subheading font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📤 Upload Images
        </h2>

        <div className="mb-6">
          <label className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors touch-target">
            <div className="flex flex-col items-center justify-center pt-4 pb-4 sm:pt-5 sm:pb-6">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="font-semibold">📱 Tap to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                PNG, JPG, JPEG (MAX. {MAX_MB}MB each, up to {MAX_FILES} files)
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => onSelectFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🎨 Vibe Style
            </label>
            <select
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
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
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🌍 Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📁 Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center space-x-2 touch-target">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                🌐 Public posts
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💡 Additional Context (Optional)
            </label>
            <textarea
              value={extraPrompt}
              onChange={(e) => setExtraPrompt(e.target.value)}
              placeholder="Add specific details about the images or desired caption style..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🏷️ Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="photography, nature, sunset..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-target"
            />
          </div>
        </div>
      </div>

      {/* Progress */}
      {progress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
              {progress}
            </span>
          </div>
        </div>
      )}

      {/* Images Grid */}
      {files.length > 0 && (
        <div className="mobile-card p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="responsive-subheading font-semibold text-gray-900 dark:text-gray-100">
              📷 Images ({files.filter((f) => f).length})
            </h2>
            <button
              onClick={generateCaptions}
              disabled={loading || files.filter((f) => f).length === 0}
              className="touch-button-primary w-full sm:w-auto py-3 px-6 font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </span>
              ) : (
                "✨ Generate All Captions"
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {files.map((file, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                {file && previews[index] ? (
                  <div className="relative">
                    <img
                      src={previews[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 sm:h-48 object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold touch-target"
                    >
                      ×
                    </button>

                    {/* Status indicator */}
                    <div className="absolute top-2 left-2">
                      {processingStatus[index] === "processing" && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          Processing
                        </div>
                      )}
                      {processingStatus[index] === "ready" && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                          Ready
                        </div>
                      )}
                      {processingStatus[index] === "generating" && (
                        <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                          <span>Generating</span>
                        </div>
                      )}
                      {processingStatus[index] === "completed" && (
                        <div className="bg-green-600 text-white px-2 py-1 rounded text-xs">
                          ✓ Done
                        </div>
                      )}
                      {processingStatus[index] === "error" && (
                        <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Error
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 sm:h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-red-500 text-sm">
                      Error loading image
                    </span>
                  </div>
                )}

                <div className="p-3 sm:p-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">
                    Image {index + 1}
                  </h3>

                  {errors[index] && (
                    <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm mb-2">
                      {errors[index]}
                    </div>
                  )}

                  {results[index] && !results[index].error && (
                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                          {results[index].caption}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(results[index].caption);
                          toast.success(`Caption ${index + 1} copied!`);
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs sm:text-sm touch-target"
                      >
                        📋 Copy Caption
                      </button>
                    </div>
                  )}

                  {results[index] && results[index].error && (
                    <div className="text-red-600 dark:text-red-400 text-xs sm:text-sm">
                      {results[index].error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Actions */}
      {results.length > 0 && results.some((r) => r && !r.error) && (
        <div className="mobile-card p-4 sm:p-6">
          <h2 className="responsive-subheading font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📊 Batch Results
          </h2>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <button
              onClick={copyAllCaptions}
              className="touch-button-primary w-full sm:w-auto py-3 px-4"
            >
              <span className="flex items-center justify-center gap-2">
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
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                📋 Copy All Captions
              </span>
            </button>

            <button
              onClick={downloadResults}
              className="touch-button-secondary w-full sm:w-auto py-3 px-4 bg-green-600 hover:bg-green-700 border-green-600"
            >
              <span className="flex items-center justify-center gap-2">
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                💾 Download Results
              </span>
            </button>

            <button
              onClick={() => navigate("/feed")}
              className="touch-button-secondary w-full sm:w-auto py-3 px-4 bg-gray-600 hover:bg-gray-700 border-gray-600"
            >
              📱 View All Posts
            </button>
          </div>

          <div className="mt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            ✅ {results.filter((r) => r && !r.error).length} of {results.length}{" "}
            captions generated successfully
          </div>
        </div>
      )}
    </div>
  );
}
