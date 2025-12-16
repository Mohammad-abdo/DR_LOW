import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  BookOpen,
  Star,
  Search,
  Filter,
  X,
  Loader2,
  Users,
  Clock,
  DollarSign,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AllCourses() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Filters - Initialize search from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [durationRange, setDurationRange] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Update search query from URL params
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    
    let isMounted = true;
    
    const loadData = async () => {
      if (!isMounted) return;
      await fetchData();
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [searchParams]); // Only re-run when searchParams changes

  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    // Debounce fetchCourses to prevent too many requests
    const debouncedFetch = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        if (isMounted) {
          fetchCourses();
        }
      }, 500); // 500ms debounce
    };
    
    debouncedFetch();
    
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [selectedCategory, selectedTeacher, priceRange, durationRange, sortBy, searchQuery]);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesRes = await api.get("/web/categories");
      const categoriesData = extractDataFromResponse(categoriesRes);
      setCategories(Array.isArray(categoriesData.categories) ? categoriesData.categories : []);

      // Fetch teachers from courses
      const coursesRes = await api.get("/mobile/student/courses?limit=100");
      const coursesData = extractDataFromResponse(coursesRes);
      const allCourses = Array.isArray(coursesData.courses) ? coursesData.courses : [];
      
      // Extract unique teachers
      const uniqueTeachers = [];
      const teacherMap = new Map();
      allCourses.forEach(course => {
        if (course.teacher && !teacherMap.has(course.teacher.id)) {
          teacherMap.set(course.teacher.id, course.teacher);
          uniqueTeachers.push(course.teacher);
        }
      });
      setTeachers(uniqueTeachers);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      // Always fetch all courses first
      const response = await api.get("/mobile/student/courses?limit=100");
      const data = extractDataFromResponse(response);
      let allCourses = Array.isArray(data.courses) ? data.courses : (Array.isArray(data) ? data : []);
      
      // Apply search filter first
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        allCourses = allCourses.filter(c => 
          (c.titleAr?.toLowerCase().includes(query) || 
           c.titleEn?.toLowerCase().includes(query) ||
           c.descriptionAr?.toLowerCase().includes(query) ||
           c.descriptionEn?.toLowerCase().includes(query))
        );
      }

      // Apply category filter
      if (selectedCategory) {
        allCourses = allCourses.filter(c => 
          c.categoryId === selectedCategory || 
          c.category?.id === selectedCategory
        );
      }

      // Apply teacher filter
      if (selectedTeacher) {
        allCourses = allCourses.filter(c => 
          c.teacherId === selectedTeacher || 
          c.teacher?.id === selectedTeacher
        );
      }

      // Apply price filter
      if (priceRange) {
        const [min, max] = priceRange.split("-").map(Number);
        allCourses = allCourses.filter(c => {
          const price = parseFloat(c.finalPrice || c.price || 0);
          if (max && !isNaN(max)) {
            return price >= min && price <= max;
          }
          return price >= min;
        });
      }

      // Apply duration filter
      if (durationRange) {
        const [min, max] = durationRange.split("-").map(Number);
        allCourses = allCourses.filter(c => {
          const duration = c._count?.content || c.content?.length || 0;
          if (max && !isNaN(max)) {
            return duration >= min && duration <= max;
          }
          return duration >= min;
        });
      }

      // Sort
      if (sortBy === "newest") {
        allCourses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === "oldest") {
        allCourses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortBy === "price-low") {
        allCourses.sort((a, b) => parseFloat(a.finalPrice || a.price || 0) - parseFloat(b.finalPrice || b.price || 0));
      } else if (sortBy === "price-high") {
        allCourses.sort((a, b) => parseFloat(b.finalPrice || b.price || 0) - parseFloat(a.finalPrice || a.price || 0));
      } else if (sortBy === "rating") {
        allCourses.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      } else if (sortBy === "popular") {
        allCourses.sort((a, b) => (b._count?.purchases || 0) - (a._count?.purchases || 0));
      }

      setCourses(allCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("");
    setSelectedTeacher("");
    setPriceRange("");
    setDurationRange("");
    setSearchQuery("");
    setSortBy("newest");
  };

  const hasActiveFilters = selectedCategory || selectedTeacher || priceRange || durationRange || searchQuery;

  if (loading && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {language === "ar" ? "جميع الكورسات" : "All Courses"}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {language === "ar" 
                ? `تم العثور على ${courses.length} دورة` 
                : `Found ${courses.length} courses`}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
          >
            <Filter className="w-4 h-4 mr-2" />
            {language === "ar" ? "فلتر" : "Filter"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Sidebar Filters */}
        <div className={`${sidebarOpen ? "block" : "hidden"} lg:block lg:sticky lg:top-6 lg:self-start`}>
          <Card className="sticky top-6 border-0 shadow-lg bg-white">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  {language === "ar" ? "الفلاتر" : "Filters"}
                </h2>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-amber-700 hover:text-amber-800"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {language === "ar" ? "مسح" : "Clear"}
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "بحث" : "Search"}
                  </label>
                  <Input
                    type="text"
                    placeholder={language === "ar" ? "ابحث عن دورة..." : "Search for a course..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "الفئة" : "Category"}
                  </label>
                  <Select value={selectedCategory} onValueChange={(value) => {
                    setSelectedCategory(value);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "جميع الفئات" : "All Categories"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === "ar" ? "جميع الفئات" : "All Categories"}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {language === "ar" ? category.nameAr : category.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Teacher Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "المعلم" : "Teacher"}
                  </label>
                  <Select value={selectedTeacher} onValueChange={(value) => {
                    setSelectedTeacher(value);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "جميع المعلمين" : "All Teachers"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === "ar" ? "جميع المعلمين" : "All Teachers"}</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {language === "ar" ? teacher.nameAr : teacher.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "السعر" : "Price"}
                  </label>
                  <Select value={priceRange} onValueChange={(value) => {
                    setPriceRange(value);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "جميع الأسعار" : "All Prices"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === "ar" ? "جميع الأسعار" : "All Prices"}</SelectItem>
                      <SelectItem value="0-50">$0 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200-">$200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "المدة (دروس)" : "Duration (Lessons)"}
                  </label>
                  <Select value={durationRange} onValueChange={(value) => {
                    setDurationRange(value);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "جميع المدد" : "All Durations"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === "ar" ? "جميع المدد" : "All Durations"}</SelectItem>
                      <SelectItem value="0-10">0 - 10 {language === "ar" ? "دروس" : "lessons"}</SelectItem>
                      <SelectItem value="10-20">10 - 20 {language === "ar" ? "دروس" : "lessons"}</SelectItem>
                      <SelectItem value="20-30">20 - 30 {language === "ar" ? "دروس" : "lessons"}</SelectItem>
                      <SelectItem value="30-">30+ {language === "ar" ? "دروس" : "lessons"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {language === "ar" ? "ترتيب حسب" : "Sort By"}
                  </label>
                  <Select value={sortBy} onValueChange={(value) => {
                    setSortBy(value);
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
                      <SelectItem value="oldest">{language === "ar" ? "الأقدم" : "Oldest"}</SelectItem>
                      <SelectItem value="price-low">{language === "ar" ? "السعر: منخفض إلى عالي" : "Price: Low to High"}</SelectItem>
                      <SelectItem value="price-high">{language === "ar" ? "السعر: عالي إلى منخفض" : "Price: High to Low"}</SelectItem>
                      <SelectItem value="rating">{language === "ar" ? "التقييم" : "Rating"}</SelectItem>
                      <SelectItem value="popular">{language === "ar" ? "الأكثر شعبية" : "Most Popular"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="lg:col-span-3">
          {courses.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-base sm:text-lg text-gray-600">
                {language === "ar" ? "لا توجد دورات متاحة" : "No courses available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                  className="cursor-pointer"
                >
                  <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white rounded-xl group">
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
                        {course.averageRating > 0 && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-900">
                              {course.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-40 sm:h-48 bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-white/70" />
                      </div>
                    )}
                    <CardContent className="p-4 sm:p-5">
                      <h3 className="font-bold text-base sm:text-lg line-clamp-2 mb-2 sm:mb-3 text-gray-900 min-h-[3rem] sm:min-h-[3.5rem]">
                        {language === "ar" ? course.titleAr : course.titleEn}
                      </h3>
                      {course.teacher && (
                        <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-600">
                          <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{language === "ar" ? course.teacher.nameAr : course.teacher.nameEn}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm font-semibold text-gray-900">
                            {course.averageRating ? course.averageRating.toFixed(1) : "0.0"}
                          </span>
                          <span className="text-xs text-gray-500 hidden sm:inline">
                            ({course.ratingCount || course._count?.ratings || 0})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{course._count?.content || 0} {language === "ar" ? "درس" : "lessons"}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-lg sm:text-xl font-bold text-amber-600">
                          ${parseFloat(course.finalPrice || course.price || 0).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span>{course._count?.purchases || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

