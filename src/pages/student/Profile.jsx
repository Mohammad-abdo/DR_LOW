import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { getImageUrl } from "@/lib/imageHelper";
import {
  User,
  Mail,
  Phone,
  Calendar,
  GraduationCap,
  Save,
  Loader2,
  Trash2,
  AlertTriangle,
  Lock,
  Camera,
  CreditCard,
  UserCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import showToast from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    year: "",
    semester: "",
    department: "",
    gender: "",
    avatar: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchPayments();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/profile");
      const data = extractDataFromResponse(response);
      const userData = data.user || data;
      setProfile({
        nameAr: userData.nameAr || "",
        nameEn: userData.nameEn || "",
        email: userData.email || "",
        phone: userData.phone || "",
        year: userData.year?.toString() || "",
        semester: userData.semester?.toString() || "",
        department: userData.department || "",
        gender: userData.gender || "",
        avatar: userData.avatar || "",
      });
      if (userData.avatar) {
        setAvatarPreview(userData.avatar);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast.error(
        language === "ar" ? "خطأ في تحميل الملف الشخصي" : "Error loading profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("nameAr", profile.nameAr);
      formData.append("nameEn", profile.nameEn);
      formData.append("phone", profile.phone || "");
      if (profile.year) formData.append("year", profile.year);
      if (profile.semester) formData.append("semester", profile.semester);
      if (profile.department) formData.append("department", profile.department);
      if (profile.gender) formData.append("gender", profile.gender);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const response = await api.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        showToast.success(
          language === "ar" ? "تم تحديث الملف الشخصي" : "Profile updated successfully"
        );
        fetchProfile();
      }
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في التحديث" : "Error updating profile")
      );
    } finally {
      setSaving(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await api.get("/mobile/student/payments");
      const data = extractDataFromResponse(response);
      const paymentsList = Array.isArray(data.payments) ? data.payments : (Array.isArray(data) ? data : []);
      setPayments(paymentsList);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast.error(
        language === "ar" ? "كلمة المرور مطلوبة" : "Password is required"
      );
      return;
    }

    setDeleting(true);

    try {
      await api.delete("/mobile/student/profile", {
        data: { password: deletePassword },
      });

      showToast.success(
        language === "ar" ? "تم حذف الحساب بنجاح" : "Account deleted successfully"
      );
      logout();
      navigate("/student/login");
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في حذف الحساب" : "Error deleting account")
      );
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
      setDeletePassword("");
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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {language === "ar" ? "الملف الشخصي" : "Profile"}
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            {language === "ar"
              ? "إدارة معلوماتك الشخصية"
              : "Manage your personal information"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Profile Information - Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {language === "ar" ? "المعلومات الشخصية" : "Personal Information"}
                </h2>
              </CardHeader>
              <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4 sm:space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={typeof avatarPreview === 'string' && avatarPreview.startsWith('data:') 
                      ? avatarPreview 
                      : getImageUrl(avatarPreview)}
                    alt="Avatar"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-amber-200 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    {profile.nameAr?.charAt(0) || profile.nameEn?.charAt(0) || "U"}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-amber-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-700 transition-all shadow-lg hover:scale-110"
                >
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-base sm:text-lg mb-1 text-gray-900">
                  {language === "ar" ? "صورة الملف الشخصي" : "Profile Picture"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {language === "ar" 
                    ? "انقر على أيقونة الكاميرا لرفع صورة جديدة" 
                    : "Click the camera icon to upload a new picture"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "الاسم بالعربية" : "Name (Arabic)"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={profile.nameAr}
                    onChange={(e) => setProfile({ ...profile, nameAr: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "الاسم بالإنجليزية" : "Name (English)"}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={profile.nameEn}
                    onChange={(e) => setProfile({ ...profile, nameEn: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={profile.email}
                    disabled
                    className="pl-10 h-11 sm:h-12 bg-gray-50 border-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "السنة الدراسية" : "Academic Year"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={profile.year}
                    onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    min="2020"
                    max="2030"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "الفصل الدراسي" : "Semester"}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="number"
                    value={profile.semester}
                    onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    min="1"
                    max="2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "القسم" : "Department"}
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="text"
                    value={profile.department}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                    placeholder={language === "ar" ? "علوم الحاسوب" : "Computer Science"}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {language === "ar" ? "الجنس" : "Gender"}
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 z-10" />
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => {
                      setProfile({ ...profile, gender: value });
                    }}
                  >
                    <SelectTrigger className="pl-10 h-11 sm:h-12 border-gray-200 focus:border-amber-500 focus:ring-amber-500">
                      <SelectValue placeholder={language === "ar" ? "اختر الجنس" : "Select Gender"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">{language === "ar" ? "ذكر" : "Male"}</SelectItem>
                      <SelectItem value="FEMALE">{language === "ar" ? "أنثى" : "Female"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 sm:h-14 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
                </>
              )}
            </Button>
          </form>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {language === "ar" ? "سجل المدفوعات" : "Payment History"}
                </h2>
              </CardHeader>
              <CardContent>
                {loadingPayments ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-amber-600" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <CreditCard className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm sm:text-base text-gray-600">
                      {language === "ar" ? "لا توجد مدفوعات" : "No payments found"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {payments.map((payment, index) => (
                      <motion.div
                        key={payment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 sm:p-5 border-0 rounded-xl bg-white shadow-md hover:shadow-lg transition-all"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                              <h3 className="font-bold text-sm sm:text-base text-gray-900">
                                {language === "ar" ? "دفعة" : "Payment"} #{payment.id?.slice(0, 8)}
                              </h3>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                              <p>
                                {language === "ar" ? "المبلغ" : "Amount"}:{" "}
                                <span className="font-bold text-gray-900">
                                  ${parseFloat(payment.amount || 0).toFixed(2)}
                                </span>
                              </p>
                              <p>
                                {language === "ar" ? "طريقة الدفع" : "Method"}:{" "}
                                <span className="font-medium">{payment.paymentMethod || "N/A"}</span>
                              </p>
                              {payment.createdAt && (
                                <p>
                                  {language === "ar" ? "التاريخ" : "Date"}:{" "}
                                  {new Date(payment.createdAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="w-full sm:w-auto">
                            <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
                              payment.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                              payment.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                              payment.status === "FAILED" ? "bg-red-100 text-red-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {payment.status || "PENDING"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Danger Zone */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg border-red-200 bg-red-50/50">
              <CardHeader className="pb-4">
                <h2 className="text-lg sm:text-xl font-bold text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  {language === "ar" ? "منطقة الخطر" : "Danger Zone"}
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-gray-900">
                      {language === "ar" ? "حذف الحساب" : "Delete Account"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      {language === "ar"
                        ? "حذف حسابك بشكل دائم. لا يمكن التراجع عن هذا الإجراء."
                        : "Permanently delete your account. This action cannot be undone."}
                    </p>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteDialog(true)}
                      className="w-full h-11 sm:h-12"
                    >
                      <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {language === "ar" ? "حذف الحساب" : "Delete Account"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {language === "ar" ? "تأكيد حذف الحساب" : "Confirm Account Deletion"}
            </DialogTitle>
            <DialogDescription>
              {language === "ar"
                ? "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك بشكل دائم."
                : "This action cannot be undone. Your account and all data will be permanently deleted."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "كلمة المرور للتأكيد" : "Password for confirmation"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="pl-10"
                  placeholder={language === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletePassword("");
              }}
            >
              {language === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting || !deletePassword}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {language === "ar" ? "حذف الحساب" : "Delete Account"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

