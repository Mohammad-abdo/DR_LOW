import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, Book, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";

export default function AdminCourses() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", level: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchCourses();
  }, [pagination.page, searchTerm, filters.status, filters.level]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/courses", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm || undefined,
          status: filters.status || undefined,
          level: filters.level || undefined,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Courses API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let coursesList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        coursesList = data;
      } else if (data.courses) {
        coursesList = Array.isArray(data.courses) ? data.courses : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        coursesList = data.data;
        paginationData = data.pagination || {};
      } else {
        coursesList = [];
      }
      
      setCourses(coursesList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/courses/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف الدورة بنجاح" : "Course deleted successfully");
        fetchCourses();
      } else {
        alert(response.data?.message || "Error deleting course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.response?.data?.message || "Error deleting course");
    }
  };

  if (loading && courses.length === 0) {
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
          {language === "ar" ? "الدورات" : "Courses"}
        </h1>
        <Button onClick={() => navigate("/admin/courses/new")}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة دورة" : "Add Course"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع الحالات" : "All Status"}</option>
              <option value="PUBLISHED">{language === "ar" ? "منشور" : "Published"}</option>
              <option value="DRAFT">{language === "ar" ? "مسودة" : "Draft"}</option>
            </select>
            <select
              value={filters.level}
              onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع المستويات" : "All Levels"}</option>
              <option value="BEGINNER">{language === "ar" ? "مبتدئ" : "Beginner"}</option>
              <option value="INTERMEDIATE">{language === "ar" ? "متوسط" : "Intermediate"}</option>
              <option value="ADVANCED">{language === "ar" ? "متقدم" : "Advanced"}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <Book className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد دورات" : "No courses found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {course.coverImage ? (
                      <img
                        src={getImageUrl(course.coverImage)}
                        alt={course.titleEn || course.titleAr}
                        className="w-24 h-24 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Book className="w-8 h-8 text-primary/50" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ar" ? course.titleAr : course.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.teacher?.nameEn || course.teacher?.nameAr} • {course.category?.nameEn || course.category?.nameAr}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          course.status === "PUBLISHED" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {course.status}
                        </span>
                        <span>{course._count?.purchases || 0} {language === "ar" ? "اشتراك" : "enrollments"}</span>
                        <span>{parseFloat(course.price || 0).toFixed(2)} KWD</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${course.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "ar" ? "عرض" : "View"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </Button>
                    </div>
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
