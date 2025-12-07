import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, UserCheck, UserX, Loader2, Users } from "lucide-react";
import { format } from "date-fns";

export default function AdminUserDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      const data = extractDataFromResponse(response);
      setUser(data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      alert(error.response?.data?.message || "Error loading user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      await api.post(`/admin/users/${id}/block`);
      fetchUser();
    } catch (error) {
      alert(error.response?.data?.message || "Error blocking user");
    }
  };

  const handleUnblock = async () => {
    try {
      await api.post(`/admin/users/${id}/unblock`);
      fetchUser();
    } catch (error) {
      alert(error.response?.data?.message || "Error unblocking user");
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      navigate("/admin/users");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/users/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          {user.status === "ACTIVE" ? (
            <Button variant="outline" onClick={handleBlock}>
              <UserX className="w-4 h-4 mr-2" />
              {language === "ar" ? "حظر" : "Block"}
            </Button>
          ) : (
            <Button variant="outline" onClick={handleUnblock}>
              <UserCheck className="w-4 h-4 mr-2" />
              {language === "ar" ? "إلغاء الحظر" : "Unblock"}
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.nameEn}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-12 h-12 text-primary" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {language === "ar" ? user.nameAr : user.nameEn}
              </h1>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}</p>
              <p className="font-semibold">{user.nameAr}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}</p>
              <p className="font-semibold">{user.nameEn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "البريد الإلكتروني" : "Email"}</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الهاتف" : "Phone"}</p>
              <p className="font-semibold">{user.phone || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الدور" : "Role"}</p>
              <span className={`px-2 py-1 rounded text-sm ${
                user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                user.role === "TEACHER" ? "bg-blue-100 text-blue-800" :
                "bg-green-100 text-green-800"
              }`}>
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الحالة" : "Status"}</p>
              <span className={`px-2 py-1 rounded text-sm ${
                user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {user.status}
              </span>
            </div>
            {user.department && (
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "القسم" : "Department"}</p>
                <p className="font-semibold">{user.department}</p>
              </div>
            )}
            {user.year && (
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "السنة" : "Year"}</p>
                <p className="font-semibold">{user.year}</p>
              </div>
            )}
            {user.semester && (
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "الفصل الدراسي" : "Semester"}</p>
                <p className="font-semibold">{user.semester}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "تاريخ الإنشاء" : "Created At"}</p>
              <p className="font-semibold">{user.createdAt ? format(new Date(user.createdAt), "PPp") : "-"}</p>
            </div>
          </div>

          {user._count && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">{language === "ar" ? "الإحصائيات" : "Statistics"}</h3>
              <div className="grid grid-cols-3 gap-4">
                {user._count.coursesCreated !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الدورات" : "Courses"}</p>
                    <p className="text-2xl font-bold">{user._count.coursesCreated}</p>
                  </div>
                )}
                {user._count.enrollments !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "الاشتراكات" : "Enrollments"}</p>
                    <p className="text-2xl font-bold">{user._count.enrollments}</p>
                  </div>
                )}
                {user._count.payments !== undefined && (
                  <div>
                    <p className="text-sm text-muted-foreground">{language === "ar" ? "المدفوعات" : "Payments"}</p>
                    <p className="text-2xl font-bold">{user._count.payments}</p>
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



