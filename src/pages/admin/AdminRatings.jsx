import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Book, UserCog, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminRatings() {
  const { language } = useLanguage();
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, course, teacher
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchRatings();
  }, [pagination.page, filter]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/ratings", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          type: filter === "all" ? undefined : filter,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Ratings API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let ratingsList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        ratingsList = data;
      } else if (data.ratings) {
        ratingsList = Array.isArray(data.ratings) ? data.ratings : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        ratingsList = data.data;
        paginationData = data.pagination || {};
      } else {
        ratingsList = [];
      }
      
      setRatings(ratingsList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/ratings/${type}/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف التقييم بنجاح" : "Rating deleted successfully");
        fetchRatings();
      } else {
        alert(response.data?.message || "Error deleting rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      alert(error.response?.data?.message || "Error deleting rating");
    }
  };

  if (loading && ratings.length === 0) {
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
          {language === "ar" ? "التقييمات" : "Ratings"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{language === "ar" ? "الكل" : "All"}</option>
              <option value="course">{language === "ar" ? "دورات" : "Courses"}</option>
              <option value="teacher">{language === "ar" ? "معلمون" : "Teachers"}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد تقييمات" : "No ratings found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <motion.div
                  key={rating.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {rating.course ? (
                          <Book className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <UserCog className="w-4 h-4 text-muted-foreground" />
                        )}
                        <h3 className="font-semibold">
                          {rating.course
                            ? (language === "ar" ? rating.course.titleAr : rating.course.titleEn)
                            : (language === "ar" ? `تقييم ${rating.teacher?.nameAr}` : `Rating for ${rating.teacher?.nameEn}`)}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === "ar" ? rating.student?.nameAr : rating.student?.nameEn}
                      </p>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rating.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm font-semibold">{rating.rating}/5</span>
                      </div>
                      {rating.comment && (
                        <p className="text-sm mt-2 text-muted-foreground">{rating.comment}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {rating.createdAt ? format(new Date(rating.createdAt), "PPp") : "-"}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(rating.course ? "course" : "teacher", rating.id)}
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

