/**
 * Debounce utility
 */

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Convert issue severity to color
 */
export const getSeverityColor = (severity) => {
  const colors = {
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-blue-400",
    hint: "text-gray-400",
  };
  return colors[severity] || colors.info;
};

/**
 * Get badge background based on severity
 */
export const getSeverityBadge = (severity) => {
  const badges = {
    error: "bg-red-900/30 text-red-300",
    warning: "bg-yellow-900/30 text-yellow-300",
    info: "bg-blue-900/30 text-blue-300",
    hint: "bg-gray-700/30 text-gray-300",
  };
  return badges[severity] || badges.info;
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Extract owner and repo from GitHub URL
 */
export const parseGitHubURL = (url) => {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)(\.git)?/);
  if (match) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
};
