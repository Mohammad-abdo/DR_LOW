import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  BookOpen,
  Star,
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Users,
  Award,
  TrendingUp,
  CheckCircle2,
  GraduationCap,
  Clock,
  MessageSquare,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Shield,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [basicCourses, setBasicCourses] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerIntervalRef = useRef(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const categoryIntervalRef = useRef(null);

  useEffect(() => {
    // Force light mode for student view
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    fetchData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      bannerIntervalRef.current = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Change banner every 5 seconds
    }

    return () => {
      if (bannerIntervalRef.current) {
        clearInterval(bannerIntervalRef.current);
      }
    };
  }, [banners.length]);

  // Calculate categories per slide (4 on large screens)
  const categoriesPerSlide = 4;
  const totalCategorySlides = Math.ceil(categories.length / categoriesPerSlide);

  // Auto-rotate categories (optional, can be disabled)
  useEffect(() => {
    if (categories.length > categoriesPerSlide && totalCategorySlides > 1) {
      categoryIntervalRef.current = setInterval(() => {
        setCurrentCategoryIndex((prev) => (prev + 1) % totalCategorySlides);
      }, 6000); // Change every 6 seconds
    }

    return () => {
      if (categoryIntervalRef.current) {
        clearInterval(categoryIntervalRef.current);
      }
    };
  }, [categories.length, totalCategorySlides]);

  const nextCategory = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % totalCategorySlides);
    // Reset auto-rotate timer
    if (categoryIntervalRef.current) {
      clearInterval(categoryIntervalRef.current);
    }
    categoryIntervalRef.current = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % totalCategorySlides);
    }, 6000);
  };

  const prevCategory = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + totalCategorySlides) % totalCategorySlides);
    // Reset auto-rotate timer
    if (categoryIntervalRef.current) {
      clearInterval(categoryIntervalRef.current);
    }
    categoryIntervalRef.current = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % totalCategorySlides);
    }, 6000);
  };

  const goToCategory = (index) => {
    setCurrentCategoryIndex(index);
    // Reset auto-rotate timer
    if (categoryIntervalRef.current) {
      clearInterval(categoryIntervalRef.current);
    }
    categoryIntervalRef.current = setInterval(() => {
      setCurrentCategoryIndex((prev) => (prev + 1) % totalCategorySlides);
    }, 6000);
  };

  const goToBanner = (index) => {
    setCurrentBannerIndex(index);
    // Reset auto-rotate timer
    if (bannerIntervalRef.current) {
      clearInterval(bannerIntervalRef.current);
    }
    bannerIntervalRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  const nextBanner = () => {
    goToBanner((currentBannerIndex + 1) % banners.length);
  };

  const prevBanner = () => {
    goToBanner((currentBannerIndex - 1 + banners.length) % banners.length);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch banners from backend
      try {
        const bannersRes = await api.get("/web/banners?active=true");
        console.log("📢 Full Banners Response:", bannersRes);
        console.log("📢 Response Data:", bannersRes?.data);
        
        // Backend returns: { success: true, data: { banners: [...] } }
        // axios wraps it: bannersRes.data = { success: true, data: { banners: [...] } }
        let bannersList = [];
        const responseData = bannersRes?.data;
        
        // Direct extraction from backend structure
        if (responseData?.success && responseData?.data?.banners) {
          bannersList = Array.isArray(responseData.data.banners) ? responseData.data.banners : [];
          console.log("✅ Extracted from responseData.data.banners");
        } else if (responseData?.data?.banners) {
          bannersList = Array.isArray(responseData.data.banners) ? responseData.data.banners : [];
          console.log("✅ Extracted from responseData.data.banners (no success)");
        } else {
          // Try extractDataFromResponse as fallback
          const bannersData = extractDataFromResponse(bannersRes);
          if (bannersData?.banners && Array.isArray(bannersData.banners)) {
            bannersList = bannersData.banners;
            console.log("✅ Extracted from extractDataFromResponse (banners property)");
          } else if (Array.isArray(bannersData)) {
            bannersList = bannersData;
            console.log("✅ Extracted from extractDataFromResponse (direct array)");
          }
        }
        
        console.log("📋 Raw Banners List:", bannersList);
        console.log("📊 Total banners found:", bannersList.length);
        
        // Filter banners - only keep those with images
        bannersList = bannersList.filter(b => {
          if (!b) return false;
          const hasImage = b.image && typeof b.image === 'string' && b.image.trim() !== '';
          if (!hasImage) {
            console.warn("⚠️ Banner filtered (no image):", b.id || b);
          }
          return hasImage;
        });
        
        console.log("✅ Final Banners:", bannersList.length, "banners");
        if (bannersList.length > 0) {
          bannersList.forEach((b, i) => {
            console.log(`  Banner ${i + 1}:`, {
              id: b.id,
              title: b.titleAr || b.titleEn,
              image: b.image,
              imageUrl: getImageUrl(b.image)
            });
          });
        } else {
          console.warn("⚠️ No banners to display!");
        }
        
        setBanners(bannersList);
        setCurrentBannerIndex(0);
      } catch (bannerError) {
        console.error("❌ Error fetching banners:", bannerError);
        console.error("Response:", bannerError.response?.data);
        console.error("Status:", bannerError.response?.status);
        setBanners([]);
      }

      // Fetch all courses with ratings
      const coursesRes = await api.get("/mobile/student/courses?limit=50");
      const coursesData = extractDataFromResponse(coursesRes);
      const courses = Array.isArray(coursesData.courses) ? coursesData.courses : (Array.isArray(coursesData) ? coursesData : []);

      setAllCourses(courses);
      
      // Basic courses (filter by category or level)
      const basic = courses
        .filter(c => c.level === "BEGINNER" || c.level === "BASIC" || c.category?.nameAr?.includes("أساسي") || c.category?.nameEn?.includes("Basic"))
        .slice(0, 6);
      setBasicCourses(basic);

      // Most popular courses (by purchase count and rating)
      const popular = [...courses]
        .sort((a, b) => {
          const aScore = (a._count?.purchases || 0) * 0.6 + (a.averageRating || 0) * 0.4;
          const bScore = (b._count?.purchases || 0) * 0.6 + (b.averageRating || 0) * 0.4;
          return bScore - aScore;
        })
        .slice(0, 6);
      setPopularCourses(popular);

      // Fetch categories
      try {
        const categoriesRes = await api.get("/web/categories");
        const categoriesData = extractDataFromResponse(categoriesRes);
        const categoriesList = Array.isArray(categoriesData.categories) 
          ? categoriesData.categories 
          : (Array.isArray(categoriesData) ? categoriesData : []);
        setCategories(categoriesList.slice(0, 8));
      } catch (categoryError) {
        console.error("Error fetching categories:", categoryError);
        setCategories([]);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = allCourses.filter((course) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      course.titleAr?.toLowerCase().includes(query) ||
      course.titleEn?.toLowerCase().includes(query) ||
      course.descriptionAr?.toLowerCase().includes(query) ||
      course.descriptionEn?.toLowerCase().includes(query)
    );
  });

  const getUserName = () => {
    if (language === "ar") {
      return user?.nameAr || user?.nameEn || "طالب";
    }
    return user?.nameEn || user?.nameAr || "Student";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* BANNER CAROUSEL SECTION */}
      <section className="py-4 sm:py-6">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {banners && banners.length > 0 ? (
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-r from-amber-500 to-amber-700 shadow-lg group">
              {/* Banner Images */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentBannerIndex}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  {banners[currentBannerIndex]?.image ? (
                    <img
                      src={getImageUrl(banners[currentBannerIndex].image)}
                      alt={language === "ar" ? banners[currentBannerIndex].titleAr || "Banner" : banners[currentBannerIndex].titleEn || "Banner"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error("❌ Banner image failed to load:", {
                          attemptedUrl: e.target.src,
                          bannerId: banners[currentBannerIndex]?.id,
                          imagePath: banners[currentBannerIndex]?.image,
                          constructedUrl: getImageUrl(banners[currentBannerIndex]?.image),
                          banner: banners[currentBannerIndex]
                        });
                        // Show fallback but don't hide completely
                        e.target.style.opacity = '0.3';
                      }}
                      onLoad={(e) => {
                        console.log("✅ Banner image loaded successfully:", {
                          url: e.target.src,
                          bannerId: banners[currentBannerIndex]?.id,
                          title: language === "ar" ? banners[currentBannerIndex]?.titleAr : banners[currentBannerIndex]?.titleEn
                        });
                      }}
                    />
                  ) : (
                    <div className="w-full h-full "></div>
                  )}
                  <div className=" "></div>
                  <div className="absolute  flex items-center justify-center">
                    <div className="text-center text-white px-4 sm:px-6">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                        {language === "ar" ? banners[currentBannerIndex]?.titleAr || "مرحباً" : banners[currentBannerIndex]?.titleEn || "Welcome"}
                      </h2>
                      {(banners[currentBannerIndex]?.descriptionAr || banners[currentBannerIndex]?.descriptionEn) && (
                        <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">
                          {language === "ar" ? banners[currentBannerIndex]?.descriptionAr : banners[currentBannerIndex]?.descriptionEn}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows - Always visible if more than 1 banner */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg"
                    aria-label="Previous banner"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                  <button
                    onClick={nextBanner}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg"
                    aria-label="Next banner"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </button>
                </>
              )}

              {/* Dots Indicator - Always visible if more than 1 banner */}
              {banners.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {banners.map((banner, index) => (
                    <button
                      key={banner.id || index}
                      onClick={() => goToBanner(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentBannerIndex
                          ? 'w-8 bg-white shadow-lg'
                          : 'w-2.5 bg-white/60 hover:bg-white/80'
                      }`}
                      aria-label={`Go to banner ${index + 1}`}
                      title={language === "ar" ? banner.titleAr : banner.titleEn}
                    />
                  ))}
                </div>
              )}
              
              {/* Banner Counter */}
              {banners.length > 1 && (
                <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-medium z-10">
                  {currentBannerIndex + 1} / {banners.length}
                </div>
              )}
            </div>
          ) : (
            !loading && (
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden bg-gradient-to-r from-amber-500 to-amber-700 shadow-lg flex items-center justify-center">
                <div className="text-center text-white px-4 sm:px-6">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                    {language === "ar" ? "مرحباً بك" : "Welcome"}
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">
                    {language === "ar" ? "ابدأ رحلتك التعليمية اليوم" : "Start your learning journey today"}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* NEW COURSE SECTIONS */}
      <section className="py-6 sm:py-8 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {basicCourses.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {language === "ar" ? "دورات أساسية" : "Basic Courses"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/all-courses")}
                className="text-amber-600 hover:text-amber-700"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {basicCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                >
                  {course.coverImage ? (
                    <div className="relative h-48">
                      <img
                        src={getImageUrl(course.coverImage)}
                        alt={language === "ar" ? course.titleAr : course.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                      {language === "ar" ? course.titleAr : course.titleEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        ${parseFloat(course.finalPrice || course.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {popularCourses.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {language === "ar" ? "الأكثر شعبية" : "Most Popular"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/all-courses")}
                className="text-amber-600 hover:text-amber-700"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {popularCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                >
                  {course.coverImage ? (
                    <div className="relative h-48">
                      <img
                        src={getImageUrl(course.coverImage)}
                        alt={language === "ar" ? course.titleAr : course.titleEn}
                        className="w-full h-full object-cover"
                      />
                      {course.averageRating > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 rounded-full">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-bold text-gray-900">
                            {course.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                      {language === "ar" ? course.titleAr : course.titleEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        ${parseFloat(course.finalPrice || course.price || 0).toFixed(2)}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.averageRating ? course.averageRating.toFixed(1) : "0.0"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredCourses.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                {language === "ar" ? "جميع الدورات" : "All Courses"}
              </h2>
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/all-courses")}
                className="text-amber-600 hover:text-amber-700"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredCourses.slice(0, 8).map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                  onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                >
                  {course.coverImage ? (
                    <div className="relative h-48">
                      <img
                        src={getImageUrl(course.coverImage)}
                        alt={language === "ar" ? course.titleAr : course.titleEn}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                      {language === "ar" ? course.titleAr : course.titleEn}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-amber-600">
                        ${parseFloat(course.finalPrice || course.price || 0).toFixed(2)}
                      </span>
                      {course.averageRating > 0 && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{course.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Categories Section - Card Carousel */}
      {categories.length > 0 && (
        <section className="py-8 sm:py-12 bg-white overflow-x-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                {language === "ar" ? "استكشف الفئات" : "Explore Categories"}
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                {language === "ar" 
                  ? "اختر من بين مجموعة واسعة من الفئات التعليمية"
                  : "Choose from a wide range of educational categories"}
              </p>
            </div>
            
            {/* Carousel Container */}
            <div className="relative">
              {/* Categories Carousel */}
              <div className="relative overflow-hidden rounded-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCategoryIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {categories
                      .slice(
                        currentCategoryIndex * categoriesPerSlide,
                        (currentCategoryIndex + 1) * categoriesPerSlide
                      )
                      .map((category, index) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -8, scale: 1.05 }}
                          className="group"
                        >
                          <Card
                            className="cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden h-full bg-white"
                            onClick={() => navigate(`/dashboard/all-courses?category=${category.id}`)}
                          >
                            {category.image ? (
                              <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100">
                                <img
                                  src={getImageUrl(category.image)}
                                  alt={language === "ar" ? category.nameAr : category.nameEn}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              </div>
                            ) : (
                              <div className="h-40 sm:h-48 bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center group-hover:from-amber-500 group-hover:to-amber-700 transition-all duration-300">
                                <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 text-white/90 group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            )}
                            <CardContent className="p-4 sm:p-5 text-center">
                              <h3 className="font-bold text-base sm:text-lg line-clamp-2 text-gray-900 mb-2 group-hover:text-amber-600 transition-colors duration-300 min-h-[3rem] sm:min-h-[3.5rem]">
                                {language === "ar" ? category.nameAr : category.nameEn}
                              </h3>
                              {category._count?.courses !== undefined && (
                                <p className="text-sm sm:text-base text-gray-500 font-medium">
                                  {category._count.courses || 0} {language === "ar" ? "دورة" : "courses"}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Arrows - Only show if more than 4 categories */}
              {categories.length > categoriesPerSlide && totalCategorySlides > 1 && (
                <>
                  <button
                    onClick={prevCategory}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg border border-gray-200"
                    aria-label="Previous categories"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextCategory}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg border border-gray-200"
                    aria-label="Next categories"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {categories.length > categoriesPerSlide && totalCategorySlides > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: totalCategorySlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToCategory(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentCategoryIndex
                          ? 'w-8 bg-amber-600 shadow-lg'
                          : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to category slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {/* Category Counter */}
              {categories.length > categoriesPerSlide && totalCategorySlides > 1 && (
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-600 font-medium">
                    {currentCategoryIndex + 1} / {totalCategorySlides}
                  </span>
                </div>
              )}
            </div>

            {/* View All Button */}
            {categories.length > categoriesPerSlide && (
              <div className="text-center mt-6 sm:mt-8">
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard/all-courses")}
                  className="border-amber-600 text-amber-600 hover:bg-amber-50 hover:border-amber-700 hover:text-amber-700"
                >
                  {language === "ar" ? "عرض جميع الفئات" : "View All Categories"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Statistics Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-amber-50 to-amber-100 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">
              {allCourses.length}+
            </div>
            <div className="text-sm md:text-base text-gray-700">
              {language === "ar" ? "دورة متاحة" : "Available Courses"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">
              {categories.length}+
            </div>
            <div className="text-sm md:text-base text-gray-700">
              {language === "ar" ? "فئة" : "Categories"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">
              1000+
            </div>
            <div className="text-sm md:text-base text-gray-700">
              {language === "ar" ? "طالب نشط" : "Active Students"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-amber-700 mb-2">
              50+
            </div>
            <div className="text-sm md:text-base text-gray-700">
              {language === "ar" ? "مدرس محترف" : "Expert Teachers"}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-8 sm:py-12 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {language === "ar" ? "لماذا تختارنا؟" : "Why Choose Us?"}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {language === "ar" 
                ? "نوفر لك أفضل تجربة تعليمية مع محتوى عالي الجودة ودعم مستمر"
                : "We provide you with the best learning experience with high-quality content and continuous support"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Award className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === "ar" ? "شهادات معتمدة" : "Certified Certificates"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "احصل على شهادات معتمدة بعد إكمال الدورات"
                  : "Get certified certificates after completing courses"}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === "ar" ? "مدرسون محترفون" : "Expert Teachers"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "تعلم من أفضل المدرسين في مجالاتهم"
                  : "Learn from the best teachers in their fields"}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === "ar" ? "تعلم في أي وقت" : "Learn Anytime"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "ادرس في الوقت والمكان المناسبين لك"
                  : "Study at the time and place that suits you"}
              </p>
            </CardContent>
          </Card>
          <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Shield className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {language === "ar" ? "ضمان الجودة" : "Quality Guarantee"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "محتوى عالي الجودة ومحدث باستمرار"
                  : "High-quality content that is constantly updated"}
              </p>
            </CardContent>
          </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 sm:py-12 bg-gray-50 overflow-x-hidden">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              {language === "ar" ? "مميزات منصتنا" : "Platform Features"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex items-start gap-4 p-6 bg-white rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === "ar" ? "تعلم سريع" : "Fast Learning"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "محتوى منظم يساعدك على التعلم بسرعة"
                  : "Organized content that helps you learn quickly"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === "ar" ? "أهداف واضحة" : "Clear Goals"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "حدد أهدافك وتتبع تقدمك"
                  : "Set your goals and track your progress"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 bg-white rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {language === "ar" ? "دعم مستمر" : "Continuous Support"}
              </h3>
              <p className="text-gray-600 text-sm">
                {language === "ar" 
                  ? "فريق دعم جاهز لمساعدتك في أي وقت"
                  : "Support team ready to help you anytime"}
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>
    </div>
  );
}
