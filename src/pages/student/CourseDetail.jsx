import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl, getVideoUrl } from "@/lib/imageHelper";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  Play,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Award,
  Video,
  FileText,
  Download,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import showToast from "@/lib/toast";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();

  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    fetchCourse();
    checkCart();
    checkPurchase();
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching course with ID:", id);
      
      // Try to get course with content in one request
      const courseRes = await api.get(`/mobile/student/courses/${id}`);
      console.log("📦 Course API Response:", courseRes);
      
      // Backend returns: { success: true, data: { course: {...} } }
      // axios wraps it: courseRes.data = { success: true, data: { course: {...} } }
      const responseData = courseRes?.data;
      console.log("📦 Raw Response Data:", responseData);
      
      let course = null;
      
      // Direct extraction from backend structure - try all possible paths
      if (responseData?.success && responseData?.data?.course) {
        course = responseData.data.course;
        console.log("✅ Extracted from: responseData.data.course (with success)");
      } else if (responseData?.data?.course) {
        course = responseData.data.course;
        console.log("✅ Extracted from: responseData.data.course (no success field)");
      } else if (responseData?.course) {
        course = responseData.course;
        console.log("✅ Extracted from: responseData.course (direct)");
      } else {
        // Try extractDataFromResponse as fallback
        const courseData = extractDataFromResponse(courseRes);
        console.log("📋 extractDataFromResponse result:", courseData);
        course = courseData.course || courseData;
        console.log("✅ Extracted from: extractDataFromResponse fallback");
      }
      
      if (!course) {
        console.error("❌ Failed to extract course from response!");
        console.error("Full response:", courseRes);
        throw new Error("Failed to extract course data");
      }
      
      console.log("📋 Extracted Course:", course);
      console.log("✅ Course Object Details:", {
        id: course?.id,
        titleAr: course?.titleAr,
        titleEn: course?.titleEn,
        coverImage: course?.coverImage,
        coverImageUrl: course?.coverImage ? getImageUrl(course.coverImage) : null,
        hasCoverImage: !!course?.coverImage,
        allKeys: Object.keys(course || {})
      });
      
      // Debug: Check if coverImage exists
      if (!course?.coverImage) {
        console.warn("⚠️ Course has no coverImage!");
        console.warn("Available fields:", Object.keys(course || {}));
      } else {
        console.log("✅ Course has coverImage:", course.coverImage);
        console.log("✅ Full image URL:", getImageUrl(course.coverImage));
      }
      
      // If course doesn't have content, try to fetch it separately
      if (!course.content && !course.chapters) {
        try {
          const contentRes = await api.get(`/mobile/student/courses/${id}/content`);
          const contentData = extractDataFromResponse(contentRes);
          console.log("Content API Response:", contentData);
          
          if (contentData.course) {
            course.content = contentData.course.content || [];
            course.chapters = contentData.course.chapters || [];
          } else if (contentData.content) {
            course.content = Array.isArray(contentData.content) ? contentData.content : [];
          }
          if (contentData.chapters) {
            course.chapters = Array.isArray(contentData.chapters) ? contentData.chapters : [];
          }
        } catch (contentError) {
          console.error("Error fetching content:", contentError);
          course.content = [];
          course.chapters = [];
        }
      }
      
      console.log("Final Course Object:", course);
      setCourse(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في تحميل الدورة" : "Error loading course")
      );
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const checkCart = async () => {
    try {
      const cartRes = await api.get("/mobile/student/cart");
      const cartData = extractDataFromResponse(cartRes);
      const cartItems = Array.isArray(cartData.items) ? cartData.items : [];
      setInCart(cartItems.some((item) => item.courseId === id));
    } catch (error) {
      console.error("Error checking cart:", error);
    }
  };

  const checkPurchase = async () => {
    try {
      const response = await api.get("/mobile/student/my-courses");
      const data = extractDataFromResponse(response);
      const courses = Array.isArray(data.courses) ? data.courses : [];
      setPurchased(courses.some((c) => c.id === id));
    } catch (error) {
      console.error("Error checking purchase:", error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await api.post("/mobile/student/cart", { courseId: id });
      setInCart(true);
      showToast.success(
        language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart"
      );
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في الإضافة" : "Error adding to cart")
      );
    }
  };


  const handleStartLearning = () => {
    navigate(`/dashboard/learning/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "ar" ? "جاري تحميل الدورة..." : "Loading course..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Back Button */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === "ar" ? "العودة" : "Back"}
          </Button>
        </div>
      </section>

      {/* Hero Section with Cover Image */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full overflow-hidden rounded-2xl mt-6 mb-8 shadow-xl">
            {course?.coverImage ? (
              <img
                key={`course-cover-${course.id}`}
                src={getImageUrl(course.coverImage) || course.coverImageUrl}
                alt={language === "ar" ? course.titleAr || "Course" : course.titleEn || "Course"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("❌ Course image ERROR:", {
                    url: e.target.src,
                    coverImage: course.coverImage,
                    courseId: course.id,
                    fullUrl: getImageUrl(course.coverImage)
                  });
                  e.target.style.display = 'none';
                }}
                onLoad={(e) => {
                  console.log("✅ Course image LOADED:", {
                    url: e.target.src,
                    courseId: course.id
                  });
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-700">
                <BookOpen className="w-16 h-16 sm:w-20 sm:h-20 text-white/50" />
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute " />
            {/* Course Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                {language === "ar" ? course.titleAr : course.titleEn}
              </h1>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2 text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">{course._count?.purchases || 0} {language === "ar" ? "طالب" : "students"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs sm:text-sm font-medium">{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">{course._count?.content || 0} {language === "ar" ? "درس" : "lessons"}</span>
                </div>
                <span className="px-3 py-1.5 bg-amber-500 text-white rounded-full text-xs sm:text-sm font-semibold">
                  {course.level || "BASIC"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {language === "ar" ? "عن الدورة" : "About This Course"}
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {language === "ar" ? course.descriptionAr : course.descriptionEn}
                </p>
              </CardContent>
            </Card>

            {/* Teacher Info */}
            {course.teacher && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
                    {language === "ar" ? "المعلم" : "Instructor"}
                  </h3>
                  <div className="flex items-center gap-4 sm:gap-6">
                    {course.teacher.avatar ? (
                      <img
                        src={getImageUrl(course.teacher.avatar)}
                        alt={language === "ar" ? course.teacher.nameAr : course.teacher.nameEn}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-100 object-cover shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-md">
                        {(language === "ar" ? course.teacher.nameAr : course.teacher.nameEn)?.charAt(0) || "T"}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg sm:text-xl text-gray-900">
                        {language === "ar" ? course.teacher.nameAr : course.teacher.nameEn}
                      </p>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {language === "ar" ? "مدرس محترف" : "Professional Instructor"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Intro Video - Special Layout */}
            {(() => {
              // Find intro video from standalone content or chapters (from database only)
              let introVideo = null;
              
              // Check standalone content first
              if (course.content && Array.isArray(course.content)) {
                introVideo = course.content.find(c => c.isIntroVideo && c.type === 'VIDEO' && !c.chapterId);
              }
              
              // If not found, check chapters
              if (!introVideo && course.chapters && Array.isArray(course.chapters)) {
                for (const chapter of course.chapters) {
                  if (chapter.content && Array.isArray(chapter.content)) {
                    introVideo = chapter.content.find(c => c.isIntroVideo && c.type === 'VIDEO');
                    if (introVideo) break;
                  }
                }
              }
              
              // Only show if video exists in database with valid videoUrl and is accessible
              if (!introVideo || !introVideo.videoUrl || typeof introVideo.videoUrl !== 'string' || introVideo.videoUrl.trim() === '') {
                return null;
              }
              
              // Check if video is accessible (free or purchased)
              const isAccessible = introVideo.isAccessible !== false && (introVideo.isFree || course.isPurchased);
              
              // Skip videos with hardcoded/invalid paths
              if (introVideo.videoUrl.includes('/intro.mp4') && !introVideo.videoUrl.includes(course.id)) {
                console.warn("⚠️ Skipping hardcoded intro video path:", introVideo.videoUrl);
                return null;
              }
              
              const videoUrl = getVideoUrl(introVideo.videoUrl);
              
              return (
                <Card className="border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                        <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                          {language === "ar" ? "مقدمة الدورة" : "Course Introduction"}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">
                          {language === "ar" ? introVideo.titleAr : introVideo.titleEn}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="relative bg-black aspect-video sm:aspect-[16/9]">
                    <video
                      key={`intro-video-${introVideo.id}`}
                      src={videoUrl}
                      controls
                      className="w-full h-full"
                      onError={(e) => {
                        console.error("❌ Intro video failed to load:", {
                          videoUrl: introVideo.videoUrl,
                          fullUrl: videoUrl,
                          contentId: introVideo.id
                        });
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent && !parent.querySelector('.video-error-fallback')) {
                          const fallback = document.createElement('div');
                          fallback.className = 'video-error-fallback w-full h-full bg-gray-800 text-white flex items-center justify-center';
                          fallback.innerHTML = `
                            <div class="text-center p-4">
                              <svg class="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-sm text-gray-300">${language === "ar" ? "الفيديو غير متاح حالياً" : "Video not available"}</p>
                            </div>
                          `;
                          parent.appendChild(fallback);
                        }
                      }}
                      onLoadStart={() => {
                        console.log("✅ Intro video loading:", {
                          videoUrl: introVideo.videoUrl,
                          fullUrl: videoUrl,
                          contentId: introVideo.id
                        });
                      }}
                      preload="metadata"
                    />
                  </div>
                  {introVideo.descriptionAr || introVideo.descriptionEn ? (
                    <CardContent className="p-4 sm:p-6 bg-white">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {language === "ar" ? introVideo.descriptionAr : introVideo.descriptionEn}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })()}

            {/* Exams Section - Show exams if available */}
            {course.exams && Array.isArray(course.exams) && course.exams.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
                    {language === "ar" ? "الامتحانات" : "Exams"}
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {course.exams.map((exam) => {
                      const hasResult = exam.results && exam.results.length > 0 && exam.results[0]?.submittedAt;
                      const result = exam.results?.[0];
                      
                      return (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (hasResult) {
                              navigate(`/dashboard/exams/${exam.id}/result`);
                            } else {
                              navigate(`/dashboard/exams/${exam.id}`);
                            }
                          }}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 rounded-lg border-2 border-amber-200 hover:border-amber-300 transition-all cursor-pointer shadow-sm hover:shadow-md"
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-500 text-white shadow-md">
                            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {language === "ar" ? exam.titleAr : exam.titleEn}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs sm:text-sm text-gray-600">
                                {exam._count?.questions || 0} {language === "ar" ? "سؤال" : "questions"}
                              </p>
                              {exam.duration && (
                                <p className="text-xs sm:text-sm text-gray-600">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {exam.duration} {language === "ar" ? "دقيقة" : "min"}
                                </p>
                              )}
                              {hasResult && result && (
                                <p className={`text-xs sm:text-sm font-semibold ${
                                  result.passed ? "text-green-600" : "text-red-600"
                                }`}>
                                  {result.percentage != null 
                                    ? (typeof result.percentage === 'number' 
                                        ? result.percentage.toFixed(1) 
                                        : parseFloat(result.percentage)?.toFixed(1) || '0.0')
                                    : '0.0'}%
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {hasResult ? (
                              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Content Preview - Show all content from database */}
            {(() => {
              // Get all content from chapters and standalone content (all videos from database)
              let allContent = [];
              
              // Add standalone content (not in chapters) - ALL content, not filtered
              if (course.content && Array.isArray(course.content)) {
                allContent = allContent.concat(course.content.filter(c => !c.isIntroVideo && !c.chapterId));
              }
              
              // Add content from chapters - ALL content
              if (course.chapters && Array.isArray(course.chapters)) {
                course.chapters.forEach(chapter => {
                  if (chapter.content && Array.isArray(chapter.content)) {
                    allContent = allContent.concat(chapter.content.filter(c => !c.isIntroVideo));
                  }
                });
              }
              
              // Filter out content with invalid/hardcoded paths
              allContent = allContent.filter(item => {
                if (item.type === 'VIDEO' && item.videoUrl) {
                  // Skip hardcoded paths that don't include course ID
                  if (item.videoUrl.includes('/intro.mp4') && !item.videoUrl.includes(course.id)) {
                    console.warn("⚠️ Skipping hardcoded intro video path:", item.videoUrl);
                    return false;
                  }
                }
                return true;
              });
              
              if (allContent.length === 0) return null;
              
              return (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
                      {language === "ar" ? "محتوى الدورة" : "Course Content"}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      {allContent.slice(0, 5).map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.type === "VIDEO" ? "bg-amber-100 text-amber-700" :
                            item.type === "PDF" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }`}>
                            {item.type === "VIDEO" ? (
                              <Video className="w-5 h-5 sm:w-6 sm:h-6" />
                            ) : (
                              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                              {language === "ar" ? item.titleAr : item.titleEn}
                            </p>
                            {item.duration && (
                              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                {item.duration} {language === "ar" ? "دقيقة" : "min"}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      {allContent.length > 5 && (
                        <p className="text-center text-sm sm:text-base text-gray-600 pt-3 sm:pt-4 font-medium">
                          +{allContent.length - 5} {language === "ar" ? "درس إضافي" : "more lessons"}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-0 shadow-xl">
              <CardContent className="p-6">
                {purchased ? (
                  <div className="space-y-4">
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {language === "ar" ? "تم الشراء" : "Purchased"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {language === "ar" ? "يمكنك الآن البدء في التعلم" : "You can now start learning"}
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white h-14 text-lg font-bold"
                      onClick={handleStartLearning}
                    >
                      <Play className="w-6 h-6 mr-2" />
                      {language === "ar" ? "متابعة التعلم" : "Continue Learning"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {language === "ar" ? "السعر" : "Price"}
                      </h3>
                      {course.discount > 0 ? (
                        <div>
                          <div className="flex items-baseline justify-center gap-3 mb-3">
                            <span className="text-4xl sm:text-5xl font-bold text-amber-600">
                              ${parseFloat(course.finalPrice).toFixed(2)}
                            </span>
                            <span className="text-xl sm:text-2xl text-gray-400 line-through">
                              ${parseFloat(course.price).toFixed(2)}
                            </span>
                          </div>
                          <span className="inline-block px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                            {course.discount}% {language === "ar" ? "خصم" : "OFF"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-4xl sm:text-5xl font-bold text-amber-600">
                          ${parseFloat(course.price).toFixed(2)}
                        </div>
                      )}
                    </div>
                    <Button
                      size="lg"
                      onClick={handleAddToCart}
                      disabled={inCart}
                      className={`w-full h-14 text-lg font-bold transition-all ${
                        inCart 
                          ? "bg-gray-400 cursor-not-allowed" 
                          : "bg-amber-600 hover:bg-amber-700 text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      {inCart
                        ? language === "ar" ? "في السلة" : "In Cart"
                        : language === "ar" ? "أضف إلى السلة" : "Add to Cart"}
                    </Button>
                    <div className="pt-4 border-t space-y-3">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{language === "ar" ? "وصول مدى الحياة" : "Lifetime access"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{language === "ar" ? "شهادة إتمام" : "Certificate of completion"}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span>{language === "ar" ? "دعم فني" : "Technical support"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

