import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  Heart,
  ShoppingCart,
  Trash2,
  BookOpen,
  Users,
  Star,
  Clock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import showToast from "@/lib/toast";

export default function Wishlist() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mobile/student/wishlist");
      const data = extractDataFromResponse(response);
      const items = Array.isArray(data.items) ? data.items : [];
      setWishlist(items);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      showToast.error(
        language === "ar" ? "خطأ في تحميل المفضلة" : "Error loading wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      await api.delete(`/mobile/student/wishlist/${courseId}`);
      setWishlist(wishlist.filter((item) => item.courseId !== courseId));
      showToast.success(
        language === "ar" ? "تم الحذف من المفضلة" : "Removed from wishlist"
      );
    } catch (error) {
      showToast.error(
        language === "ar" ? "خطأ في الحذف" : "Error removing item"
      );
    }
  };

  const handleAddToCart = async (courseId) => {
    try {
      await api.post("/mobile/student/cart", { courseId });
      showToast.success(
        language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart"
      );
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في الإضافة" : "Error adding to cart")
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 md:pb-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Modern Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-pink-600 to-red-700 p-6 md:p-8 shadow-xl"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyIDItLjkgMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white drop-shadow-lg flex items-center gap-3">
              <Heart className="w-8 h-8 fill-white" />
              {language === "ar" ? "قائمة المفضلة" : "Wishlist"}
            </h1>
            <p className="text-red-50 text-base md:text-lg">
              {language === "ar"
                ? "الدورات التي أضفتها إلى المفضلة"
                : "Courses you've added to your wishlist"}
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
            <Heart className="w-6 h-6 text-white fill-white" />
            <span className="text-2xl font-bold text-white">{wishlist.length}</span>
          </div>
        </div>
      </motion.div>

      {wishlist.length === 0 ? (
        <Card className="p-16 text-center border-0 shadow-2xl rounded-3xl bg-gradient-to-br from-white to-gray-50">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center">
            <Heart className="w-12 h-12 text-red-500 fill-red-500" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-900">
            {language === "ar" ? "قائمة المفضلة فارغة" : "Wishlist is empty"}
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            {language === "ar"
              ? "ابدأ بإضافة الدورات التي تهمك إلى المفضلة"
              : "Start adding courses you're interested in to your wishlist"}
          </p>
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl h-14 px-8 text-lg font-bold"
          >
            {language === "ar" ? "تصفح الدورات" : "Browse Courses"}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className="overflow-hidden h-full hover:shadow-2xl transition-all duration-300 border-0 bg-white rounded-2xl group cursor-pointer transform hover:-translate-y-2">
                {item.course?.coverImage ? (
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(item.course.coverImage)}
                      alt={language === "ar" ? item.course.titleAr : item.course.titleEn}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-gray-900 shadow-lg">
                        {item.course.level || "BASIC"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.courseId)}
                      className="absolute top-4 left-4 p-2.5 bg-white/95 backdrop-blur-md rounded-full hover:bg-white hover:scale-110 transition-all shadow-lg"
                    >
                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="h-56 bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center group-hover:from-red-600 group-hover:to-pink-700 transition-all">
                    <BookOpen className="w-16 h-16 text-white/50 group-hover:scale-110 transition-transform" />
                  </div>
                )}

                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">
                    {language === "ar" ? item.course?.titleAr : item.course?.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {language === "ar" ? item.course?.descriptionAr : item.course?.descriptionEn}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{item.course?._count?.purchases || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>4.5</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{item.course?._count?.content || 0} {language === "ar" ? "درس" : "lessons"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      {item.course?.discount > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-primary">
                            ${parseFloat(item.course.finalPrice).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground line-through">
                            ${parseFloat(item.course.price).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          ${parseFloat(item.course?.price || 0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAddToCart(item.courseId)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/dashboard/courses/${item.courseId}`)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

