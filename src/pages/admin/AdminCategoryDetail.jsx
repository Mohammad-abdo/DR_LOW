import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Folder, Loader2, Book } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

export default function AdminCategoryDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/categories/${id}`);
      const data = extractDataFromResponse(response);
      setCategory(data.category);
    } catch (error) {
      console.error("Error fetching category:", error);
      alert(error.response?.data?.message || "Error loading category");
      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/categories/${id}`);
      navigate("/admin/categories");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting category");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/categories")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/categories/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2 text-shadow-orange-700" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {category.image && (
              <img
                src={getImageUrl(category.image)}
                alt={category.nameEn}
                className="w-24 h-24 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {language === "ar" ? category.nameAr : category.nameEn}
              </h1>
              <p className="text-muted-foreground mt-1">
                {category._count?.courses || 0} {language === "ar" ? "دورة" : "courses"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{language === "ar" ? "الوصف (عربي)" : "Description (Arabic)"}</h3>
            <p className="text-muted-foreground">{category.descriptionAr || "-"}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">{language === "ar" ? "الوصف (إنجليزي)" : "Description (English)"}</h3>
            <p className="text-muted-foreground">{category.descriptionEn || "-"}</p>
          </div>

          {category.courses && category.courses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                {language === "ar" ? "الدورات" : "Courses"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.courses.map((course) => (
                  <div key={course.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">
                      {language === "ar" ? course.titleAr : course.titleEn}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${
                      course.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {course.status}
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



