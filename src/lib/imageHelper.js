/**
 * Helper function to get full image URL from backend path
 * @param {string} imagePath - Image path from backend (e.g., "/uploads/images/filename.jpg")
 * @returns {string} Full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Prepend backend URL - use environment variable or fallback to production URL
  const backendUrl = import.meta.env.VITE_API_BASE_URL || 'https://back.dr-law.site';
  return `${backendUrl}${imagePath}`;
};

/**
 * Helper function to get full video URL from backend path
 * @param {string} videoPath - Video path from backend (e.g., "/uploads/videos/filename.mp4")
 * @returns {string} Full URL to the video
 */
export const getVideoUrl = (videoPath) => {
  if (!videoPath) return null;
  
  // If it's already a full URL, return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath;
  }
  
  // Prepend backend URL - use environment variable or fallback to production URL
  // Try multiple possible backend URLs
  const possibleBackendUrls = [
    import.meta.env.VITE_API_BASE_URL,
    'https://dr-law.developteam.site',
    'https://back.dr-law.site',
    'https://dr-law.site'
  ].filter(Boolean);
  
  // Use the first available URL or fallback
  const backendUrl = possibleBackendUrls[0] || 'https://dr-law.developteam.site';
  
  // Ensure videoPath starts with /
  const normalizedPath = videoPath.startsWith('/') ? videoPath : `/${videoPath}`;
  
  return `${backendUrl}${normalizedPath}`;
};

export default getImageUrl;

