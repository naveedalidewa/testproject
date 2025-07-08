// Media Service
// This file contains functions to manage media uploads

import { isAPI as useAPI } from "./authService";

// API Configuration Flag
const isApi = useAPI; // Use the same config as other services

// Media upload API endpoint
const MEDIA_UPLOAD_URL = "http://13.60.184.128/Media/uploadMedia";

/**
 * Upload media file to the server
 * @param {File} file - The file to upload
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Promise that resolves to upload response
 */
export const uploadMedia = async (file, token) => {
  try {
    console.log("uploadMedia called with file:", file.name);

    if (isApi) {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("uploadFor", "file");
      formData.append("file", file);

      const response = await fetch(MEDIA_UPLOAD_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("uploadMedia API response:", result);
      return result;
    } else {
      // Return mock success response for development
      console.log("uploadMedia returning mock success for development");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate upload delay

      return {
        status: "successs", // Note: API response has typo "successs"
        data: [
          {
            uploadedLink: `https://pos-empire-bucket.s3.eu-north-1.amazonaws.com/mock/${Date.now()}/${file.name}`,
            name: file.name,
          },
        ],
      };
    }
  } catch (error) {
    console.error("Error uploading media:", error);
    return {
      status: "error",
      message: "Failed to upload media",
      error: error.message,
    };
  }
};
