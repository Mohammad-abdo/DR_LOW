import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Plus, X, Trash2 } from "lucide-react";

export default function AdminExamCreate() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [courses, setCourses] = useState([]);
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
  const [showQuestionForm, setShowQuestionForm] = useState(true); // Show form by default
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
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setFetching(true);
      const response = await api.get("/admin/courses?limit=100");
      console.log("Courses Response:", response.data);
      const coursesData = response.data?.data?.courses || response.data?.courses || [];
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert(error.response?.data?.message || "Error loading courses");
    } finally {
      setFetching(false);
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

  const addQuestion = () => {
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

    const question = {
      id: Date.now().toString(),
      type: currentQuestion.type,
      questionAr: currentQuestion.questionAr,
      questionEn: currentQuestion.questionEn,
      points: parseFloat(currentQuestion.points) || 1,
      order: questions.length + 1,
      options: currentQuestion.type === "MCQ" ? currentQuestion.options : null,
      correctAnswer: currentQuestion.correctAnswer,
    };

    setQuestions([...questions, question]);
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
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        courseId: formData.courseId,
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        descriptionAr: formData.descriptionAr,
        descriptionEn: formData.descriptionEn,
        duration: formData.duration || null,
        passingScore: formData.passingScore || 60,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      };

      console.log("Creating exam with data:", payload);

      const response = await api.post("/admin/exams", payload);

      console.log("Exam creation response:", response.data);

      if (response.data?.success) {
        const examId = response.data.data.exam.id;

        // Add questions if any
        if (questions.length > 0) {
          for (const question of questions) {
            try {
              await api.post(`/admin/exams/${examId}/questions`, {
                type: question.type,
                questionAr: question.questionAr,
                questionEn: question.questionEn,
                points: question.points,
                order: question.order,
                options: question.options,
                correctAnswer: question.correctAnswer,
              });
            } catch (error) {
              console.error("Error adding question:", error);
            }
          }
        }

        alert(language === "ar" ? "تم إنشاء الامتحان بنجاح" : "Exam created successfully");
        navigate("/admin/exams");
      } else {
        alert(response.data?.message || "Error creating exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      alert(error.response?.data?.message || "Error creating exam");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/exams")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إضافة امتحان جديد" : "Create New Exam"}
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
                {language === "ar" ? "الدورة *" : "Course *"}
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData((prev) => ({ ...prev, courseId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">{language === "ar" ? "اختر الدورة" : "Select Course"}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {language === "ar" ? course.titleAr : course.titleEn}
                  </option>
                ))}
              </select>
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

            {/* Questions Section - Always Visible */}
            <div className="border-t pt-6 mt-6 bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {language === "ar" ? "الأسئلة" : "Questions"}
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {language === "ar" ? "أضف أسئلة للامتحان" : "Add questions to the exam"}
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowQuestionForm(!showQuestionForm)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {showQuestionForm 
                    ? (language === "ar" ? "إخفاء النموذج" : "Hide Form")
                    : (language === "ar" ? "إضافة سؤال جديد" : "Add New Question")
                  }
                </Button>
              </div>

              {/* Question Form */}
              {showQuestionForm && (
                <div className="border rounded-lg p-4 mb-4 bg-gray-50">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {language === "ar" ? "نوع السؤال *" : "Question Type *"}
                      </label>
                      <select
                        value={currentQuestion.type}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value, options: [], correctAnswer: "" })}
                        className="w-full px-3 py-2 border rounded-md"
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
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "ar" ? "الخيارات" : "Options"}
                        </label>
                        <div className="space-y-2 mb-2">
                          {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <input
                                type="radio"
                                name="correctAnswer"
                                checked={currentQuestion.correctAnswer === index.toString()}
                                onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: index.toString() })}
                                className="w-4 h-4"
                              />
                              <span className="flex-1">
                                {language === "ar" ? option.textAr : option.textEn}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder={language === "ar" ? "الخيار (عربي)" : "Option (Arabic)"}
                            value={currentQuestion.optionTextAr}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionTextAr: e.target.value })}
                            dir="rtl"
                          />
                          <Input
                            placeholder={language === "ar" ? "الخيار (إنجليزي)" : "Option (English)"}
                            value={currentQuestion.optionTextEn}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, optionTextEn: e.target.value })}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {language === "ar" ? "إضافة خيار" : "Add Option"}
                        </Button>
                      </div>
                    )}

                    {/* Correct Answer for TRUE_FALSE */}
                    {currentQuestion.type === "TRUE_FALSE" && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "ar" ? "الإجابة الصحيحة *" : "Correct Answer *"}
                        </label>
                        <select
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          required
                        >
                          <option value="">{language === "ar" ? "اختر" : "Select"}</option>
                          <option value="true">{language === "ar" ? "صح" : "True"}</option>
                          <option value="false">{language === "ar" ? "خطأ" : "False"}</option>
                        </select>
                      </div>
                    )}

                    {/* Correct Answer for ESSAY */}
                    {currentQuestion.type === "ESSAY" && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "ar" ? "الإجابة النموذجية" : "Sample Answer"}
                        </label>
                        <Textarea
                          value={currentQuestion.correctAnswer}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                          rows={4}
                          placeholder={language === "ar" ? "اكتب الإجابة النموذجية هنا..." : "Write sample answer here..."}
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={addQuestion}
                      >
                        {language === "ar" ? "إضافة السؤال" : "Add Question"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowQuestionForm(false);
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
                </div>
              )}

              {/* Questions List */}
              {questions.length > 0 && (
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
                          <p className="font-medium">
                            {language === "ar" ? question.questionAr : question.questionEn}
                          </p>
                          {question.options && question.options.length > 0 && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {question.options.length} {language === "ar" ? "خيار" : "options"}
                            </div>
                          )}
                        </div>
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
                  ))}
                </div>
              )}

              {questions.length === 0 && !showQuestionForm && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {language === "ar" ? "لا توجد أسئلة. اضغط على 'إضافة سؤال' لإضافة أسئلة." : "No questions. Click 'Add Question' to add questions."}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
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
              <Button type="button" variant="outline" onClick={() => navigate("/admin/exams")}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

