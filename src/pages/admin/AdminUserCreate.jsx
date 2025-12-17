import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function AdminUserCreate() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    password: "",
    role: "STUDENT",
    department: "",
    year: "",
    semester: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const endpoint = formData.role === "TEACHER" 
        ? "/auth/register/teacher"
        : "/auth/register/student";
      
      const payload = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(formData.role === "STUDENT" && {
          repeatPassword: formData.password, // Required for student registration
          year: parseInt(formData.year) || undefined,
          semester: parseInt(formData.semester) || undefined,
        }),
        ...(formData.department && { department: formData.department }),
      };

      console.log("Creating user with data:", payload);

      const response = await api.post(endpoint, payload);

      console.log("User creation response:", response.data);

      if (response.data?.success || response.status === 201) {
        alert(language === "ar" ? "تم إنشاء المستخدم بنجاح" : "User created successfully");
        navigate("/admin/users");
      } else {
        alert(response.data?.message || "Error creating user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert(error.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إضافة مستخدم جديد" : "Create New User"}
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
                  {language === "ar" ? "كلمة المرور *" : "Password *"}
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
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
              <Button type="submit" disabled={loading}>
                {loading ? (
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
              <Button type="button" variant="outline" onClick={() => navigate("/admin/users")}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

