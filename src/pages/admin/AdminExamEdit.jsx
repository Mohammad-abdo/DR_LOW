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
import { ArrowLeft, Save, Loader2 } from "lucide-react";

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
    } catch (error) {
      console.error("Error fetching exam:", error);
      alert(error.response?.data?.message || "Error loading exam");
      navigate("/admin/exams");
    } finally {
      setLoading(false);
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
    </div>
  );
}



