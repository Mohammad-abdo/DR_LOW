import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import showToast from "@/lib/toast";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Award,
  FileText,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function ExamResult() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mobile/student/exams/${id}/result`);
      const data = extractDataFromResponse(response);
      setResult(data.result);
    } catch (error) {
      console.error("Error fetching result:", error);
      showToast.error(
        language === "ar" ? "فشل تحميل النتيجة" : "Failed to load result"
      );
      navigate("/dashboard/exams");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-KW" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const passed = result.passed;
  const percentage = parseFloat(result.percentage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/dashboard/exams")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === "ar" ? "العودة" : "Back"}</span>
        </button>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div
              className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                passed ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {passed ? (
                <CheckCircle className="w-12 h-12 text-green-600" />
              ) : (
                <XCircle className="w-12 h-12 text-red-600" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === "ar" ? "نتيجة الامتحان" : "Exam Result"}
            </h1>
            <h2 className="text-xl text-gray-600 mb-4">
              {language === "ar"
                ? result.exam?.titleAr
                : result.exam?.titleEn}
            </h2>
            <div
              className={`text-5xl font-bold mb-2 ${
                passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {percentage.toFixed(1)}%
            </div>
            <p
              className={`text-lg font-semibold ${
                passed ? "text-green-600" : "text-red-600"
              }`}
            >
              {passed
                ? language === "ar"
                  ? "نجحت في الامتحان"
                  : "You Passed!"
                : language === "ar"
                ? "لم تنجح في الامتحان"
                : "You Did Not Pass"}
            </p>
          </div>

          {/* Score Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {result.score}
              </div>
              <div className="text-sm text-gray-600">
                {language === "ar" ? "الدرجة المحصلة" : "Your Score"}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {result.totalScore}
              </div>
              <div className="text-sm text-gray-600">
                {language === "ar" ? "الدرجة الكلية" : "Total Score"}
              </div>
            </div>
          </div>

          {/* Exam Info */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5" />
              <span>
                {language === "ar" ? "تاريخ الإرسال:" : "Submitted:"}{" "}
                {formatDate(result.submittedAt)}
              </span>
            </div>
            {result.exam?.passingScore && (
              <div className="flex items-center gap-3 text-gray-600">
                <Award className="w-5 h-5" />
                <span>
                  {language === "ar" ? "نسبة النجاح المطلوبة:" : "Passing Score:"}{" "}
                  {result.exam.passingScore}%
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Answers Review */}
        {result.answers && result.answers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === "ar" ? "مراجعة الإجابات" : "Answer Review"}
            </h3>
            <div className="space-y-4">
              {result.answers.map((answerItem, index) => {
                const question = answerItem.question;
                const isCorrect = answerItem.isCorrect;
                const points = parseFloat(answerItem.points);

                return (
                  <div
                    key={answerItem.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          isCorrect
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {language === "ar"
                            ? question?.questionAr
                            : question?.questionEn}
                        </h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              {language === "ar" ? "إجابتك:" : "Your Answer:"}{" "}
                            </span>
                            <span
                              className={`text-sm ${
                                isCorrect ? "text-green-700" : "text-red-700"
                              }`}
                            >
                              {answerItem.answer}
                            </span>
                          </div>
                          {!isCorrect && question?.correctAnswer && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">
                                {language === "ar"
                                  ? "الإجابة الصحيحة:"
                                  : "Correct Answer:"}{" "}
                              </span>
                              <span className="text-sm text-green-700">
                                {question.correctAnswer}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {language === "ar" ? "النقاط:" : "Points:"}{" "}
                              {points} / {parseFloat(question?.points || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate("/dashboard/exams")}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {language === "ar" ? "العودة إلى الامتحانات" : "Back to Exams"}
          </button>
        </div>
      </div>
    </div>
  );
}







