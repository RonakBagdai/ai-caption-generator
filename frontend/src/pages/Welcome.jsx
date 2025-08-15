import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
  const { user } = useAuth();

  if (user) {
    // If user is already logged in, show a redirect message
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Welcome back, {user.username}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            You're already logged in. Ready to create amazing captions?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to="/feed" className="touch-button-primary w-full sm:w-auto">
              📱 View My Posts
            </Link>
            <Link
              to="/create"
              className="touch-button-secondary w-full sm:w-auto"
            >
              ✨ Create New Post
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container-padding py-8 sm:py-12 lg:py-16 mx-auto max-w-7xl">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
            AI Caption Generator
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your images into engaging captions with the power of AI.
            Choose your vibe and let our intelligent system create perfect
            captions for your photos.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12">
            <Link
              to="/register"
              className="w-full sm:w-auto touch-button-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚀 Get Started Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto touch-button-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-md hover:shadow-lg"
            >
              🔑 Sign In
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
          <div className="mobile-card text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400"
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
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🤖 Smart Image Analysis
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Our AI analyzes your images to understand content, colors, and
              context for perfect captions.
            </p>
          </div>

          <div className="mobile-card text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              🎨 Multiple Vibes
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Choose from Fun, Professional, Dramatic, Minimal, Adventurous, or
              Wholesome styles.
            </p>
          </div>

          <div className="mobile-card text-center p-4 sm:p-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              ⚡ Instant Results
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Get perfect captions in seconds with our optimized AI processing
              and smart caching.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 sm:mt-20 text-center">
          <h2 className="responsive-heading font-bold text-gray-900 dark:text-gray-100 mb-8 sm:mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                1
              </div>
              <h3 className="text-base sm:text-lg font-semibold dark:text-gray-100 mb-2">
                📤 Upload Your Image
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Choose any image from your device and upload it to our platform.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                2
              </div>
              <h3 className="text-base sm:text-lg font-semibold dark:text-gray-100 mb-2">
                🎯 Select Your Vibe
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Pick the tone and style that matches your content and audience.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-3 sm:mb-4">
                3
              </div>
              <h3 className="text-base sm:text-lg font-semibold dark:text-gray-100 mb-2">
                ✨ Get Your Caption
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Receive a perfectly crafted caption with relevant hashtags
                instantly.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center mobile-card p-6 sm:p-8 lg:p-12 shadow-xl">
          <h2 className="responsive-heading font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Ready to Create Amazing Captions?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8">
            Join thousands of users who trust our AI to make their content
            shine.
          </p>
          <Link
            to="/register"
            className="touch-button-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
          >
            🎉 Start Creating Now
          </Link>
        </div>
      </div>
    </div>
  );
}
