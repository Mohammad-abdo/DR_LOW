import { useEffect, useRef, useState } from "react";
import Dropzone from "dropzone";
import "dropzone/dist/dropzone.css";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";

export default function DropzoneVideoUpload({ onUploadComplete, onUploadError, courseId, contentId }) {
  const { language } = useLanguage();
  const dropzoneRef = useRef(null);
  const dropzoneInstanceRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({}); // 'uploading', 'success', 'error'

  // Function to refresh auth token
  const refreshAuthToken = async () => {
    try {
      const currentToken = localStorage.getItem("auth_token") || localStorage.getItem("token");
      if (!currentToken) return null;

      const response = await api.post('/auth/refresh-token', {}, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });

      if (response.data.success && response.data.token) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("token", response.data.token);
        console.log("✅ Token refreshed successfully");
        return response.data.token;
      }
      return null;
    } catch (error) {
      console.error("❌ Token refresh failed:", error);
      return null;
    }
  };

  // Update dropzone headers with new token
  const updateDropzoneToken = (newToken) => {
    if (dropzoneInstanceRef.current && newToken) {
      dropzoneInstanceRef.current.options.headers = {
        ...dropzoneInstanceRef.current.options.headers,
        Authorization: `Bearer ${newToken}`
      };
      console.log("🔄 Dropzone token updated");
    }
  };

  useEffect(() => {
    if (!dropzoneRef.current) return;

    const baseUrl = api?.defaults?.baseURL || (import.meta.env.VITE_API_URL || 'https://dr-law.developteam.site/api');
    const authToken = localStorage.getItem("auth_token") || localStorage.getItem("token");

    // Initialize Dropzone
    const dropzone = new Dropzone(dropzoneRef.current, {
      url: `${baseUrl}/admin/upload/video-chunk`,
      method: "post",
      paramName: "chunk",
      chunking: true,
      // Bigger chunks => fewer HTTP requests => faster uploads for small/medium videos
      // Keep under backend safety limit (50MB per chunk)
      chunkSize: 50 * 1024 * 1024, // 50MB chunks
      retryChunks: true,
      retryChunksLimit: 5, // Increased from 3 to 5
      // Parallel chunk uploads can overload some hosts/proxies and trigger throttling.
      // Sequential uploads are typically more stable (especially behind reverse proxies).
      parallelChunkUploads: false,
      maxFilesize: 10 * 1024 * 1024 * 1024, // 10GB max (in KB: 10,485,760)
      acceptedFiles: "video/*",
      addRemoveLinks: false,
      autoProcessQueue: true,
      timeout: 0, // No timeout for large uploads
      maxFiles: 1,
      dictDefaultMessage: language === "ar" 
        ? "اسحب الفيديو هنا أو اضغط للاختيار" 
        : "Drop video here or click to select",
      dictFallbackMessage: language === "ar"
        ? "المتصفح الخاص بك لا يدعم رفع الملفات بالسحب والإفلات"
        : "Your browser does not support drag'n'drop file uploads",
      dictInvalidFileType: language === "ar"
        ? "نوع الملف غير مدعوم. يرجى اختيار ملف فيديو"
        : "Invalid file type. Please select a video file",
      dictFileTooBig: language === "ar"
        ? "الملف كبير جداً ({{filesize}}MB). الحد الأقصى: {{maxFilesize}}MB"
        : "File is too big ({{filesize}}MB). Max filesize: {{maxFilesize}}MB",
      dictResponseError: language === "ar"
        ? "حدث خطأ أثناء الرفع"
        : "An error occurred while uploading",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      params: {
        courseId: courseId || "",
        contentId: contentId || "",
      },
    });

    // Event handlers
    dropzone.on("addedfile", (file) => {
      console.log("📹 File added:", file.name, "Size:", (file.size / 1024 / 1024).toFixed(2), "MB");
      setUploadStatus({ [file.name]: "uploading" });
      setUploadProgress({ [file.name]: 0 });
      
      // Remove any previously added files
      if (dropzone.files.length > 1) {
        dropzone.removeFile(dropzone.files[0]);
      }

      // Start token refresh interval (refresh every 45 minutes)
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      tokenRefreshIntervalRef.current = setInterval(async () => {
        console.log("🔄 Auto-refreshing token during upload...");
        const newToken = await refreshAuthToken();
        if (newToken) {
          updateDropzoneToken(newToken);
        }
      }, 45 * 60 * 1000); // 45 minutes
    });

    dropzone.on("uploadprogress", (file, progress, bytesSent) => {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: Math.round(progress),
      }));
    });

    dropzone.on("chunkuploaded", (file, chunk, response) => {
      console.log(`✅ Chunk ${chunk.index + 1} uploaded for ${file.name}`);
    });

    dropzone.on("success", (file, response) => {
      console.log("🎉 Upload completed successfully:", file.name);
      
      // Clear token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }

      try {
        const data = typeof response === "string" ? JSON.parse(response) : response;
        setUploadStatus({ [file.name]: "success" });
        if (onUploadComplete) {
          onUploadComplete(data, file);
        }
      } catch (error) {
        console.error("❌ Error parsing upload response:", error);
        setUploadStatus({ [file.name]: "error" });
        if (onUploadError) {
          onUploadError(error, file);
        }
      }
    });

    dropzone.on("error", async (file, errorMessage, xhr) => {
      console.error("❌ Upload error:", errorMessage, xhr);
      
      // Check if it's an authentication error (401)
      if (xhr && xhr.status === 401) {
        console.log("🔐 Authentication error detected, attempting token refresh...");
        const newToken = await refreshAuthToken();
        
        if (newToken) {
          updateDropzoneToken(newToken);
          
          // Retry the upload after token refresh
          console.log("🔄 Retrying upload with new token...");
          setTimeout(() => {
            file.status = Dropzone.QUEUED;
            dropzone.processFile(file);
          }, 1000);
          return;
        } else {
          // Token refresh failed, show error
          setUploadStatus({ [file.name]: "error" });
          if (onUploadError) {
            onUploadError(new Error(language === "ar" ? "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى" : "Session expired. Please login again"), file);
          }
        }
      } 
      // Check if it's a connection error (502, ERR_CONNECTION_RESET)
      else if (xhr && (xhr.status === 502 || xhr.status === 0)) {
        console.log("🔌 Connection error detected, will retry automatically...");
        // Dropzone will retry automatically based on retryChunks settings
        // Don't set error status yet, let retries happen
        return;
      }
      else {
        setUploadStatus({ [file.name]: "error" });
        if (onUploadError) {
          onUploadError(new Error(errorMessage), file);
        }
      }

      // Clear token refresh interval on final error
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    });

    dropzone.on("complete", (file) => {
      if (file.status === "error") {
        console.error("❌ Upload failed:", file.name);
        setUploadStatus({ [file.name]: "error" });
      }
      
      // Clear token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    });

    dropzone.on("canceled", (file) => {
      console.log("🚫 Upload canceled:", file.name);
      
      // Clear token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    });

    dropzoneInstanceRef.current = dropzone;

    // Cleanup
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      if (dropzoneInstanceRef.current) {
        dropzoneInstanceRef.current.destroy();
      }
    };
  }, [courseId, contentId, language, onUploadComplete, onUploadError]);

  const removeFile = () => {
    if (dropzoneInstanceRef.current && dropzoneInstanceRef.current.files.length > 0) {
      dropzoneInstanceRef.current.removeAllFiles(true);
      setUploadProgress({});
      setUploadStatus({});
      
      // Clear token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    }
  };

  const getFileStatus = (fileName) => {
    return uploadStatus[fileName] || "idle";
  };

  const getProgress = (fileName) => {
    return uploadProgress[fileName] || 0;
  };

  return (
    <div className="space-y-4">
      <div
        ref={dropzoneRef}
        className="dropzone border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex flex-col items-center gap-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {language === "ar" ? "اسحب الفيديو هنا" : "Drop video here"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {language === "ar" ? "أو اضغط للاختيار" : "or click to select"}
            </p>
          </div>
          <p className="text-xs text-gray-400">
            {language === "ar"
              ? "يدعم رفع الفيديوهات الكبيرة (حتى 10GB) مع إمكانية الاستئناف"
              : "Supports large video uploads (up to 10GB) with resume capability"}
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => {
            const status = getFileStatus(fileName);
            return (
              <div key={fileName} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium truncate flex-1 mr-2">{fileName}</span>
                  <div className="flex items-center gap-2">
                    {status === "uploading" && (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    )}
                    {status === "success" && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    {status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-muted-foreground">{progress}%</span>
                    {status !== "uploading" && (
                      <button
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      status === "success"
                        ? "bg-green-500"
                        : status === "error"
                        ? "bg-red-500"
                        : "bg-primary"
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                {status === "uploading" && (
                  <p className="text-xs text-gray-500">
                    {language === "ar" 
                      ? "جاري الرفع... يرجى عدم إغلاق الصفحة" 
                      : "Uploading... Please don't close this page"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
