import { useState, useEffect } from "react";
import { getUserStats } from "../api/posts";
import LoadingSkeleton from "./LoadingSkeleton";

const CaptionAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getUserStats();
      const stats = response.data;

      // Calculate style performance based on user's posts
      const styleAnalytics = calculateStylePerformance(stats);
      setAnalytics(styleAnalytics);
    } catch (err) {
      setError("Failed to load analytics");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStylePerformance = (stats) => {
    const { posts, styleBreakdown = {} } = stats;

    // Calculate performance metrics for each style
    const stylePerformance = Object.entries(styleBreakdown)
      .map(([style, count]) => {
        const percentage = posts > 0 ? ((count / posts) * 100).toFixed(1) : 0;
        return {
          style,
          count,
          percentage,
          trend: getTrend(style, count), // Simple trend calculation
        };
      })
      .sort((a, b) => b.count - a.count);

    return {
      totalPosts: posts,
      stylePerformance,
      topStyle: stylePerformance[0]?.style || "Fun",
      recommendations: getRecommendations(stylePerformance),
    };
  };

  const getTrend = (style, count) => {
    // Simple trend indicator based on usage
    if (count >= 5) return "trending-up";
    if (count >= 2) return "stable";
    return "trending-down";
  };

  const getRecommendations = (stylePerformance) => {
    const recommendations = [];

    if (stylePerformance.length === 0) {
      return ["Try creating your first post to see analytics!"];
    }

    const topStyle = stylePerformance[0];
    const leastUsed = stylePerformance[stylePerformance.length - 1];

    if (topStyle?.count > 3) {
      recommendations.push(
        `Your "${
          topStyle.style
        }" style is performing well! Consider creating more ${topStyle.style.toLowerCase()} content.`
      );
    }

    if (stylePerformance.length < 6) {
      const unusedStyles = [
        "Fun",
        "Professional",
        "Dramatic",
        "Minimal",
        "Adventurous",
        "Wholesome",
      ].filter((style) => !stylePerformance.find((s) => s.style === style));

      if (unusedStyles.length > 0) {
        recommendations.push(
          `Try experimenting with ${unusedStyles
            .slice(0, 2)
            .join(" or ")} styles for variety.`
        );
      }
    }

    if (leastUsed?.count === 1) {
      recommendations.push(
        `Consider exploring "${leastUsed.style}" style more to diversify your content.`
      );
    }

    return recommendations.length > 0
      ? recommendations
      : ["Keep creating! More data will improve your analytics."];
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "trending-up":
        return (
          <svg
            className="w-4 h-4 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case "stable":
        return (
          <svg
            className="w-4 h-4 text-yellow-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h8"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Caption Analytics
        </h3>
        <LoadingSkeleton type="analytics" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Caption Analytics
        </h3>
        <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Caption Analytics
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {analytics.totalPosts} total posts
        </div>
      </div>

      {/* Style Performance */}
      <div className="space-y-4 mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Style Performance
        </h4>

        {analytics.stylePerformance.length > 0 ? (
          <div className="space-y-3">
            {analytics.stylePerformance.map((style) => (
              <div
                key={style.style}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(style.trend)}
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {style.style}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {style.count} posts ({style.percentage}%)
                  </div>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${style.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            No style data available yet. Create some posts to see analytics!
          </div>
        )}
      </div>

      {/* Top Performing Style */}
      {analytics.topStyle && analytics.stylePerformance.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Top Performing Style
            </h4>
          </div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <span className="font-semibold">{analytics.topStyle}</span> is your
            most-used style with {analytics.stylePerformance[0]?.count} posts (
            {analytics.stylePerformance[0]?.percentage}% of your content).
          </p>
        </div>
      )}

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recommendations
        </h4>
        <div className="space-y-2">
          {analytics.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={fetchAnalytics}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          Refresh Analytics
        </button>
      </div>
    </div>
  );
};

export default CaptionAnalytics;
