import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  ShoppingCart,
  Trash2,
  BookOpen,
  Users,
  Star,
  Clock,
  Loader2,
  CreditCard,
  ArrowRight,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import showToast from "@/lib/toast";

export default function Cart() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mobile/student/cart");
      const data = extractDataFromResponse(response);
      setCart(data.cart || { items: data.items || [] });
    } catch (error) {
      console.error("Error fetching cart:", error);
      showToast.error(
        language === "ar" ? "خطأ في تحميل السلة" : "Error loading cart"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      await api.delete(`/mobile/student/cart/${courseId}`);
      setCart({
        ...cart,
        items: cart.items.filter((item) => item.courseId !== courseId),
      });
      showToast.success(
        language === "ar" ? "تم الحذف من السلة" : "Removed from cart"
      );
    } catch (error) {
      showToast.error(
        language === "ar" ? "خطأ في الحذف" : "Error removing item"
      );
    }
  };

  const handleClearCart = async () => {
    try {
      await api.delete("/mobile/student/cart");
      setCart({ items: [] });
      showToast.success(
        language === "ar" ? "تم تفريغ السلة" : "Cart cleared"
      );
    } catch (error) {
      showToast.error(
        language === "ar" ? "خطأ في تفريغ السلة" : "Error clearing cart"
      );
    }
  };

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      showToast.error(
        language === "ar" ? "السلة فارغة" : "Cart is empty"
      );
      return;
    }
    navigate("/dashboard/payment", {
      state: { courseIds: cart.items.map((item) => item.courseId) },
    });
  };

  const calculateTotal = () => {
    return cart.items.reduce((sum, item) => {
      return sum + parseFloat(item.course?.finalPrice || item.course?.price || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {language === "ar" ? "سلة التسوق" : "Shopping Cart"}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {language === "ar"
                  ? `${cart.items.length} ${cart.items.length === 1 ? "دورة" : "دورات"} في السلة`
                  : `${cart.items.length} ${cart.items.length === 1 ? "course" : "courses"} in cart`}
              </p>
            </div>
            {cart.items.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <X className="w-4 h-4 mr-2" />
                {language === "ar" ? "تفريغ السلة" : "Clear Cart"}
              </Button>
            )}
          </div>
        </div>
      </section>

      {cart.items.length === 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Card className="p-8 sm:p-12 text-center border-0 shadow-lg">
            <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
              {language === "ar" ? "السلة فارغة" : "Cart is empty"}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {language === "ar"
                ? "ابدأ بإضافة الدورات إلى السلة"
                : "Start adding courses to your cart"}
            </p>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {language === "ar" ? "تصفح الدورات" : "Browse Courses"}
            </Button>
          </Card>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {cart.items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      {item.course?.coverImage ? (
                        <div className="w-full sm:w-40 md:w-48 h-48 sm:h-auto shrink-0">
                          <img
                            src={getImageUrl(item.course.coverImage)}
                            alt={language === "ar" ? item.course.titleAr : item.course.titleEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-full sm:w-40 md:w-48 h-48 sm:h-auto bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shrink-0">
                          <BookOpen className="w-12 h-12 sm:w-14 sm:h-14 text-white/70" />
                        </div>
                      )}

                      <CardContent className="flex-1 p-4 sm:p-5 sm:p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2 sm:mb-3">
                            <h3 className="font-bold text-base sm:text-lg line-clamp-2 flex-1 pr-2">
                              {language === "ar" ? item.course?.titleAr : item.course?.titleEn}
                            </h3>
                            <button
                              onClick={() => handleRemoveFromCart(item.courseId)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                              aria-label={language === "ar" ? "حذف" : "Remove"}
                            >
                              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                            {language === "ar" ? item.course?.descriptionAr : item.course?.descriptionEn}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{item.course?._count?.purchases || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              <span>{item.course?.averageRating ? item.course.averageRating.toFixed(1) : "0.0"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{item.course?._count?.content || 0} {language === "ar" ? "درس" : "lessons"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                          <div>
                            {item.course?.discount > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg sm:text-xl font-bold text-amber-600">
                                  ${parseFloat(item.course.finalPrice).toFixed(2)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  ${parseFloat(item.course.price).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg sm:text-xl font-bold text-amber-600">
                                ${parseFloat(item.course?.price || 0).toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/courses/${item.courseId}`)}
                            className="w-full sm:w-auto"
                          >
                            {language === "ar" ? "عرض التفاصيل" : "View Details"}
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-0 shadow-xl">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-gray-900">
                    {language === "ar" ? "ملخص الطلب" : "Order Summary"}
                  </h2>

                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">
                        {language === "ar" ? "عدد الدورات" : "Courses"}
                      </span>
                      <span className="font-semibold text-gray-900">{cart.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-gray-600">
                        {language === "ar" ? "المجموع الفرعي" : "Subtotal"}
                      </span>
                      <span className="font-semibold text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <div className="flex justify-between">
                        <span className="text-base sm:text-lg font-bold text-gray-900">
                          {language === "ar" ? "الإجمالي" : "Total"}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-amber-600">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={processing || cart.items.length === 0}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {language === "ar" ? "جاري المعالجة..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {language === "ar" ? "إتمام الشراء" : "Proceed to Checkout"}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="w-full mt-3 h-10 sm:h-12"
                  >
                    {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

