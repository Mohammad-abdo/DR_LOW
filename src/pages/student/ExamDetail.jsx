import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import showToast from "@/lib/toast";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Send,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function ExamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [startedAt, setStartedAt] = useState(null);

  useEffect(() => {
    fetchExam();
  }, [id]);

  useEffect(() => {
    if (exam?.duration && startedAt) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startedAt) / 1000 / 60);
        const remaining = exam.duration - elapsed;
        if (remaining <= 0) {
          clearInterval(interval);
          // Auto submit when time runs out
          handleAutoSubmit();
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [exam, startedAt]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mobile/student/exams/${id}`);
      const data = extractDataFromResponse(response);
      setExam(data.exam);
      setStartedAt(new Date());
      if (data.exam.duration) {
        setTimeRemaining(data.exam.duration);
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      showToast.error(
        language === "ar" ? "فشل تحميل الامتحان" : "Failed to load exam"
      );
      navigate("/dashboard/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من إرسال الإجابات؟" : "Are you sure you want to submit?")) {
      return;
    }

    try {
      setSubmitting(true);
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: String(answer),
      }));

      const response = await api.post(`/mobile/student/exams/${id}/submit`, {
        answers: answersArray,
      });

      const data = extractDataFromResponse(response);
      showToast.success(
        language === "ar" ? "تم إرسال الامتحان بنجاح" : "Exam submitted successfully"
      );
      navigate(`/dashboard/exams/${id}/result`);
    } catch (error) {
      console.error("Error submitting exam:", error);
      showToast.error(
        language === "ar" ? "فشل إرسال الامتحان" : "Failed to submit exam"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    showToast.warning(
      language === "ar" ? "انتهى الوقت! سيتم إرسال الإجابات تلقائياً" : "Time's up! Answers will be submitted automatically"
    );
    handleSubmit();
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}`;
    }
    return `${mins}`;
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

  if (!exam) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/dashboard/exams")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{language === "ar" ? "العودة" : "Back"}</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {language === "ar" ? exam.titleAr : exam.titleEn}
            </h1>
            {exam.descriptionAr && (
              <p className="text-gray-600 mb-4">
                {language === "ar" ? exam.descriptionAr : exam.descriptionEn}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <FileText className="w-4 h-4" />
                <span>
                  {exam.questions?.length || 0}{" "}
                  {language === "ar" ? "سؤال" : "Questions"}
                </span>
              </div>
              {exam.duration && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {exam.duration}{" "}
                    {language === "ar" ? "دقيقة" : "Minutes"}
                  </span>
                </div>
              )}
              {exam.passingScore && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "نسبة النجاح:" : "Passing:"}{" "}
                    {exam.passingScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Timer */}
            {timeRemaining !== null && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-600">
                  {language === "ar" ? "الوقت المتبقي:" : "Time Remaining:"}{" "}
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Questions */}
        <div className="space-y-4 mb-8">
          {exam.questions?.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm p-6"
            >
              <div className="mb-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {language === "ar"
                        ? question.questionAr
                        : question.questionEn}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      {question.type}
                    </span>
                    {question.points && (
                      <span className="ml-2 text-xs text-gray-500">
                        ({question.points}{" "}
                        {language === "ar" ? "نقطة" : "points"})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              {question.type === "MCQ" && question.options ? (
                <div className="space-y-2">
                  {Object.entries(question.options).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={key}
                        checked={answers[question.id] === key}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="flex-1 text-gray-700">
                        {typeof value === "object"
                          ? language === "ar"
                            ? value.textAr || value
                            : value.textEn || value
                          : value}
                      </span>
                    </label>
                  ))}
                </div>
              ) : question.type === "TRUE_FALSE" ? (
                <div className="space-y-2">
                  {["true", "false"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) =>
                          handleAnswerChange(question.id, e.target.value)
                        }
                        className="w-4 h-4 text-amber-600"
                      />
                      <span className="flex-1 text-gray-700">
                        {option === "true"
                          ? language === "ar"
                            ? "صحيح"
                            : "True"
                          : language === "ar"
                          ? "خطأ"
                          : "False"}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answers[question.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  placeholder={
                    language === "ar"
                      ? "اكتب إجابتك هنا..."
                      : "Write your answer here..."
                  }
                  className="w-full p-3 border-2 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  rows={4}
                />
              )}
            </motion.div>
          ))}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 bg-white rounded-2xl shadow-lg p-4 border-2 border-amber-200"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              {language === "ar"
                ? `تم الإجابة على ${Object.keys(answers).length} من ${exam.questions?.length || 0} سؤال`
                : `Answered ${Object.keys(answers).length} of ${exam.questions?.length || 0} questions`}
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>
                    {language === "ar" ? "جاري الإرسال..." : "Submitting..."}
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {language === "ar" ? "إرسال الإجابات" : "Submit Answers"}
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

