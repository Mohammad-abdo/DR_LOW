import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl, getVideoUrl } from "@/lib/imageHelper";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Video,
  FileText,
  Download,
  Clock,
  BookOpen,
  Award,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import showToast from "@/lib/toast";

export default function Learning() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const videoRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [currentContent, setCurrentContent] = useState(null);
  const [contentList, setContentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);
  const [completedContents, setCompletedContents] = useState(new Set());
  const [videoDuration, setVideoDuration] = useState(null); // Actual video duration in seconds

  useEffect(() => {
    fetchCourseContent();
  }, [id]);

  useEffect(() => {
    if (currentContent && videoRef.current) {
      const video = videoRef.current;
      
      const updateProgress = () => {
        if (video.duration) {
          const currentProgress = (video.currentTime / video.duration) * 100;
          setProgress(currentProgress);
          setWatchedDuration(video.currentTime);
          
          // Mark as completed when 80% watched
          if (currentProgress >= 80 && !completedContents.has(currentContent.id)) {
            markContentComplete();
          }
        }
      };

      const handleTimeUpdate = () => {
        updateProgress();
      };

      const handleLoadedMetadata = () => {
        updateProgress();
        // Get actual video duration
        if (video.duration && !isNaN(video.duration)) {
          setVideoDuration(video.duration);
          console.log("Video duration:", video.duration, "seconds");
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("loadedmetadata", handleLoadedMetadata);

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [currentContent, completedContents]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      console.log("Fetching course content for ID:", id);
      const response = await api.get(`/mobile/student/courses/${id}/content`);
      console.log("Course Content API Response:", response);
      const data = extractDataFromResponse(response);
      console.log("Extracted Content Data:", data);
      const courseData = data.course || data;
      
      console.log("Course Data:", courseData);
      console.log("Course Content:", courseData.content);
      console.log("Course Chapters:", courseData.chapters);
      
      setCourse(courseData);
      
      // Flatten content from chapters and standalone content for easy navigation
      const allContent = [];
      
      // Add course intro video if exists (from standalone content)
      if (courseData.content && Array.isArray(courseData.content)) {
        const introVideo = courseData.content.find(c => c.isIntroVideo && c.type === 'VIDEO' && !c.chapterId);
        if (introVideo) {
          console.log("Found course intro video:", introVideo);
          allContent.push(introVideo);
        }
      }
      
      // Add chapter content
      if (courseData.chapters && Array.isArray(courseData.chapters) && courseData.chapters.length > 0) {
        courseData.chapters.forEach((chapter) => {
          // Add chapter intro video if exists
          if (chapter.content && Array.isArray(chapter.content)) {
            const chapterIntro = chapter.content.find(c => c.isIntroVideo && c.type === 'VIDEO');
            if (chapterIntro) {
              console.log("Found chapter intro video:", chapterIntro);
              allContent.push(chapterIntro);
            }
            // Add other chapter content
            chapter.content.forEach((content) => {
              if (!content.isIntroVideo) {
                allContent.push(content);
              }
            });
          }
        });
      } else {
        // No chapters - use standalone content
        if (courseData.content && Array.isArray(courseData.content)) {
          courseData.content.forEach((content) => {
            if (!content.isIntroVideo && !content.chapterId) {
              allContent.push(content);
            }
          });
        }
      }
      
      console.log("All Content List:", allContent);
      setContentList(allContent);
      
      // Set first content as current
      if (allContent.length > 0) {
        console.log("Setting current content:", allContent[0]);
        console.log("Content videoUrl:", allContent[0].videoUrl);
        setCurrentContent(allContent[0]);
        setVideoDuration(null); // Reset duration when content changes
      } else {
        console.warn("No content found for course");
      }

      // Fetch course progress
      const progressResponse = await api.get("/mobile/student/my-courses");
      const progressData = extractDataFromResponse(progressResponse);
      const courses = Array.isArray(progressData.courses) ? progressData.courses : [];
      const currentCourse = courses.find((c) => c.id === id);
      if (currentCourse) {
        setCourseProgress(currentCourse.progress || 0);
      }
    } catch (error) {
      console.error("Error fetching course content:", error);
      showToast.error(
        language === "ar" ? "خطأ في تحميل المحتوى" : "Error loading content"
      );
      navigate("/dashboard/my-courses");
    } finally {
      setLoading(false);
    }
  };

  const markContentComplete = async () => {
    if (!currentContent) return;

    try {
      const totalDuration = videoRef.current?.duration || 0;
      await api.post("/mobile/student/progress", {
        courseId: id,
        contentId: currentContent.id,
        watchedDuration: watchedDuration,
        totalDuration: totalDuration,
      });

      setCompletedContents((prev) => new Set([...prev, currentContent.id]));
      
      // Refresh course progress
      const progressResponse = await api.get("/mobile/student/my-courses");
      const progressData = extractDataFromResponse(progressResponse);
      const courses = Array.isArray(progressData.courses) ? progressData.courses : [];
      const currentCourse = courses.find((c) => c.id === id);
      if (currentCourse) {
        setCourseProgress(currentCourse.progress || 0);
      }

      showToast.success(
        language === "ar" ? "تم إكمال الدرس" : "Lesson completed"
      );
    } catch (error) {
      console.error("Error marking content complete:", error);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleFullscreen = () => {
    if (!fullscreen) {
      if (videoRef.current?.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const handleContentSelect = (content) => {
    setCurrentContent(content);
    setProgress(0);
    setWatchedDuration(0);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.load();
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !currentContent) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/dashboard/courses/${id}`)}
              className="w-full sm:w-auto justify-center sm:justify-start"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {language === "ar" ? "العودة" : "Back"}
            </Button>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-center sm:text-right">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">
                  {language === "ar" ? "التقدم" : "Progress"}
                </p>
                <p className="text-lg sm:text-xl font-bold text-amber-600">
                  {Math.round(courseProgress)}%
                </p>
              </div>
              <div className="w-24 sm:w-32 h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-amber-600 rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="relative bg-black aspect-video w-full">
              {currentContent.type === "VIDEO" && currentContent.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    key={`video-${currentContent.id}`}
                    src={getVideoUrl(currentContent.videoUrl)}
                    className="w-full h-full"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={(e) => {
                      // Suppress console errors - only show user-friendly message once
                      if (!e.target.dataset.errorShown) {
                        e.target.dataset.errorShown = 'true';
                        showToast.error(language === "ar" ? "الفيديو غير متاح حالياً" : "Video not available at the moment");
                      }
                    }}
                    onLoadedMetadata={() => {
                      console.log("✅ Video loaded successfully:", {
                        videoUrl: currentContent.videoUrl,
                        fullUrl: getVideoUrl(currentContent.videoUrl),
                        contentId: currentContent.id
                      });
                      if (videoRef.current?.duration && !isNaN(videoRef.current.duration)) {
                        setVideoDuration(videoRef.current.duration);
                      }
                    }}
                    controls
                    preload="metadata"
                    crossOrigin="anonymous"
                  />
                  
                  {/* Video Controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePlayPause}
                        className="text-white hover:bg-white/20"
                      >
                        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMute}
                        className="text-white hover:bg-white/20"
                      >
                        {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1 text-white text-xs px-2">
                        {Math.floor(watchedDuration / 60)}:
                        {String(Math.floor(watchedDuration % 60)).padStart(2, "0")}
                        {" / "}
                        {videoRef.current?.duration
                          ? `${Math.floor(videoRef.current.duration / 60)}:${String(
                              Math.floor(videoRef.current.duration % 60)
                            ).padStart(2, "0")}`
                          : "0:00"}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFullscreen}
                        className="text-white hover:bg-white/20"
                      >
                        {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div
                      className="h-1 bg-black/50 cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="h-full bg-amber-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white">
                    <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">
                      {language === "ar" ? "محتوى نصي أو ملف" : "Text or file content"}
                    </p>
                    {currentContent.fileUrl && (
                      <Button
                        className="mt-4"
                        onClick={() => window.open(getImageUrl(currentContent.fileUrl), "_blank")}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {language === "ar" ? "تحميل الملف" : "Download File"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                  {language === "ar" ? currentContent.titleAr : currentContent.titleEn}
                </h2>
                {currentContent.descriptionAr || currentContent.descriptionEn ? (
                  <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
                    {language === "ar" ? currentContent.descriptionAr : currentContent.descriptionEn}
                  </p>
                ) : null}
                {currentContent.type === "TEXT" && currentContent.content && (
                  <div className="p-4 sm:p-6 bg-gray-50 rounded-xl border-0 shadow-sm">
                    <p className="whitespace-pre-wrap text-sm sm:text-base text-gray-700 leading-relaxed">{currentContent.content}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content List Sidebar */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-gray-900">
                  {language === "ar" ? "محتوى الدورة" : "Course Content"}
                </h3>
              <div className="space-y-3 sm:space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Course Intro Video - Separate from chapter intro */}
                {course.content?.find(c => c.isIntroVideo && !c.chapterId) && (
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="text-sm font-semibold text-primary mb-2">
                      {language === "ar" ? "مقدمة الدورة" : "Course Introduction"}
                    </h4>
                    {course.content
                      .filter(c => c.isIntroVideo && !c.chapterId)
                      .map((content) => (
                        <motion.div
                          key={content.id}
                          onClick={() => handleContentSelect(content)}
                          className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 mb-2 ${
                            currentContent?.id === content.id
                              ? "bg-amber-50 text-amber-900 border-2 border-amber-600 shadow-md"
                              : "bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Video className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${currentContent?.id === content.id ? 'text-amber-600' : 'text-gray-600'}`} />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-xs sm:text-sm line-clamp-2">
                                {language === "ar" ? content.titleAr : content.titleEn}
                              </p>
                              {content.duration && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {content.duration} {language === "ar" ? "دقيقة" : "min"}
                                </p>
                              )}
                            </div>
                            {completedContents.has(content.id) && (
                              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-green-600" />
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                )}

                {/* Chapters */}
                {course.chapters && course.chapters.length > 0 && (
                  <div className="space-y-4">
                    {course.chapters.map((chapter, chapterIndex) => (
                      <div key={chapter.id} className="space-y-2">
                        <h4 className="text-sm font-semibold text-primary mb-2">
                          {language === "ar" ? `الفصل ${chapterIndex + 1}: ${chapter.titleAr}` : `Chapter ${chapterIndex + 1}: ${chapter.titleEn}`}
                        </h4>
                        
                        {/* Chapter Intro Video */}
                        {chapter.content?.find(c => c.isIntroVideo) && (
                          <div className="ml-4 mb-2">
                            {chapter.content
                              .filter(c => c.isIntroVideo)
                              .map((content) => (
                                <motion.div
                                  key={content.id}
                                  onClick={() => handleContentSelect(content)}
                                  className={`p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    currentContent.id === content.id
                                      ? "bg-amber-600 text-white shadow-md"
                                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-xs font-semibold">
                                      {language === "ar" ? "مقدمة الفصل" : "Chapter Intro"}
                                    </span>
                                    {completedContents.has(content.id) && (
                                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 ml-auto" />
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                          </div>
                        )}

                        {/* Chapter Content */}
                        {chapter.content
                          ?.filter(c => !c.isIntroVideo)
                          .map((content, index) => (
                            <motion.div
                              key={content.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (chapterIndex * 10 + index) * 0.05 }}
                              onClick={() => handleContentSelect(content)}
                              className={`ml-2 sm:ml-4 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                currentContent.id === content.id
                                  ? "bg-amber-600 text-white shadow-lg"
                                  : "bg-white hover:bg-amber-50 hover:shadow-md border border-gray-200"
                              }`}
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                                  currentContent.id === content.id
                                    ? "bg-white/20"
                                    : content.type === "VIDEO"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-blue-100 text-blue-600"
                                }`}>
                                  {content.type === "VIDEO" ? (
                                    <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                                  ) : (
                                    <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold text-xs sm:text-sm line-clamp-2 ${
                                    currentContent.id === content.id ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {language === "ar" ? content.titleAr : content.titleEn}
                                  </p>
                                  {(() => {
                                    // For videos, try to get actual duration from video element if it's the current content
                                    let duration = content.duration;
                                    if (content.type === "VIDEO" && videoRef.current?.duration && currentContent.id === content.id) {
                                      duration = Math.round(videoRef.current.duration / 60);
                                    }
                                    return duration ? (
                                      <p className={`text-xs mt-1 ${
                                        currentContent.id === content.id ? 'text-white/80' : 'text-gray-500'
                                      }`}>
                                        <Clock className="w-3 h-3 inline mr-1" />
                                        {duration} {language === "ar" ? "دقيقة" : "min"}
                                      </p>
                                    ) : null;
                                  })()}
                                </div>
                                {completedContents.has(content.id) && (
                                  <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                                    currentContent.id === content.id ? 'text-white' : 'text-green-600'
                                  }`} />
                                )}
                              </div>
                            </motion.div>
                          ))}
                        
                        {/* Chapter Quiz - Show at the end of each chapter */}
                        {(() => {
                          // Find the last content item in the chapter that has a quiz
                          const chapterContent = chapter.content?.filter(c => !c.isIntroVideo) || [];
                          const lastContentWithQuiz = [...chapterContent].reverse().find(c => c.quiz);
                          
                          if (!lastContentWithQuiz || !lastContentWithQuiz.quiz) return null;
                          
                          return (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (chapterIndex * 10 + chapterContent.length) * 0.05 }}
                              onClick={() => {
                                // Navigate to quiz
                                navigate(`/dashboard/courses/${id}/quiz/${lastContentWithQuiz.quiz.id}`);
                              }}
                              className="ml-2 sm:ml-4 mt-3 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-md bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 border-2 border-purple-300 hover:shadow-lg"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm bg-gradient-to-br from-purple-500 to-purple-700 text-white">
                                  <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-xs sm:text-sm text-purple-900">
                                    {language === "ar" ? `اختبار الفصل ${chapterIndex + 1}` : `Chapter ${chapterIndex + 1} Quiz`}
                                  </p>
                                  <p className="text-xs text-purple-700 mt-1">
                                    {lastContentWithQuiz.quiz._count?.questions || 0} {language === "ar" ? "سؤال" : "questions"}
                                  </p>
                                </div>
                                <Award className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-purple-600" />
                              </div>
                            </motion.div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                )}

                {/* Standalone Content (no chapters) */}
                {(!course.chapters || course.chapters.length === 0) && contentList.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleContentSelect(content)}
                    className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      currentContent.id === content.id
                        ? "bg-amber-600 text-white shadow-lg"
                        : "bg-white hover:bg-amber-50 hover:shadow-md border border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        currentContent.id === content.id
                          ? "bg-white/20"
                          : content.type === "VIDEO"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {content.type === "VIDEO" ? (
                          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-xs sm:text-sm line-clamp-2 ${
                          currentContent.id === content.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {language === "ar" ? content.titleAr : content.titleEn}
                        </p>
                        {(() => {
                          // For videos, try to get actual duration from video element if it's the current content
                          let duration = content.duration;
                          if (content.type === "VIDEO" && videoRef.current?.duration && currentContent.id === content.id) {
                            duration = Math.round(videoRef.current.duration / 60);
                          }
                          return duration ? (
                            <p className={`text-xs mt-1 ${
                              currentContent.id === content.id ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3 inline mr-1" />
                              {duration} {language === "ar" ? "دقيقة" : "min"}
                            </p>
                          ) : null;
                        })()}
                      </div>
                      {completedContents.has(content.id) && (
                        <CheckCircle2 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                          currentContent.id === content.id ? 'text-white' : 'text-green-600'
                        }`} />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

