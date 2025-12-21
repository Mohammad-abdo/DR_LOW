import { useState, useEffect, useRef, useCallback } from "react";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "dropzone/dist/dropzone.css";

export default function DropzoneVideoUpload({ onUploadComplete, onUploadError, courseId, chapterId, contentId }) {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const dropzoneRef = useRef(null);
  const dropzoneInstanceRef = useRef(null);

  useEffect(() => {
    // Initialize Dropzone
    const initDropzone = async () => {
      try {
        const Dropzone = (await import("dropzone")).default;
        Dropzone.autoDiscover = false;

        if (dropzoneRef.current && !dropzoneInstanceRef.current) {
          const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
          
          dropzoneInstanceRef.current = new Dropzone(dropzoneRef.current, {
            url: `${api.defaults.baseURL}/admin/upload/video-chunk`,
            method: "post",
            chunking: true,
            chunkSize: 20 * 1024 * 1024, // 20MB chunks
            parallelChunkUploads: false,
            retryChunks: true,
            retryChunksLimit: 3,
            maxFilesize: 5368709120, // 5GB
            acceptedFiles: "video/*",
            previewTemplate: '<div style="display:none"></div>', // Hide default preview
            clickable: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              courseId: courseId || "",
              chapterId: chapterId || "",
              contentId: contentId || "",
            },
          });

          dropzoneInstanceRef.current.on("addedfile", (file) => {
            setError(null);
            setUploading(true);
            setProgress(0);
            setUploadedFile(null);
          });

          dropzoneInstanceRef.current.on("uploadprogress", (file, progress) => {
            setProgress(progress);
          });

          dropzoneInstanceRef.current.on("success", (file, response) => {
            setProgress(100);
            setUploadedFile(file);
            setUploading(false);
            if (onUploadComplete) {
              onUploadComplete(response, file);
            }
          });

          dropzoneInstanceRef.current.on("error", (file, errorMessage, xhr) => {
            console.error("Dropzone upload error:", errorMessage, xhr);
            const errorText = errorMessage?.message || errorMessage || "Upload failed";
            setError(errorText);
            setUploading(false);
            if (onUploadError) {
              onUploadError(new Error(errorText), file);
            }
          });

          dropzoneInstanceRef.current.on("dragenter", () => {
            setIsDragActive(true);
          });

          dropzoneInstanceRef.current.on("dragleave", () => {
            setIsDragActive(false);
          });

          dropzoneInstanceRef.current.on("drop", () => {
            setIsDragActive(false);
          });
        }
      } catch (err) {
        console.error("Error initializing Dropzone:", err);
      }
    };

    initDropzone();

    return () => {
      if (dropzoneInstanceRef.current) {
        dropzoneInstanceRef.current.destroy();
        dropzoneInstanceRef.current = null;
      }
    };
  }, [courseId, chapterId, contentId, onUploadComplete, onUploadError]);

  const handleRemove = useCallback(() => {
    if (dropzoneInstanceRef.current) {
      dropzoneInstanceRef.current.removeAllFiles(true);
    }
    setUploadedFile(null);
    setProgress(0);
    setError(null);
    setUploading(false);
  }, []);

  return (
    <div className="space-y-4">
      <style>{`
        .dropzone {
          border: none !important;
          background: transparent !important;
          min-height: auto !important;
        }
        .dropzone .dz-preview {
          display: none !important;
        }
        .dropzone .dz-message {
          display: none !important;
        }
      `}</style>
      <div
        ref={dropzoneRef}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
          ${uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-accent/50"}
        `}
      >
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {language === "ar" ? "جاري الرفع..." : "Uploading..."}
                </p>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{progress.toFixed(0)}%</p>
              </div>
            </>
          ) : uploadedFile ? (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">
                  {language === "ar" ? "تم الرفع بنجاح" : "Upload successful"}
                </p>
                <p className="text-xs text-muted-foreground">{uploadedFile.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                {language === "ar" ? "إزالة" : "Remove"}
              </Button>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {language === "ar"
                    ? "اسحب وأفلت ملف الفيديو هنا أو انقر للاختيار"
                    : "Drag and drop video file here or click to select"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "ar"
                    ? "MP4, WebM, MOV, AVI (حتى 5GB)"
                    : "MP4, WebM, MOV, AVI (up to 5GB)"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
