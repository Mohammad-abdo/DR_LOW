import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Star, User, Book, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminRatingDetail() {
  const { type, id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRating();
  }, [type, id]);

  const fetchRating = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/ratings/${type}/${id}`);
      const data = extractDataFromResponse(response);
      setRating(data.rating || data);
    } catch (error) {
      console.error("Error fetching rating:", error);
      alert(error.response?.data?.message || "Error loading rating");
      navigate("/admin/ratings");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/ratings/${type}/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Rating deleted successfully");
      navigate("/admin/ratings");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting rating");
    }
  };

  const renderStars = (ratingValue) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i <= ratingValue ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!rating) {
    return null;
  }

  const isTeacherRating = type === "teacher";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/ratings")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          {language === "ar" ? "حذف" : "Delete"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              {isTeacherRating ? (
                <User className="w-8 h-8 text-primary" />
              ) : (
                <Book className="w-8 h-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                {language === "ar"
                  ? isTeacherRating
                    ? "تقييم المعلم"
                    : "تقييم الدورة"
                  : isTeacherRating
                  ? "Teacher Rating"
                  : "Course Rating"}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                {renderStars(rating.rating)}
                <span className="text-lg font-semibold ml-2">{rating.rating}/5</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Rating Info */}
          <div className="grid grid-cols-2 gap-6">
            {isTeacherRating ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "المعلم" : "Teacher"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? rating.teacher?.nameAr : rating.teacher?.nameEn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الطالب" : "Student"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? rating.student?.nameAr : rating.student?.nameEn}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الدورة" : "Course"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? rating.course?.titleAr : rating.course?.titleEn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الطالب" : "Student"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? rating.student?.nameAr : rating.student?.nameEn}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "التقييم" : "Rating"}</p>
              <div className="flex items-center gap-2">
                {renderStars(rating.rating)}
                <span className="font-semibold">{rating.rating}/5</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ الإنشاء" : "Created At"}</p>
              <p className="font-semibold">
                {rating.createdAt ? format(new Date(rating.createdAt), "PPp") : "-"}
              </p>
            </div>
          </div>

          {/* Comment */}
          {rating.comment && (
            <div>
              <h3 className="font-semibold mb-2">{language === "ar" ? "التعليق" : "Comment"}</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{rating.comment}</p>
              </div>
            </div>
          )}

          {/* Student Info */}
          {rating.student && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === "ar" ? "معلومات الطالب" : "Student Information"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الاسم" : "Name"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? rating.student.nameAr : rating.student.nameEn}
                  </p>
                </div>
                {rating.student.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "البريد الإلكتروني" : "Email"}</p>
                    <p className="font-semibold">{rating.student.email}</p>
                  </div>
                )}
                {rating.student.avatar && (
                  <div className="col-span-2">
                    <img
                      src={rating.student.avatar}
                      alt={rating.student.nameEn}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


