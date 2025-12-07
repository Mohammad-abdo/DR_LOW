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
import { Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const userRole = (user.role || "").toUpperCase();
      if (userRole === "STUDENT") {
        // Student trying to access admin login - redirect to student login
        navigate("/student/login", { replace: true });
      } else if (userRole === "ADMIN" || userRole === "TEACHER") {
        // Already logged in as admin/teacher - redirect to dashboard
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Only allow ADMIN or TEACHER roles from this login page
      if (role === "STUDENT") {
        setError(
          language === "ar"
            ? "هذه الصفحة للمدراء والمعلمين فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بالطلاب."
            : "This page is for administrators and teachers only. Please use the student login page."
        );
        setLoading(false);
        return;
      }

      await login(email, password, role);
      const user = JSON.parse(localStorage.getItem("auth_user"));
      const userRole = (user.role || role).toUpperCase();

      // Strict role checking - reject students
      if (userRole === "STUDENT") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setError(
          language === "ar"
            ? "هذه الصفحة للمدراء والمعلمين فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بالطلاب."
            : "This page is for administrators and teachers only. Please use the student login page."
        );
        setLoading(false);
        return;
      }

      if (userRole === "ADMIN" || userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "TEACHER" || userRole === "teacher") {
        navigate("/admin/dashboard");
      } else {
        // Unknown role - redirect to appropriate page
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 text-center pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-foreground"
              >
                <path
                  d="M6 10C6 9.44772 6.44772 9 7 9H9C9.55228 9 10 9.44772 10 10V14C10 14.5523 9.55228 15 9 15H7C6.44772 15 6 14.5523 6 14V10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M10 10C10 9.44772 10.4477 9 11 9H13C13.5523 9 14 9.44772 14 10V14C14 14.5523 13.5523 15 13 15H11C10.4477 15 10 14.5523 10 14V10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M14 10C14 9.44772 14.4477 9 15 9H17C17.5523 9 18 9.44772 18 10V14C18 14.5523 17.5523 15 17 15H15C14.4477 15 14 14.5523 14 14V10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <line
                  x1="12"
                  y1="10"
                  x2="12"
                  y2="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </motion.div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('login.title')}
            </CardTitle>
            <CardDescription className="text-lg">
              {language === 'ar' ? 'تسجيل دخول المدراء والمعلمين' : 'Admin & Teacher Login'}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              {language === 'ar' 
                ? 'هذه الصفحة للمدراء والمعلمين فقط'
                : 'This page is for administrators and teachers only'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
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
                  {t('login.email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="admin@lms.edu.kw"
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
                  {t('login.password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder={t('login.password')}
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-2"
              >
                <label htmlFor="role" className="text-sm font-medium">
                  {language === 'ar' ? 'الدور' : 'Role'}
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="ADMIN">{language === 'ar' ? 'مدير' : 'Admin'}</option>
                  <option value="TEACHER">{language === 'ar' ? 'معلم' : 'Teacher'}</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' 
                    ? 'الطلاب: يرجى استخدام صفحة تسجيل الدخول الخاصة بالطلاب'
                    : 'Students: Please use the student login page'}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('login.signingIn')}
                  </>
                ) : (
                  t('login.signIn')
                )}
              </motion.button>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 space-y-4"
            >
              {role === "STUDENT" && (
                <div className="text-center text-sm">
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{" "}
                    <Link
                      to="/register"
                      className="text-primary font-semibold hover:underline"
                    >
                      {language === 'ar' ? 'سجل الآن' : 'Register Now'}
                    </Link>
                  </p>
                </div>
              )}
              <div className="text-center text-sm text-muted-foreground">
                <p>{language === 'ar' ? 'بيانات الدخول الافتراضية' : 'Default Credentials'}</p>
                <div className="font-mono text-xs mt-2 space-y-1">
                  <p><strong>Admin:</strong> admin@lms.edu.kw / admin123</p>
                  <p><strong>Teacher:</strong> teacher@lms.edu.kw / teacher123</p>
                </div>
                <p className="text-xs mt-2 text-primary">
                  {language === 'ar' 
                    ? 'الطلاب: استخدم /student/login'
                    : 'Students: Use /student/login'}
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
