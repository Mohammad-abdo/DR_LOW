import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, ClipboardList, Loader2 } from "lucide-react";

export default function AdminExams() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchExams();
  }, [pagination.page, searchTerm]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/exams", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Exams API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let examsList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        examsList = data;
      } else if (data.exams) {
        examsList = Array.isArray(data.exams) ? data.exams : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        examsList = data.data;
        paginationData = data.pagination || {};
      } else {
        examsList = [];
      }
      
      setExams(examsList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/exams/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف الامتحان بنجاح" : "Exam deleted successfully");
        fetchExams();
      } else {
        alert(response.data?.message || "Error deleting exam");
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      alert(error.response?.data?.message || "Error deleting exam");
    }
  };

  if (loading && exams.length === 0) {
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
          {language === "ar" ? "الامتحانات" : "Exams"}
        </h1>
        <Button onClick={() => navigate("/admin/exams/new")}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة امتحان" : "Add Exam"}
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
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد امتحانات" : "No exams found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <motion.div
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ar" ? exam.titleAr : exam.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {exam.course?.titleEn || exam.course?.titleAr} • {exam.type}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>{exam._count?.questions || 0} {language === "ar" ? "سؤال" : "questions"}</span>
                        <span>{exam._count?.results || 0} {language === "ar" ? "نتيجة" : "results"}</span>
                        <span>{exam.duration} {language === "ar" ? "دقيقة" : "minutes"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/exams/${exam.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "ar" ? "عرض" : "View"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/exams/${exam.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(exam.id)}
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
