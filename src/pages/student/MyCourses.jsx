import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  BookOpen,
  Play,
  Clock,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyCourses() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categorized, setCategorized] = useState({
    notStarted: [],
    inProgress: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mobile/student/my-courses");
      const data = extractDataFromResponse(response);
      
      const coursesList = Array.isArray(data.courses) ? data.courses : [];
      setCourses(coursesList);
      
      if (data.categorized) {
        setCategorized({
          notStarted: data.categorized.notStarted || [],
          inProgress: data.categorized.inProgress || [],
          completed: data.categorized.completed || [],
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCoursesToShow = () => {
    switch (activeTab) {
      case "not_started":
        return categorized.notStarted;
      case "in_progress":
        return categorized.inProgress;
      case "completed":
        return categorized.completed;
      default:
        return courses;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const coursesToShow = getCoursesToShow();

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
            {language === "ar" ? "دوراتي" : "My Courses"}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            {language === "ar"
              ? "إدارة وتتبع تقدمك في الدورات"
              : "Manage and track your course progress"}
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white border rounded-lg p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 text-xs sm:text-sm py-2 sm:py-2.5"
            >
              {language === "ar" ? "الكل" : "All"} ({courses.length})
            </TabsTrigger>
            <TabsTrigger 
              value="not_started" 
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 text-xs sm:text-sm py-2 sm:py-2.5"
            >
              {language === "ar" ? "لم تبدأ" : "Not Started"} ({categorized.notStarted.length})
            </TabsTrigger>
            <TabsTrigger 
              value="in_progress" 
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 text-xs sm:text-sm py-2 sm:py-2.5"
            >
              {language === "ar" ? "قيد التقدم" : "In Progress"} ({categorized.inProgress.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900 text-xs sm:text-sm py-2 sm:py-2.5"
            >
              {language === "ar" ? "مكتملة" : "Completed"} ({categorized.completed.length})
            </TabsTrigger>
          </TabsList>

        <TabsContent value={activeTab} className="mt-4 sm:mt-6">
          {coursesToShow.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-base sm:text-lg text-muted-foreground">
                {language === "ar" ? "لا توجد دورات" : "No courses found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
              {coursesToShow.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <Card 
                    className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border border-gray-200 cursor-pointer"
                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                  >
                    {course.coverImage ? (
                      <div className="relative h-40 sm:h-48 overflow-hidden">
                        <img
                          src={getImageUrl(course.coverImage)}
                          alt={language === "ar" ? course.titleAr : course.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        {course.status === "completed" && (
                          <div className="absolute top-2 right-2 w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-lg z-10">
                            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                          </div>
                        )}
                        {course.progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                            <div
                              className="h-full bg-amber-600 transition-all duration-300"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 sm:h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-white/70" />
                      </div>
                    )}

                    <CardContent className="p-3 sm:p-4">
                      <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 line-clamp-2 text-gray-900 min-h-[2.5rem] sm:min-h-[3rem]">
                        {language === "ar" ? course.titleAr : course.titleEn}
                      </h3>
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                          <span className="text-xs sm:text-sm text-gray-600">
                            {language === "ar" ? "التقدم" : "Progress"}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-amber-600">
                            {Math.round(course.progress || 0)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">
                            {course.completedContent || 0} / {course.totalContent || 0}
                          </span>
                        </div>
                        <Button 
                          size="sm" 
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-8 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/learning/${course.id}`);
                          }}
                        >
                          {course.status === "completed" ? (
                            <>
                              <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">{language === "ar" ? "مراجعة" : "Review"}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">{language === "ar" ? "متابعة" : "Continue"}</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

