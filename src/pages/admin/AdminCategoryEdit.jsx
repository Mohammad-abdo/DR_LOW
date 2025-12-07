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
import { getImageUrl } from "@/lib/imageHelper";

export default function AdminCategoryEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    image: null,
    currentImage: "",
  });

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/categories/${id}`);
      const data = extractDataFromResponse(response);
      setFormData({
        nameAr: data.category.nameAr || "",
        nameEn: data.category.nameEn || "",
        descriptionAr: data.category.descriptionAr || "",
        descriptionEn: data.category.descriptionEn || "",
        image: null,
        currentImage: data.category.image || "",
      });
    } catch (error) {
      console.error("Error fetching category:", error);
      alert(error.response?.data?.message || "Error loading category");
      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("nameAr", formData.nameAr);
      formDataToSend.append("nameEn", formData.nameEn);
      formDataToSend.append("descriptionAr", formData.descriptionAr);
      formDataToSend.append("descriptionEn", formData.descriptionEn);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      console.log("Updating category with data:", {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
      });

      const response = await api.put(`/admin/categories/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Category update response:", response.data);

      if (response.data?.success) {
        alert(language === "ar" ? "تم تحديث الفئة بنجاح" : "Category updated successfully");
        navigate(`/admin/categories/${id}`);
      } else {
        alert(response.data?.message || "Error updating category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert(error.response?.data?.message || "Error updating category");
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
        <Button variant="outline" onClick={() => navigate(`/admin/categories/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "تعديل الفئة" : "Edit Category"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "معلومات الفئة" : "Category Information"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الاسم (عربي) *" : "Name (Arabic) *"}
                </label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameAr: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الاسم (إنجليزي) *" : "Name (English) *"}
                </label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nameEn: e.target.value }))}
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
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "الصورة" : "Image"}
              </label>
              {formData.currentImage && (
                <img 
                  src={getImageUrl(formData.currentImage)} 
                  alt="Current" 
                  className="w-32 h-32 rounded-lg mb-2 object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.files[0] }))}
              />
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
              <Button type="button" variant="outline" onClick={() => navigate(`/admin/categories/${id}`)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

