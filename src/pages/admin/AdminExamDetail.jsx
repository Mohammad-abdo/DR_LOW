import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Book, Users, Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminExamDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/exams/${id}`);
      const data = extractDataFromResponse(response);
      setExam(data.exam || data);
    } catch (error) {
      console.error("Error fetching exam:", error);
      alert(error.response?.data?.message || "Error loading exam");
      navigate("/admin/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/exams/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Exam deleted successfully");
      navigate("/admin/exams");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting exam");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/exams")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/exams/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? exam.titleAr : exam.titleEn}
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الدورة" : "Course"}</p>
              <p className="font-semibold">
                {language === "ar" ? exam.course?.titleAr : exam.course?.titleEn}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "المدة" : "Duration"}</p>
              <p className="font-semibold">{exam.duration ? `${exam.duration} min` : "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "نقاط النجاح" : "Passing Score"}</p>
              <p className="font-semibold">{parseFloat(exam.passingScore)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ البدء" : "Start Date"}</p>
              <p className="font-semibold">
                {exam.startDate ? format(new Date(exam.startDate), "PPp") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ الانتهاء" : "End Date"}</p>
              <p className="font-semibold">
                {exam.endDate ? format(new Date(exam.endDate), "PPp") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ الإنشاء" : "Created At"}</p>
              <p className="font-semibold">
                {exam.createdAt ? format(new Date(exam.createdAt), "PPp") : "-"}
              </p>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <h3 className="font-semibold mb-2">{language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{exam.descriptionAr || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{exam.descriptionEn || "-"}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Book className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{exam.questions?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الأسئلة" : "Questions"}</p>
            </div>
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{exam.results?.length || 0}</p>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "النتائج" : "Results"}</p>
            </div>
          </div>

          {/* Questions */}
          {exam.questions && exam.questions.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                {language === "ar" ? "الأسئلة" : "Questions"}
              </h3>
              <div className="space-y-4">
                {exam.questions.map((question, index) => (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          {language === "ar" ? question.questionAr : question.questionEn}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {language === "ar" ? "النوع" : "Type"}: {question.type} • {language === "ar" ? "النقاط" : "Points"}: {parseFloat(question.points)}
                        </p>
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-2 mt-3">
                            {question.options.map((option, optIndex) => {
                              // Handle both object format {textAr, textEn} and string format
                              const optionText = typeof option === 'object' && option !== null
                                ? (language === "ar" ? option.textAr : option.textEn)
                                : option;
                              const optionKey = typeof option === 'object' && option !== null
                                ? optIndex.toString()
                                : option;
                              const isCorrect = question.correctAnswer === optIndex.toString() || 
                                               question.correctAnswer === optionKey ||
                                               (typeof option === 'object' && question.correctAnswer === JSON.stringify(option));
                              
                              return (
                                <div
                                  key={optIndex}
                                  className={`p-2 rounded ${
                                    isCorrect
                                      ? "bg-green-50 border border-green-200"
                                      : "bg-gray-50"
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isCorrect ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className={isCorrect ? "font-semibold text-green-800" : ""}>
                                      {optionText || `Option ${optIndex + 1}`}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {exam.results && exam.results.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {language === "ar" ? "النتائج" : "Results"}
              </h3>
              <div className="space-y-2">
                {exam.results.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {language === "ar" ? result.student?.nameAr : result.student?.nameEn}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {result.score}% • {format(new Date(result.createdAt), "PPp")}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${
                      parseFloat(result.score) >= parseFloat(exam.passingScore)
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {parseFloat(result.score) >= parseFloat(exam.passingScore)
                        ? (language === "ar" ? "نجح" : "Passed")
                        : (language === "ar" ? "فشل" : "Failed")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

