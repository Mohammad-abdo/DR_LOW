import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  CreditCard,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import showToast from "@/lib/toast";
import { PAYMENT_METHOD } from "@/lib/constants.js";

export default function Payment() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VISA");
  const [transactionId, setTransactionId] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const courseIds = location.state?.courseIds || [];
    if (courseIds.length === 0) {
      navigate("/dashboard/cart");
      return;
    }
    fetchCourses(courseIds);
  }, [location.state]);

  const fetchCourses = async (courseIds) => {
    try {
      setLoading(true);
      const coursesData = await Promise.all(
        courseIds.map(async (id) => {
          const response = await api.get(`/mobile/student/courses/${id}`);
          const data = extractDataFromResponse(response);
          return data.course || data;
        })
      );
      setCourses(coursesData);
      const total = coursesData.reduce(
        (sum, course) => sum + parseFloat(course.finalPrice || course.price || 0),
        0
      );
      setTotalAmount(total);
    } catch (error) {
      console.error("Error fetching courses:", error);
      showToast.error(
        language === "ar" ? "خطأ في تحميل الدورات" : "Error loading courses"
      );
      navigate("/dashboard/cart");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const courseIds = courses.map((c) => c.id);
      const response = await api.post("/mobile/student/payments", {
        courseIds,
        paymentMethod,
        transactionId: transactionId || undefined,
      });

      if (response.data?.success) {
        showToast.success(
          language === "ar" ? "تمت عملية الدفع بنجاح" : "Payment processed successfully"
        );
        navigate("/dashboard/my-courses");
      }
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "فشلت عملية الدفع" : "Payment failed")
      );
    } finally {
      setProcessing(false);
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
    <div className="space-y-6 pb-20 md:pb-8 max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/dashboard/cart")}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {language === "ar" ? "العودة إلى السلة" : "Back to Cart"}
      </Button>

      <div>
        <h1 className="text-3xl font-bold mb-2">
          {language === "ar" ? "إتمام الدفع" : "Checkout"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "أكمل عملية الدفع لشراء الدورات"
            : "Complete payment to purchase courses"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-gray-200 bg-white shadow-xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {language === "ar" ? "طريقة الدفع" : "Payment Method"}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePayment} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    {language === "ar" ? "اختر طريقة الدفع" : "Select Payment Method"}
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.values(PAYMENT_METHOD || {
                      VISA: "VISA",
                      MASTERCARD: "MASTERCARD",
                      KNET: "KNET",
                      CASH: "CASH",
                      BANK_TRANSFER: "BANK_TRANSFER",
                    }).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === method
                            ? "border-primary bg-primary/10"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {(paymentMethod === "CASH" || paymentMethod === "BANK_TRANSFER") && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "ar" ? "رقم المعاملة (اختياري)" : "Transaction ID (Optional)"}
                    </label>
                    <Input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={language === "ar" ? "أدخل رقم المعاملة" : "Enter transaction ID"}
                    />
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">
                        {language === "ar" ? "ملاحظة مهمة" : "Important Note"}
                      </p>
                      <p className="text-muted-foreground">
                        {language === "ar"
                          ? "لطرق الدفع النقدي والتحويل البنكي، سيتم مراجعة طلبك يدوياً وتفعيله بعد التأكد من الدفع."
                          : "For cash and bank transfer payments, your order will be reviewed manually and activated after payment confirmation."}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
                      {language === "ar" ? "إتمام الدفع" : "Complete Payment"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border border-gray-200 bg-white shadow-xl">
            <CardHeader>
              <h2 className="text-xl font-semibold">
                {language === "ar" ? "ملخص الطلب" : "Order Summary"}
              </h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {courses.map((course) => (
                  <div key={course.id} className="flex gap-3">
                    {course.coverImage ? (
                      <img
                        src={getImageUrl(course.coverImage)}
                        alt={language === "ar" ? course.titleAr : course.titleEn}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-8 h-8 text-white/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">
                        {language === "ar" ? course.titleAr : course.titleEn}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        ${parseFloat(course.finalPrice || course.price || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {language === "ar" ? "عدد الدورات" : "Courses"}
                  </span>
                  <span className="font-medium">{courses.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-bold">
                    {language === "ar" ? "الإجمالي" : "Total"}
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

