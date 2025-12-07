import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Book, Users, Star, Loader2, Play, FileText, Video, Clock, Award, DollarSign, Percent, Calendar, ExternalLink, FileDown } from "lucide-react";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/imageHelper";
import showToast from "@/lib/toast";

export default function AdminCourseDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedContent, setExpandedContent] = useState({});
  const [expandedExams, setExpandedExams] = useState({});

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/courses/${id}`);
      const data = extractDataFromResponse(response);
      setCourse(data.course || data);
    } catch (error) {
      console.error("Error fetching course:", error);
      showToast.error(error.response?.data?.message || (language === "ar" ? "خطأ في تحميل الدورة" : "Error loading course"));
      navigate("/admin/courses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/courses/${id}`);
      showToast.success(language === "ar" ? "تم الحذف بنجاح" : "Course deleted successfully");
      navigate("/admin/courses");
    } catch (error) {
      showToast.error(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting course"));
    }
  };

  const toggleContent = (contentId) => {
    setExpandedContent(prev => ({
      ...prev,
      [contentId]: !prev[contentId]
    }));
  };

  const toggleExam = (examId) => {
    setExpandedExams(prev => ({
      ...prev,
      [examId]: !prev[examId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/courses/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      {/* Course Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative">
          {course.coverImage && (
            <div className="h-64 w-full bg-gradient-to-r from-primary/20 to-primary/5">
              <img
                src={getImageUrl(course.coverImage)}
                alt={course.titleEn || course.titleAr}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className={`p-6 ${course.coverImage ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent' : ''}`}>
            <div className="flex items-start gap-6">
              {!course.coverImage && (
                <div className="w-32 h-32 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Book className="w-16 h-16 text-primary/50" />
                </div>
              )}
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-2 ${course.coverImage ? 'text-white' : ''}`}>
                  {language === "ar" ? course.titleAr : course.titleEn}
                </h1>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                    course.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {course.status}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.level === "BEGINNER" ? "bg-blue-100 text-blue-800" :
                    course.level === "INTERMEDIATE" ? "bg-purple-100 text-purple-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      {course._count && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الاشتراكات" : "Enrollments"}</p>
                  <p className="text-3xl font-bold">{course._count.purchases || 0}</p>
                </div>
                <Users className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "التقييمات" : "Ratings"}</p>
                  <p className="text-3xl font-bold">{course._count.ratings || 0}</p>
                </div>
                <Star className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "المحتوى" : "Content Items"}</p>
                  <p className="text-3xl font-bold">{course.content?.length || 0}</p>
                </div>
                <FileText className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الامتحانات" : "Exams"}</p>
                  <p className="text-3xl font-bold">{course.exams?.length || 0}</p>
                </div>
                <Award className="w-10 h-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">{language === "ar" ? "معلومات الدورة" : "Course Information"}</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Descriptions */}
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {course.descriptionAr || "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {course.descriptionEn || "-"}
                </p>
              </div>

              {/* Course Content */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2 text-lg">
                    <Video className="w-5 h-5" />
                    {language === "ar" ? "محتوى الدورة" : "Course Content"}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/courses/${id}/content`)}
                  >
                    {language === "ar" ? "إدارة المحتوى" : "Manage Content"}
                  </Button>
                </div>
                {course.content && course.content.length > 0 ? (
                  <div className="space-y-3">
                    {course.content.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleContent(item.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              item.type === "VIDEO" ? "bg-red-100 text-red-600" :
                              item.type === "PDF" ? "bg-blue-100 text-blue-600" :
                              item.type === "ASSIGNMENT" ? "bg-purple-100 text-purple-600" :
                              "bg-gray-100 text-gray-600"
                            }`}>
                              {item.type === "VIDEO" ? (
                                <Video className="w-6 h-6" />
                              ) : (
                                <FileText className="w-6 h-6" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">
                                {language === "ar" ? item.titleAr : item.titleEn}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                  {item.type}
                                </span>
                                {item.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {item.duration} {language === "ar" ? "دقيقة" : "min"}
                                  </span>
                                )}
                                {item.isFree && (
                                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
                                    {language === "ar" ? "مجاني" : "Free"}
                                  </span>
                                )}
                                <span className="text-xs">#{index + 1}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              {expandedContent[item.id] ? "−" : "+"}
                            </Button>
                          </div>
                        </div>
                        
                        {expandedContent[item.id] && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            {(item.descriptionAr || item.descriptionEn) && (
                              <p className="text-sm text-muted-foreground mt-3 mb-3">
                                {language === "ar" ? item.descriptionAr : item.descriptionEn}
                              </p>
                            )}
                            
                            {item.type === "VIDEO" && item.videoUrl && (
                              <div className="mt-3">
                                <video
                                  src={getImageUrl(item.videoUrl)}
                                  controls
                                  className="w-full rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    const errorDiv = document.createElement('div');
                                    errorDiv.className = 'p-4 bg-red-50 text-red-600 rounded-lg text-sm';
                                    errorDiv.textContent = language === "ar" ? "فشل تحميل الفيديو" : "Failed to load video";
                                    e.target.parentNode.appendChild(errorDiv);
                                  }}
                                />
                              </div>
                            )}
                            
                            {(item.type === "PDF" || item.type === "ASSIGNMENT") && item.fileUrl && (
                              <div className="mt-3">
                                <a
                                  href={getImageUrl(item.fileUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                  <FileDown className="w-4 h-4" />
                                  {language === "ar" ? "تحميل الملف" : "Download File"}
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            )}
                            
                            {item.type === "TEXT" && item.content && (
                              <div className="mt-3 p-4 bg-white rounded-lg border">
                                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "ar" ? "لا يوجد محتوى" : "No content available"}
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate(`/admin/courses/${id}/content`)}
                    >
                      {language === "ar" ? "إضافة محتوى" : "Add Content"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Exams */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5" />
                  {language === "ar" ? "الامتحانات" : "Exams"}
                </h3>
                {course.exams && course.exams.length > 0 ? (
                  <div className="space-y-3">
                    {course.exams.map((exam) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleExam(exam.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
                                <Award className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">
                                  {language === "ar" ? exam.titleAr : exam.titleEn}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {exam._count?.questions || 0} {language === "ar" ? "سؤال" : "questions"}
                                  </span>
                                  {exam.duration && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {exam.duration} {language === "ar" ? "دقيقة" : "min"}
                                    </span>
                                  )}
                                  {exam.passingScore && (
                                    <span className="flex items-center gap-1">
                                      <Star className="w-3 h-3" />
                                      {exam.passingScore}% {language === "ar" ? "للنجاح" : "to pass"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/exams/${exam.id}`);
                                }}
                              >
                                {language === "ar" ? "عرض" : "View"}
                              </Button>
                              <Button variant="ghost" size="sm">
                                {expandedExams[exam.id] ? "−" : "+"}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        {expandedExams[exam.id] && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            {(exam.descriptionAr || exam.descriptionEn) && (
                              <p className="text-sm text-muted-foreground mt-3 mb-3">
                                {language === "ar" ? exam.descriptionAr : exam.descriptionEn}
                              </p>
                            )}
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              {exam.startDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{language === "ar" ? "تاريخ البدء:" : "Start:"}</span>
                                  <span>{format(new Date(exam.startDate), "PPp")}</span>
                                </div>
                              )}
                              {exam.endDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">{language === "ar" ? "تاريخ الانتهاء:" : "End:"}</span>
                                  <span>{format(new Date(exam.endDate), "PPp")}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {language === "ar" ? "لا توجد امتحانات" : "No exams available"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Details Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold">{language === "ar" ? "تفاصيل الدورة" : "Course Details"}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {language === "ar" ? "المعلم" : "Teacher"}
                </span>
                <span className="font-semibold text-right">
                  {language === "ar" ? course.teacher?.nameAr : course.teacher?.nameEn}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  {language === "ar" ? "الفئة" : "Category"}
                </span>
                <span className="font-semibold text-right">
                  {language === "ar" ? course.category?.nameAr : course.category?.nameEn}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {language === "ar" ? "السعر" : "Price"}
                </span>
                <span className="font-semibold">${parseFloat(course.price || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  {language === "ar" ? "الخصم" : "Discount"}
                </span>
                <span className="font-semibold">{parseFloat(course.discount || 0)}%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {language === "ar" ? "السعر النهائي" : "Final Price"}
                </span>
                <span className="font-semibold text-primary text-lg">${parseFloat(course.finalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {language === "ar" ? "تاريخ الإنشاء" : "Created At"}
                </span>
                <span className="font-semibold text-sm">
                  {course.createdAt ? format(new Date(course.createdAt), "PP") : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
