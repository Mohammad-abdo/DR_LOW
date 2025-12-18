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
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadStatus, setUploadStatus] = useState({}); // 'uploading', 'success', 'error'

  useEffect(() => {
    if (!dropzoneRef.current) return;

    // Initialize Dropzone
    const dropzone = new Dropzone(dropzoneRef.current, {
      url: `${import.meta.env.VITE_API_URL || 'https://dr-law.developteam.site/api'}/admin/upload/video-chunk`,
      method: "post",
      paramName: "chunk",
      chunking: true,
      chunkSize: 8 * 1024 * 1024, // 8MB chunks
      retryChunks: true,
      retryChunksLimit: 3,
      parallelChunkUploads: true,
      maxFilesize: 10 * 1024 * 1024 * 1024, // 10GB max
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
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      params: {
        courseId: courseId || "",
        contentId: contentId || "",
      },
    });

    // Event handlers
    dropzone.on("addedfile", (file) => {
      setUploadStatus({ [file.name]: "uploading" });
      setUploadProgress({ [file.name]: 0 });
      
      // Remove any previously added files
      if (dropzone.files.length > 1) {
        dropzone.removeFile(dropzone.files[0]);
      }
    });

    dropzone.on("uploadprogress", (file, progress, bytesSent) => {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: Math.round(progress),
      }));
    });

    dropzone.on("chunkuploaded", (file, chunk, response) => {
      console.log(`Chunk ${chunk.index} uploaded for ${file.name}`);
    });

    dropzone.on("success", (file, response) => {
      try {
        const data = typeof response === "string" ? JSON.parse(response) : response;
        setUploadStatus({ [file.name]: "success" });
        if (onUploadComplete) {
          onUploadComplete(data, file);
        }
      } catch (error) {
        console.error("Error parsing upload response:", error);
        setUploadStatus({ [file.name]: "error" });
        if (onUploadError) {
          onUploadError(error, file);
        }
      }
    });

    dropzone.on("error", (file, errorMessage, xhr) => {
      console.error("Upload error:", errorMessage, xhr);
      setUploadStatus({ [file.name]: "error" });
      if (onUploadError) {
        onUploadError(new Error(errorMessage), file);
      }
    });

    dropzone.on("complete", (file) => {
      if (file.status === "error") {
        setUploadStatus({ [file.name]: "error" });
      }
    });

    dropzoneInstanceRef.current = dropzone;

    return () => {
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}





