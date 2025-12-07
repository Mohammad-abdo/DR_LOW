/**
 * Helper function to extract data from API response
 * Handles different response structures:
 * - response.data (array)
 * - response.data.data (object with data array and pagination)
 * - response.data.data.data (nested structure)
 * - response.data.data.categories, response.data.data.courses, etc.
 */
export function extractDataFromResponse(response) {
  if (!response || !response.data) {
    return {};
  }

  // If response.data is already an array, return it
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // If response.data has a success property and data property
  if (response.data.success && response.data.data) {
    const dataObj = response.data.data;
    
    // If data.data is an array, return it
    if (Array.isArray(dataObj)) {
      return dataObj;
    }
    
    // If data.data is an object, return it (contains categories, courses, etc.)
    if (typeof dataObj === 'object' && dataObj !== null) {
      return dataObj;
    }
  }

  // If response.data has a data property directly
  if (response.data.data) {
    // If data.data is an array, return it
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    // If data.data is an object, return it
    if (typeof response.data.data === 'object' && response.data.data !== null) {
      return response.data.data;
    }
    
    // Handle nested structure: response.data.data.data
    if (response.data.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
  }

  // Fallback: return the entire response.data
  return response.data;
}




