import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
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
import { Mail, Lock, Loader2, AlertCircle, GraduationCap } from "lucide-react";
import showToast from "@/lib/toast";

export default function StudentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Force STUDENT role
      await login(email, password, "STUDENT");
      const user = JSON.parse(localStorage.getItem("auth_user"));
      const userRole = (user.role || "").toUpperCase();

      // Strict check - Only allow STUDENT role, reject ADMIN and TEACHER
      if (userRole === "ADMIN" || userRole === "TEACHER") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setError(
          language === "ar"
            ? "هذه الصفحة للطلاب فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بالمدراء."
            : "This page is for students only. Please use the admin login page."
        );
        showToast.error(
          language === "ar"
            ? "غير مسموح لك بالدخول إلى هذه الصفحة"
            : "You are not allowed to access this page"
        );
        setLoading(false);
        return;
      }

      if (userRole !== "STUDENT") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setError(
          language === "ar"
            ? "هذه الصفحة للطلاب فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بك."
            : "This page is for students only. Please use your login page."
        );
        showToast.error(
          language === "ar"
            ? "غير مسموح لك بالدخول إلى هذه الصفحة"
            : "You are not allowed to access this page"
        );
        setLoading(false);
        return;
      }

      navigate("/dashboard");
      showToast.success(
        language === "ar" ? "تم تسجيل الدخول بنجاح" : "Logged in successfully"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (language === "ar" ? "فشل تسجيل الدخول" : "Login failed")
      );
      showToast.error(
        err.response?.data?.message ||
          (language === "ar" ? "فشل تسجيل الدخول" : "Login failed")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Force light mode
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    // Redirect if already logged in
    if (user) {
      const userRole = (user.role || "").toUpperCase();
      if (userRole === "ADMIN" || userRole === "TEACHER") {
        // Admin/Teacher trying to access student login - redirect to admin login
        navigate("/login", { replace: true });
      } else if (userRole === "STUDENT") {
        // Already logged in as student - redirect to dashboard
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="space-y-1 text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center"
            >
              <span className="text-white font-bold text-2xl">D</span>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              D.Low
            </CardTitle>
            <CardDescription className="text-lg">
              {language === "ar"
                ? "منصة تختص فقط بكورسات الحقوق والقانون"
                : "Platform specialized in law and legal courses"}
            </CardDescription>
            <CardDescription className="text-base mt-2">
              {language === "ar"
                ? "تسجيل دخول الطلاب"
                : "Student Login"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label htmlFor="email" className="text-sm font-medium">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="student@example.com"
                    className="pr-10"
                    dir="ltr"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label htmlFor="password" className="text-sm font-medium">
                  {language === "ar" ? "كلمة المرور" : "Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                    className="pr-10"
                  />
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold hover:from-red-700 hover:to-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {language === "ar" ? "جاري تسجيل الدخول..." : "Logging in..."}
                  </>
                ) : (
                  language === "ar" ? "تسجيل الدخول" : "Login"
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 text-center text-sm"
            >
              {language === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
              <Link
                to="/student/register"
                className="text-red-600 hover:underline font-medium"
              >
                {language === "ar" ? "سجل الآن" : "Register Now"}
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

