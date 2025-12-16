import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import showToast from "@/lib/toast";
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  Calendar,
  GraduationCap,
} from "lucide-react";

export default function Exams() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, completed

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching exams...");
      const response = await api.get("/mobile/student/exams");
      console.log("📦 Exams API Response:", response);
      const data = extractDataFromResponse(response);
      console.log("📋 Extracted Data:", data);
      const examsList = Array.isArray(data.exams) ? data.exams : [];
      console.log("✅ Exams List:", examsList);
      setExams(examsList);
      
      if (examsList.length === 0 && data.message) {
        showToast.info(data.messageAr || data.message);
      }
    } catch (error) {
      console.error("❌ Error fetching exams:", error);
      console.error("Error details:", error.response?.data || error.message);
      showToast.error(
        language === "ar"
          ? "فشل تحميل الامتحانات"
          : "Failed to load exams"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (filter === "pending") {
      return !exam.results || exam.results.length === 0 || !exam.results[0]?.submittedAt;
    }
    if (filter === "completed") {
      return exam.results && exam.results.length > 0 && exam.results[0]?.submittedAt;
    }
    return true;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ar" ? "ar-KW" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getExamStatus = (exam) => {
    if (!exam.results || exam.results.length === 0) {
      return {
        status: "pending",
        label: language === "ar" ? "لم يتم البدء" : "Not Started",
        icon: Clock,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
      };
    }

    const result = exam.results[0];
    if (!result.submittedAt) {
      return {
        status: "in-progress",
        label: language === "ar" ? "قيد التنفيذ" : "In Progress",
        icon: Clock,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      };
    }

    if (result.passed) {
      return {
        status: "passed",
        label: language === "ar" ? "نجح" : "Passed",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    }

    return {
      status: "failed",
      label: language === "ar" ? "رسب" : "Failed",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    };
  };

  const handleStartExam = (examId) => {
    navigate(`/dashboard/exams/${examId}`);
  };

  const handleViewResult = (examId) => {
    navigate(`/dashboard/exams/${examId}/result`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <FileText className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {language === "ar" ? "الامتحانات" : "My Exams"}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === "ar"
                  ? "عرض وإدارة جميع امتحاناتك"
                  : "View and manage all your exams"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-3 flex-wrap"
        >
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {language === "ar" ? "الكل" : "All"}
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {language === "ar" ? "قيد الانتظار" : "Pending"}
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "completed"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {language === "ar" ? "مكتملة" : "Completed"}
          </button>
        </motion.div>

        {/* Exams List */}
        {filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="p-4 bg-white rounded-2xl shadow-sm inline-block mb-4">
              <FileText className="w-16 h-16 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {language === "ar" ? "لا توجد امتحانات" : "No Exams Found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {language === "ar"
                ? exams.length === 0
                  ? "لا توجد امتحانات متاحة. يرجى شراء الكورسات أولاً."
                  : `لا توجد امتحانات في فئة "${filter === "pending" ? (language === "ar" ? "قيد الانتظار" : "Pending") : filter === "completed" ? (language === "ar" ? "مكتملة" : "Completed") : (language === "ar" ? "الكل" : "All")}"`
                : exams.length === 0
                ? "No exams available. Please purchase courses first."
                : `No exams found in "${filter === "pending" ? "Pending" : filter === "completed" ? "Completed" : "All"}" category`}
            </p>
            {exams.length === 0 && (
              <button
                onClick={() => navigate("/dashboard/all-courses")}
                className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {language === "ar" ? "تصفح الكورسات" : "Browse Courses"}
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, index) => {
              const status = getExamStatus(exam);
              const StatusIcon = status.icon;
              const result = exam.results?.[0];

              return (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {/* Course Info */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-gray-600">
                        {language === "ar"
                          ? exam.course?.titleAr
                          : exam.course?.titleEn}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {language === "ar" ? exam.titleAr : exam.titleEn}
                    </h3>
                    {exam.descriptionAr && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {language === "ar"
                          ? exam.descriptionAr
                          : exam.descriptionEn}
                      </p>
                    )}
                  </div>

                  {/* Exam Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>
                        {exam._count?.questions || 0}{" "}
                        {language === "ar" ? "سؤال" : "Questions"}
                      </span>
                    </div>
                    {exam.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {exam.duration}{" "}
                          {language === "ar" ? "دقيقة" : "Minutes"}
                        </span>
                      </div>
                    )}
                    {exam.passingScore && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4" />
                        <span>
                          {language === "ar" ? "نسبة النجاح:" : "Passing:"}{" "}
                          {exam.passingScore}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${status.bgColor} ${status.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    <span>{status.label}</span>
                  </div>

                  {/* Result Info (if completed) */}
                  {result?.submittedAt && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {language === "ar" ? "النتيجة" : "Score"}
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            result.passed ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {result.percentage != null 
                            ? (typeof result.percentage === 'number' 
                                ? result.percentage.toFixed(1) 
                                : parseFloat(result.percentage)?.toFixed(1) || '0.0')
                            : '0.0'}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {result.score != null ? result.score : 0} / {result.totalScore != null ? result.totalScore : 0}
                        </span>
                        <span>
                          {formatDate(result.submittedAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!result?.submittedAt ? (
                      <button
                        onClick={() => handleStartExam(exam.id)}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <GraduationCap className="w-4 h-4" />
                        {language === "ar" ? "بدء الامتحان" : "Start Exam"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewResult(exam.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Award className="w-4 h-4" />
                        {language === "ar" ? "عرض النتيجة" : "View Result"}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

