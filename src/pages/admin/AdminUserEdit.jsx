import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AdminUserEdit() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    role: "STUDENT",
    status: "ACTIVE",
    department: "",
    year: "",
    semester: "",
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      const data = extractDataFromResponse(response);
      setFormData({
        nameAr: data.user.nameAr || "",
        nameEn: data.user.nameEn || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        role: data.user.role || "STUDENT",
        status: data.user.status || "ACTIVE",
        department: data.user.department || "",
        year: data.user.year?.toString() || "",
        semester: data.user.semester?.toString() || "",
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      alert(error.response?.data?.message || "Error loading user");
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
      };

      console.log("Updating user with data:", payload);

      const response = await api.put(`/admin/users/${id}`, payload);

      console.log("User update response:", response.data);

      if (response.data?.success) {
        alert(language === "ar" ? "تم تحديث المستخدم بنجاح" : "User updated successfully");
        navigate(`/admin/users/${id}`);
      } else {
        alert(response.data?.message || "Error updating user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert(error.response?.data?.message || "Error updating user");
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
        <Button variant="outline" onClick={() => navigate(`/admin/users/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "تعديل المستخدم" : "Edit User"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "معلومات المستخدم" : "User Information"}
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
                  {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الهاتف" : "Phone"}
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الدور *" : "Role *"}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="STUDENT">{language === "ar" ? "طالب" : "Student"}</option>
                  <option value="TEACHER">{language === "ar" ? "معلم" : "Teacher"}</option>
                  <option value="ADMIN">{language === "ar" ? "مدير" : "Admin"}</option>
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
                  <option value="ACTIVE">{language === "ar" ? "نشط" : "Active"}</option>
                  <option value="BLOCKED">{language === "ar" ? "محظور" : "Blocked"}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "القسم" : "Department"}
              </label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
            {formData.role === "STUDENT" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "السنة" : "Year"}
                  </label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, year: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "الفصل الدراسي" : "Semester"}
                  </label>
                  <Input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData((prev) => ({ ...prev, semester: e.target.value }))}
                  />
                </div>
              </div>
            )}
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
              <Button type="button" variant="outline" onClick={() => navigate(`/admin/users/${id}`)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

