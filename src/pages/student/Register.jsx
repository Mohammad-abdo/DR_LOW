import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import LanguageToggle from "@/components/LanguageToggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Mail, Lock, User, Phone, Calendar, GraduationCap, Loader2, AlertCircle, CheckCircle2, UserCircle } from "lucide-react";
import showToast from "@/lib/toast";

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    email: "",
    phone: "",
    password: "",
    repeatPassword: "",
    gender: "",
    year: "",
    semester: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.nameAr || !formData.nameEn || !formData.email || !formData.password || !formData.repeatPassword) {
      setError(language === "ar" ? "جميع الحقول المطلوبة يجب ملؤها" : "All required fields must be filled");
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      setError(language === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError(language === "ar" ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register/student", {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        email: formData.email,
        phone: formData.phone || undefined,
        password: formData.password,
        repeatPassword: formData.repeatPassword,
        gender: formData.gender || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
        department: formData.department || undefined,
      });

      if (response.data?.success) {
        showToast.success(
          language === "ar" ? "تم التسجيل بنجاح" : "Registration successful",
          language === "ar" ? "يمكنك الآن تسجيل الدخول" : "You can now login"
        );
        
        // If student provided year, show basic courses for that year
        if (formData.year) {
          try {
            const basicCoursesRes = await api.get(`/mobile/student/courses/basic/by-year?year=${formData.year}`);
            if (basicCoursesRes.data?.success && basicCoursesRes.data?.data?.courses?.length > 0) {
              // Store basic courses in sessionStorage to show after login
              sessionStorage.setItem('basicCoursesForYear', JSON.stringify({
                year: formData.year,
                courses: basicCoursesRes.data.data.courses,
              }));
            }
          } catch (err) {
            console.error("Error fetching basic courses:", err);
          }
        }
        
        navigate("/student/login");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (language === "ar" ? "فشل التسجيل" : "Registration failed");
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center mb-4"
            >
              <span className="text-white font-bold text-2xl">D</span>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              D.Low
            </CardTitle>
            <CardDescription className="text-base">
              {language === "ar"
                ? "منصة تختص فقط بكورسات الحقوق والقانون"
                : "Platform specialized in law and legal courses"}
            </CardDescription>
            <CardDescription className="text-sm mt-2">
              {language === "ar" ? "تسجيل طالب جديد" : "Student Registration"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "الاسم بالعربية *" : "Name (Arabic) *"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="nameAr"
                      value={formData.nameAr}
                      onChange={handleChange}
                      placeholder={language === "ar" ? "محمد أحمد" : "Mohammed Ahmed"}
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "الاسم بالإنجليزية *" : "Name (English) *"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="nameEn"
                      value={formData.nameEn}
                      onChange={handleChange}
                      placeholder="Mohammed Ahmed"
                      className="pl-10"
                      required
                    />
                  </div>
                </motion.div>
              </div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "البريد الإلكتروني *" : "Email *"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className="pl-10"
                    required
                  />
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "رقم الهاتف" : "Phone Number"}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+96512345678"
                    className="pl-10"
                  />
                </div>
              </motion.div>

              {/* Gender */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.27 }}
              >
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الجنس" : "Gender"}
                </label>
                <div className="relative">
                  <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => {
                      setFormData({ ...formData, gender: value });
                      setError("");
                    }}
                  >
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder={language === "ar" ? "اختر الجنس" : "Select Gender"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">{language === "ar" ? "ذكر" : "Male"}</SelectItem>
                      <SelectItem value="FEMALE">{language === "ar" ? "أنثى" : "Female"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "كلمة المرور *" : "Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      name="repeatPassword"
                      value={formData.repeatPassword}
                      onChange={handleChange}
                      placeholder="••••••"
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "السنة الدراسية" : "Academic Year"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      placeholder="2024"
                      className="pl-10"
                      min="2020"
                      max="2030"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "الفصل الدراسي" : "Semester"}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      placeholder="1"
                      className="pl-10"
                      min="1"
                      max="2"
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    {language === "ar" ? "القسم" : "Department"}
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder={language === "ar" ? "علوم الحاسوب" : "Computer Science"}
                      className="pl-10"
                    />
                  </div>
                </motion.div>
              </div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "ar" ? "جاري التسجيل..." : "Registering..."}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    {language === "ar" ? "إنشاء الحساب" : "Create Account"}
                  </>
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-center text-sm"
            >
              <p className="text-muted-foreground">
                {language === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <Link
                  to="/student/login"
                  className="text-red-600 font-semibold hover:underline"
                >
                  {language === "ar" ? "تسجيل الدخول" : "Sign In"}
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

