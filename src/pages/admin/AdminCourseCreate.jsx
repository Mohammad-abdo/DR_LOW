import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AdminCourseCreate() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    teacherId: "",
    categoryId: "",
    price: "",
    discount: "0",
    level: "BEGINNER",
    status: "DRAFT",
    coverImage: null,
  });

  useEffect(() => {
    fetchTeachersAndCategories();
  }, []);

  const fetchTeachersAndCategories = async () => {
    try {
      setFetching(true);
      const [teachersRes, categoriesRes] = await Promise.all([
        api.get("/admin/users?role=TEACHER&limit=100").catch(() => ({ data: {} })),
        api.get("/admin/categories?limit=100").catch(() => ({ data: {} })),
      ]);

      console.log("Teachers Response:", teachersRes.data);
      console.log("Categories Response:", categoriesRes.data);

      const teachersData = teachersRes.data?.data?.users || teachersRes.data?.users || [];
      const categoriesData = categoriesRes.data?.data?.categories || categoriesRes.data?.categories || [];

      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error("Error fetching teachers/categories:", error);
      alert(error.response?.data?.message || "Error loading data");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("titleAr", formData.titleAr);
      formDataToSend.append("titleEn", formData.titleEn);
      formDataToSend.append("descriptionAr", formData.descriptionAr);
      formDataToSend.append("descriptionEn", formData.descriptionEn);
      formDataToSend.append("teacherId", formData.teacherId);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("discount", formData.discount);
      formDataToSend.append("level", formData.level);
      formDataToSend.append("status", formData.status);
      if (formData.coverImage) {
        formDataToSend.append("cover_image", formData.coverImage);
      }

      console.log("Creating course with data:", {
        titleAr: formData.titleAr,
        titleEn: formData.titleEn,
        teacherId: formData.teacherId,
        categoryId: formData.categoryId,
        price: formData.price,
      });

      const response = await api.post("/admin/courses", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Course creation response:", response.data);

      if (response.data?.success) {
        alert(language === "ar" ? "تم إنشاء الدورة بنجاح" : "Course created successfully");
        navigate("/admin/courses");
      } else {
        alert(response.data?.message || "Error creating course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert(error.response?.data?.message || "Error creating course");
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
        <Button variant="outline" onClick={() => navigate("/admin/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إضافة دورة جديدة" : "Create New Course"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "معلومات الدورة" : "Course Information"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  {language === "ar" ? "المعلم *" : "Teacher *"}
                </label>
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">{language === "ar" ? "اختر المعلم" : "Select Teacher"}</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {language === "ar" ? teacher.nameAr : teacher.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الفئة *" : "Category *"}
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">{language === "ar" ? "اختر الفئة" : "Select Category"}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {language === "ar" ? category.nameAr : category.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "السعر (KWD) *" : "Price (KWD) *"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الخصم (%)" : "Discount (%)"}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "المستوى *" : "Level *"}
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="BEGINNER">{language === "ar" ? "مبتدئ" : "Beginner"}</option>
                  <option value="INTERMEDIATE">{language === "ar" ? "متوسط" : "Intermediate"}</option>
                  <option value="ADVANCED">{language === "ar" ? "متقدم" : "Advanced"}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الحالة *" : "Status *"}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="DRAFT">{language === "ar" ? "مسودة" : "Draft"}</option>
                  <option value="PUBLISHED">{language === "ar" ? "منشور" : "Published"}</option>
                  <option value="ARCHIVED">{language === "ar" ? "مؤرشف" : "Archived"}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "صورة الغلاف" : "Cover Image"}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, coverImage: e.target.files[0] }))}
              />
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
              <Button type="button" variant="outline" onClick={() => navigate("/admin/courses")}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

