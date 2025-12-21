import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Eye, Folder, Loader2, AlertTriangle } from "lucide-react";
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
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    category: null,
    reassignTo: "",
    forceDelete: false,
    deleting: false,
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

  const handleDeleteClick = (category) => {
    setDeleteDialog({
      open: true,
      category: {
        ...category,
        courseCount: category._count?.courses || 0,
      },
      reassignTo: "",
      forceDelete: false,
      deleting: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.category) return;

    const { category, reassignTo, forceDelete } = deleteDialog;
    setDeleteDialog((prev) => ({ ...prev, deleting: true }));

    try {
      let url = `/admin/categories/${category.id}`;
      const params = new URLSearchParams();
      
      if (reassignTo) {
        params.append("reassignTo", reassignTo);
      } else if (forceDelete) {
        params.append("force", "true");
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await api.delete(url);
      
      if (response.data?.success) {
        const message = response.data.message || response.data.messageAr || 
          (language === "ar" ? "تم حذف الفئة بنجاح" : "Category deleted successfully");
        alert(message);
        setDeleteDialog({ open: false, category: null, reassignTo: "", forceDelete: false, deleting: false });
        fetchCategories();
      } else {
        // If category has courses, show options
        if (response.data?.data?.courseCount > 0) {
          setDeleteDialog((prev) => ({
            ...prev,
            deleting: false,
            category: { ...category, courseCount: response.data.data.courseCount, courses: response.data.data.courses },
          }));
        } else {
          alert(response.data?.message || response.data?.messageAr || "Error deleting category");
          setDeleteDialog((prev) => ({ ...prev, deleting: false }));
        }
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      const errorData = error.response?.data;
      
      // If category has courses, show options in dialog
      if (errorData?.data?.courseCount > 0) {
        setDeleteDialog((prev) => ({
          ...prev,
          deleting: false,
          category: { 
            ...category, 
            courseCount: errorData.data.courseCount, 
            courses: errorData.data.courses || [] 
          },
        }));
      } else {
        alert(errorData?.message || errorData?.messageAr || "Error deleting category");
        setDeleteDialog((prev) => ({ ...prev, deleting: false }));
      }
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
                      onClick={() => handleDeleteClick(category)}
                      className="cursor-pointer hover:bg-destructive/10 hover:text-destructive  text-red-900"
                    >
                      <Trash2 className="w-4 h-4 mr-1" style={{ color: 'red' }}/>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => !deleteDialog.deleting && setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>
                {language === "ar" ? "تأكيد الحذف" : "Confirm Deletion"}
              </DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              {deleteDialog.category?.courseCount > 0 ? (
                <div className="space-y-3">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    {language === "ar" 
                      ? `تحذير: هذه الفئة تحتوي على ${deleteDialog.category.courseCount} دورة`
                      : `Warning: This category contains ${deleteDialog.category.courseCount} course(s)`}
                  </p>
                  <p className="text-sm">
                    {language === "ar"
                      ? "اختر أحد الخيارات التالية:"
                      : "Please choose one of the following options:"}
                  </p>
                </div>
              ) : (
                <p>
                  {language === "ar"
                    ? "هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء."
                    : "Are you sure you want to delete this category? This action cannot be undone."}
                </p>
              )}
            </DialogDescription>
          </DialogHeader>

          {deleteDialog.category?.courseCount > 0 && (
            <div className="space-y-4 py-4">
              {/* Reassign Option */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {language === "ar" ? "إعادة تعيين الدورات إلى فئة أخرى:" : "Reassign courses to another category:"}
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  value={deleteDialog.reassignTo}
                  onChange={(e) => setDeleteDialog({ ...deleteDialog, reassignTo: e.target.value, forceDelete: false })}
                >
                  <option value="">
                    {language === "ar" ? "-- اختر فئة --" : "-- Select Category --"}
                  </option>
                  {categories
                    .filter((cat) => cat.id !== deleteDialog.category?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {language === "ar" ? cat.nameAr : cat.nameEn}
                      </option>
                    ))}
                </select>
              </div>

              {/* Force Delete Option */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="forceDelete"
                  checked={deleteDialog.forceDelete}
                  onChange={(e) => setDeleteDialog({ ...deleteDialog, forceDelete: e.target.checked, reassignTo: "" })}
                  className="w-4 h-4"
                />
                <label htmlFor="forceDelete" className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                  {language === "ar"
                    ? "حذف الفئة وجميع الدورات (تحذير: سيتم حذف جميع الدورات بشكل دائم)"
                    : "Delete category and all courses (WARNING: All courses will be permanently deleted)"}
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, category: null, reassignTo: "", forceDelete: false, deleting: false })}
              disabled={deleteDialog.deleting}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteDialog.deleting || (deleteDialog.category?.courseCount > 0 && !deleteDialog.reassignTo && !deleteDialog.forceDelete)}
            >
              {deleteDialog.deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === "ar" ? "حذف" : "Delete"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
