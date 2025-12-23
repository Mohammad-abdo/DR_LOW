import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  HardDrive,
  RefreshCw,
  Trash2,
  FileVideo,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminUploads() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0,
    totalSize: 0,
  });

  useEffect(() => {
    fetchUploadStats();
  }, []);

  const fetchUploadStats = async () => {
    try {
      setLoading(true);
      // Since we don't have a dedicated uploads endpoint, we'll calculate from course content
      const response = await api.get("/admin/courses");
      const courses = response.data?.data?.courses || [];
      
      // Get all course content with videos
      const allContent = [];
      for (const course of courses) {
        try {
          const contentRes = await api.get(`/admin/courses/${course.id}/content`);
          const content = contentRes.data?.data?.allContent || [];
          allContent.push(...content.filter(c => c.videoUrl));
        } catch (error) {
          console.error(`Error fetching content for course ${course.id}:`, error);
        }
      }

      // Calculate stats
      const total = allContent.length;
      const completed = allContent.filter(c => c.videoUrl).length;
      const totalSize = allContent.reduce((sum, c) => {
        // Estimate size (we don't have actual file sizes)
        return sum + (c.videoUrl ? 100 : 0); // Placeholder
      }, 0);

      setStats({
        total,
        completed,
        failed: 0, // We don't track failed uploads separately
        pending: 0, // We don't track pending uploads separately
        totalSize,
      });

      setUploads(allContent.map(c => ({
        id: c.id,
        title: c.titleEn || c.titleAr,
        courseId: c.courseId,
        videoUrl: c.videoUrl,
        status: c.videoUrl ? "completed" : "failed",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })));
    } catch (error) {
      console.error("Error fetching upload stats:", error);
      toast.error(
        error.response?.data?.message ||
          (language === "ar" ? "خطأ في تحميل البيانات" : "Error loading data")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupChunks = async () => {
    try {
      const response = await api.delete("/admin/upload/cleanup-chunks");
      if (response.data?.success) {
        toast.success(
          response.data.message ||
            (language === "ar" ? "تم التنظيف بنجاح" : "Cleanup successful")
        );
      }
    } catch (error) {
      console.error("Error cleaning up chunks:", error);
      toast.error(
        error.response?.data?.message ||
          (language === "ar" ? "خطأ في التنظيف" : "Error cleaning up")
      );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "رفع الفيديوهات" : "Video Uploads"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة رفع الفيديوهات باستخدام Dropzone"
              : "Manage video uploads using Dropzone"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCleanupChunks}
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {language === "ar" ? "تنظيف الرفوعات غير المكتملة" : "Cleanup Incomplete"}
          </Button>
          <Button onClick={() => navigate("/admin/courses")} className="gap-2">
            <Upload className="w-4 h-4" />
            {language === "ar" ? "رفع فيديو جديد" : "Upload New Video"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "إجمالي الرفوعات" : "Total Uploads"}
                </p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </div>
              <HardDrive className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "مكتملة" : "Completed"}
                </p>
                <p className="text-2xl font-bold mt-1 text-green-600">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "فاشلة" : "Failed"}
                </p>
                <p className="text-2xl font-bold mt-1 text-red-600">
                  {stats.failed}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "الحجم الإجمالي" : "Total Size"}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatFileSize(stats.totalSize * 1024 * 1024)}
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {language === "ar" ? "معلومات Dropzone" : "Dropzone Information"}
          </h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h3 className="font-semibold mb-2">
                {language === "ar" ? "المميزات" : "Features"}
              </h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {language === "ar" ? "رفع مجزأ (8MB chunks)" : "Chunked upload (8MB chunks)"}</li>
                <li>• {language === "ar" ? "رفع متوازي" : "Parallel uploads"}</li>
                <li>• {language === "ar" ? "إعادة المحاولة التلقائية" : "Automatic retry"}</li>
                <li>• {language === "ar" ? "استئناف الرفع" : "Resume capability"}</li>
                <li>• {language === "ar" ? "دعم فيديوهات حتى 10GB" : "Support up to 10GB videos"}</li>
              </ul>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <h3 className="font-semibold mb-2">
                {language === "ar" ? "كيفية الاستخدام" : "How to Use"}
              </h3>
              <ol className="space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                <li>{language === "ar" ? "انتقل إلى إدارة المحتوى" : "Go to Course Content Management"}</li>
                <li>{language === "ar" ? "اختر نوع المحتوى: فيديو" : "Select content type: Video"}</li>
                <li>{language === "ar" ? "اسحب الفيديو أو اضغط للاختيار" : "Drag video or click to select"}</li>
                <li>{language === "ar" ? "راقب تقدم الرفع" : "Monitor upload progress"}</li>
                <li>{language === "ar" ? "احفظ المحتوى بعد اكتمال الرفع" : "Save content after upload completes"}</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FileVideo className="w-5 h-5" />
              {language === "ar" ? "الرفوعات الأخيرة" : "Recent Uploads"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUploadStats}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {language === "ar" ? "تحديث" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {uploads.length > 0 ? (
            <div className="space-y-3">
              {uploads.slice(0, 10).map((upload) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{upload.title}</p>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            upload.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {upload.status === "completed"
                            ? language === "ar"
                              ? "مكتمل"
                              : "Completed"
                            : language === "ar"
                            ? "فاشل"
                            : "Failed"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {upload.videoUrl ? (
                          <span className="text-green-600">
                            {language === "ar" ? "تم الرفع بنجاح" : "Uploaded successfully"}
                          </span>
                        ) : (
                          <span className="text-red-600">
                            {language === "ar" ? "لا يوجد فيديو" : "No video"}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {upload.createdAt
                          ? format(new Date(upload.createdAt), "PPp")
                          : "-"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {upload.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>
                {language === "ar"
                  ? "لا توجد رفوعات"
                  : "No uploads found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}














