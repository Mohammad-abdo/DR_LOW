import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2, User, Lock } from "lucide-react";

export default function AdminProfile() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    department: "",
    avatar: null,
    currentAvatar: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/profile");
      const data = extractDataFromResponse(response);
      setProfile({
        nameAr: data.user.nameAr || "",
        nameEn: data.user.nameEn || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
        department: data.user.department || "",
        avatar: null,
        currentAvatar: data.user.avatar || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const formDataToSend = new FormData();
      formDataToSend.append("nameAr", profile.nameAr);
      formDataToSend.append("nameEn", profile.nameEn);
      formDataToSend.append("phone", profile.phone);
      if (profile.department) formDataToSend.append("department", profile.department);
      if (profile.avatar) formDataToSend.append("avatar", profile.avatar);

      await api.put("/profile", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      fetchProfile();
      alert(language === "ar" ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }
    try {
      setChangingPassword(true);
      await api.post("/profile/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert(language === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error changing password");
    } finally {
      setChangingPassword(false);
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
      <h1 className="text-2xl font-bold">
        {language === "ar" ? "الملف الشخصي" : "Profile"}
      </h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile.currentAvatar ? (
              <img
                src={profile.currentAvatar}
                alt={profile.nameEn}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {language === "ar" ? profile.nameAr : profile.nameEn}
              </h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الاسم (عربي) *" : "Name (Arabic) *"}
                </label>
                <Input
                  value={profile.nameAr}
                  onChange={(e) => setProfile((prev) => ({ ...prev, nameAr: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الاسم (إنجليزي) *" : "Name (English) *"}
                </label>
                <Input
                  value={profile.nameEn}
                  onChange={(e) => setProfile((prev) => ({ ...prev, nameEn: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <Input type="email" value={profile.email} disabled />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "الهاتف" : "Phone"}
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "القسم" : "Department"}
              </label>
              <Input
                value={profile.department}
                onChange={(e) => setProfile((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "الصورة الشخصية" : "Avatar"}
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setProfile((prev) => ({ ...prev, avatar: e.target.files[0] }))}
              />
            </div>
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
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "كلمة المرور الحالية *" : "Current Password *"}
              </label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "كلمة المرور الجديدة *" : "New Password *"}
              </label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                {language === "ar" ? "تأكيد كلمة المرور *" : "Confirm Password *"}
              </label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري التغيير..." : "Changing..."}
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  {language === "ar" ? "تغيير كلمة المرور" : "Change Password"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



