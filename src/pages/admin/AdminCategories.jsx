import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, Folder, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

export default function AdminCategories() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, searchTerm]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/categories", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Categories API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let categoriesList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        categoriesList = data;
      } else if (data.categories) {
        categoriesList = Array.isArray(data.categories) ? data.categories : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        categoriesList = data.data;
        paginationData = data.pagination || {};
      } else {
        categoriesList = [];
      }
      
      setCategories(categoriesList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف الفئة بنجاح" : "Category deleted successfully");
        fetchCategories();
      } else {
        alert(response.data?.message || "Error deleting category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(error.response?.data?.message || "Error deleting category");
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "الفئات" : "Categories"}
        </h1>
        <Button onClick={() => navigate("/admin/categories/new")}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة فئة" : "Add Category"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد فئات" : "No categories found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ar" ? category.nameAr : category.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category._count?.courses || 0}{" "}
                        {language === "ar" ? "دورة" : "courses"}
                      </p>
                    </div>
                    {category.image && (
                      <img
                        src={getImageUrl(category.image)}
                        alt={category.nameEn}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/categories/${category.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {language === "ar" ? "عرض" : "View"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      {language === "ar" ? "تعديل" : "Edit"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {language === "ar" ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                {language === "ar" ? "السابق" : "Previous"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {language === "ar" ? "صفحة" : "Page"} {pagination.page} {language === "ar" ? "من" : "of"} {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                {language === "ar" ? "التالي" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
