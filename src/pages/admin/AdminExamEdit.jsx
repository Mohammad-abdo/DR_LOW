import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Plus, X, Trash2 } from "lucide-react";

export default function AdminExamEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    duration: "",
    passingScore: "60",
    startDate: "",
    endDate: "",
  });
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "MCQ",
    questionAr: "",
    questionEn: "",
    points: "1",
    order: 0,
    options: [],
    correctAnswer: "",
    optionTextAr: "",
    optionTextEn: "",
  });

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/exams/${id}`);
      const data = extractDataFromResponse(response);
      const exam = data.exam || data;
      
      setFormData({
        courseId: exam.courseId || "",
        titleAr: exam.titleAr || "",
        titleEn: exam.titleEn || "",
        descriptionAr: exam.descriptionAr || "",
        descriptionEn: exam.descriptionEn || "",
        duration: exam.duration?.toString() || "",
        passingScore: exam.passingScore?.toString() || "60",
        startDate: exam.startDate ? new Date(exam.startDate).toISOString().slice(0, 16) : "",
        endDate: exam.endDate ? new Date(exam.endDate).toISOString().slice(0, 16) : "",
      });

      // Fetch questions
      if (exam.questions && Array.isArray(exam.questions)) {
        const formattedQuestions = exam.questions.map((q, index) => ({
          id: q.id,
          type: q.type,
          questionAr: q.questionAr,
          questionEn: q.questionEn,
          points: q.points?.toString() || "1",
          order: q.order || index + 1,
          options: q.options || [],
          correctAnswer: q.correctAnswer || "",
        }));
        setQuestions(formattedQuestions);
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      alert(error.response?.data?.message || "Error loading exam");
      navigate("/admin/exams");
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => {
    if (currentQuestion.optionTextAr && currentQuestion.optionTextEn) {
      const newOption = {
        textAr: currentQuestion.optionTextAr,
        textEn: currentQuestion.optionTextEn,
      };
      setCurrentQuestion({
        ...currentQuestion,
        options: [...currentQuestion.options, newOption],
        optionTextAr: "",
        optionTextEn: "",
      });
    }
  };

  const removeOption = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((_, i) => i !== index),
    });
  };

  const addQuestion = async () => {
    if (!currentQuestion.questionAr || !currentQuestion.questionEn) {
      alert(language === "ar" ? "يرجى إدخال نص السؤال" : "Please enter question text");
      return;
    }

    if (currentQuestion.type === "MCQ" && currentQuestion.options.length < 2) {
      alert(language === "ar" ? "يرجى إضافة خيارين على الأقل" : "Please add at least 2 options");
      return;
    }

    if (currentQuestion.type === "MCQ" && !currentQuestion.correctAnswer) {
      alert(language === "ar" ? "يرجى تحديد الإجابة الصحيحة" : "Please select correct answer");
      return;
    }

    if (currentQuestion.type !== "MCQ" && !currentQuestion.correctAnswer) {
      alert(language === "ar" ? "يرجى إدخال الإجابة الصحيحة" : "Please enter correct answer");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        type: currentQuestion.type,
        questionAr: currentQuestion.questionAr,
        questionEn: currentQuestion.questionEn,
        points: parseFloat(currentQuestion.points) || 1,
        order: editingQuestionIndex !== null ? questions[editingQuestionIndex].order : questions.length + 1,
        options: currentQuestion.type === "MCQ" ? currentQuestion.options : null,
        correctAnswer: currentQuestion.correctAnswer,
      };

      if (editingQuestionIndex !== null) {
        // Update existing question
        const questionId = questions[editingQuestionIndex].id;
        await api.put(`/admin/exams/${id}/questions/${questionId}`, payload);
        const updatedQuestions = [...questions];
        updatedQuestions[editingQuestionIndex] = {
          ...updatedQuestions[editingQuestionIndex],
          ...payload,
          options: payload.options,
        };
        setQuestions(updatedQuestions);
        setEditingQuestionIndex(null);
      } else {
        // Add new question
        const response = await api.post(`/admin/exams/${id}/questions`, payload);
        const newQuestion = {
          id: response.data.data.question.id,
          ...payload,
        };
        setQuestions([...questions, newQuestion]);
      }

      // Reset form
      setCurrentQuestion({
        type: "MCQ",
        questionAr: "",
        questionEn: "",
        points: "1",
        order: questions.length + 1,
        options: [],
        correctAnswer: "",
        optionTextAr: "",
        optionTextEn: "",
      });
      setShowQuestionForm(false);
      alert(language === "ar" ? "تم حفظ السؤال بنجاح" : "Question saved successfully");
    } catch (error) {
      console.error("Error saving question:", error);
      alert(error.response?.data?.message || "Error saving question");
    } finally {
      setSaving(false);
    }
  };

  const editQuestion = (index) => {
    const question = questions[index];
    setCurrentQuestion({
      type: question.type,
      questionAr: question.questionAr,
      questionEn: question.questionEn,
      points: question.points,
      order: question.order,
      options: question.options || [],
      correctAnswer: question.correctAnswer,
      optionTextAr: "",
      optionTextEn: "",
    });
    setEditingQuestionIndex(index);
    setShowQuestionForm(true);
  };

  const removeQuestion = async (index) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من حذف هذا السؤال؟" : "Are you sure you want to delete this question?")) {
      return;
    }

    try {
      setSaving(true);
      const questionId = questions[index].id;
      await api.delete(`/admin/exams/${id}/questions/${questionId}`);
      setQuestions(questions.filter((_, i) => i !== index));
      alert(language === "ar" ? "تم حذف السؤال بنجاح" : "Question deleted successfully");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert(error.response?.data?.message || "Error deleting question");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        duration: formData.duration || null,
        passingScore: formData.passingScore || 60,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      console.log("Updating exam with data:", payload);

      const response = await api.put(`/admin/exams/${id}`, payload);

      console.log("Exam update response:", response.data);

      if (response.data?.success) {
        alert(language === "ar" ? "تم تحديث الامتحان بنجاح" : "Exam updated successfully");
        navigate(`/admin/exams/${id}`);
      } else {
        alert(response.data?.message || "Error updating exam");
      }
    } catch (error) {
      console.error("Error updating exam:", error);
      alert(error.response?.data?.message || "Error updating exam");
    } finally {
      setSaving(false);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/admin/exams/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "تعديل الامتحان" : "Edit Exam"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "معلومات الامتحان" : "Exam Information"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "الدورة" : "Course"}
              </label>
              <Input
                value={formData.courseId}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ar" ? "لا يمكن تغيير الدورة" : "Course cannot be changed"}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "العنوان (عربي) *" : "Title (Arabic) *"}
                </label>
                <Input
                  value={formData.titleAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "العنوان (إنجليزي) *" : "Title (English) *"}
                </label>
                <Input
                  value={formData.titleEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}
                </label>
                <Textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionAr: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}
                </label>
                <Textarea
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, descriptionEn: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "المدة (دقيقة)" : "Duration (minutes)"}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "نقاط النجاح (%)" : "Passing Score (%)"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.passingScore}
                  onChange={(e) => setFormData((prev) => ({ ...prev, passingScore: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "تاريخ البدء" : "Start Date"}
                </label>
                <Input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "تاريخ الانتهاء" : "End Date"}
                </label>
                <Input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === "ar" ? "حفظ" : "Save"}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(`/admin/exams/${id}`)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {language === "ar" ? "أسئلة الامتحان" : "Exam Questions"}
            </h2>
            <Button
              type="button"
              onClick={() => {
                setShowQuestionForm(!showQuestionForm);
                setEditingQuestionIndex(null);
                setCurrentQuestion({
                  type: "MCQ",
                  questionAr: "",
                  questionEn: "",
                  points: "1",
                  order: questions.length + 1,
                  options: [],
                  correctAnswer: "",
                  optionTextAr: "",
                  optionTextEn: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === "ar" ? "إضافة سؤال" : "Add Question"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Question Form */}
          {showQuestionForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-6 mb-6 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  {editingQuestionIndex !== null
                    ? language === "ar" ? "تعديل السؤال" : "Edit Question"
                    : language === "ar" ? "سؤال جديد" : "New Question"}
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowQuestionForm(false);
                    setEditingQuestionIndex(null);
                    setCurrentQuestion({
                      type: "MCQ",
                      questionAr: "",
                      questionEn: "",
                      points: "1",
                      order: questions.length + 1,
                      options: [],
                      correctAnswer: "",
                      optionTextAr: "",
                      optionTextEn: "",
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "نوع السؤال *" : "Question Type *"}
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value, options: [], correctAnswer: "" })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="MCQ">{language === "ar" ? "اختيار من متعدد" : "Multiple Choice"}</option>
                    <option value="TRUE_FALSE">{language === "ar" ? "صح/خطأ" : "True/False"}</option>
                    <option value="ESSAY">{language === "ar" ? "مقالي" : "Essay"}</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "السؤال (عربي) *" : "Question (Arabic) *"}
                    </label>
                    <Textarea
                      value={currentQuestion.questionAr}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionAr: e.target.value })}
                      rows={3}
                      required
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "السؤال (إنجليزي) *" : "Question (English) *"}
                    </label>
                    <Textarea
                      value={currentQuestion.questionEn}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionEn: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "النقاط *" : "Points *"}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: e.target.value })}
                    required
                  />
                </div>

                {/* Options for MCQ */}
                {currentQuestion.type === "MCQ" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        {language === "ar" ? "الخيارات" : "Options"}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={!currentQuestion.optionTextAr || !currentQuestion.optionTextEn}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {language === "ar" ? "إضافة خيار" : "Add Option"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder={language === "ar" ? "النص (عربي)" : "Text (Arabic)"}
                        value={currentQuestion.optionTextAr}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionTextAr: e.target.value })}
                        dir="rtl"
                      />
                      <Input
                        placeholder={language === "ar" ? "النص (إنجليزي)" : "Text (English)"}
                        value={currentQuestion.optionTextEn}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionTextEn: e.target.value })}
                      />
                    </div>
                    {currentQuestion.options.length > 0 && (
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                            <div className="flex-1">
                              <p className="font-medium">{option.textAr}</p>
                              <p className="text-sm text-muted-foreground">{option.textEn}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === index.toString()}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index.toString() })}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Correct Answer for TRUE_FALSE and ESSAY */}
                {currentQuestion.type !== "MCQ" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      {language === "ar" ? "الإجابة الصحيحة *" : "Correct Answer *"}
                    </label>
                    {currentQuestion.type === "TRUE_FALSE" ? (
                      <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">{language === "ar" ? "اختر..." : "Select..."}</option>
                        <option value="true">{language === "ar" ? "صح" : "True"}</option>
                        <option value="false">{language === "ar" ? "خطأ" : "False"}</option>
                      </select>
                    ) : (
                      <Textarea
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        rows={3}
                        placeholder={language === "ar" ? "أدخل الإجابة الصحيحة..." : "Enter correct answer..."}
                        required
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button type="button" onClick={addQuestion} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {language === "ar" ? "حفظ السؤال" : "Save Question"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestionIndex(null);
                      setCurrentQuestion({
                        type: "MCQ",
                        questionAr: "",
                        questionEn: "",
                        points: "1",
                        order: questions.length + 1,
                        options: [],
                        correctAnswer: "",
                        optionTextAr: "",
                        optionTextEn: "",
                      });
                    }}
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Questions List */}
          {questions.length > 0 ? (
            <div className="space-y-2">
              {questions.map((question, index) => (
                <div key={question.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">#{index + 1}</span>
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                          {question.type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {question.points} {language === "ar" ? "نقطة" : "points"}
                        </span>
                      </div>
                      <p className="font-medium mb-1">
                        {language === "ar" ? question.questionAr : question.questionEn}
                      </p>
                      {question.options && question.options.length > 0 && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          {question.options.length} {language === "ar" ? "خيار" : "options"}
                        </div>
                      )}
                      {question.correctAnswer && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">{language === "ar" ? "الإجابة الصحيحة: " : "Correct Answer: "}</span>
                          <span className="text-green-600">{question.correctAnswer}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => editQuestion(index)}
                      >
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {language === "ar" ? "لا توجد أسئلة بعد" : "No questions yet"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



