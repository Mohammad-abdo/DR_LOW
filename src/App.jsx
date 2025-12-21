import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ErrorBoundary } from "./components/ErrorBoundary";
import AdminLayout from "./components/AdminLayout";
import StudentLayout from "./components/StudentLayout";
import Login from "./pages/Login";
import StudentLogin from "./pages/student/StudentLogin";
import Register from "./pages/student/Register";
import StudentHome from "./pages/student/Home";
import MyCourses from "./pages/student/MyCourses";
import AllCourses from "./pages/student/AllCourses";
import CourseDetail from "./pages/student/CourseDetail";
import Learning from "./pages/student/Learning";
import Profile from "./pages/student/Profile";
import Help from "./pages/student/Help";
import Share from "./pages/student/Share";
import Wishlist from "./pages/student/Wishlist";
import Cart from "./pages/student/Cart";
import Payment from "./pages/student/Payment";
import Exams from "./pages/student/Exams";
import ExamDetail from "./pages/student/ExamDetail";
import ExamResult from "./pages/student/ExamResult";

// Admin Pages - LMS Only
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCategoryDetail from "./pages/admin/AdminCategoryDetail";
import AdminCategoryCreate from "./pages/admin/AdminCategoryCreate";
import AdminCategoryEdit from "./pages/admin/AdminCategoryEdit";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCourseCreate from "./pages/admin/AdminCourseCreate";
import AdminCourseDetail from "./pages/admin/AdminCourseDetail";
import AdminCourseEdit from "./pages/admin/AdminCourseEdit";
import AdminCourseContentManage from "./pages/admin/AdminCourseContentManage";
import AdminExams from "./pages/admin/AdminExams";
import AdminExamCreate from "./pages/admin/AdminExamCreate";
import AdminExamDetail from "./pages/admin/AdminExamDetail";
import AdminExamEdit from "./pages/admin/AdminExamEdit";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminBannerCreate from "./pages/admin/AdminBannerCreate";
import AdminBannerDetail from "./pages/admin/AdminBannerDetail";
import AdminBannerEdit from "./pages/admin/AdminBannerEdit";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPaymentDetail from "./pages/admin/AdminPaymentDetail";
import AdminCourseRequests from "./pages/admin/AdminCourseRequests";
import AdminUploads from "./pages/admin/AdminUploads";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminUserCreate from "./pages/admin/AdminUserCreate";
import AdminUserEdit from "./pages/admin/AdminUserEdit";
import AdminRatings from "./pages/admin/AdminRatings";
import AdminRatingDetail from "./pages/admin/AdminRatingDetail";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminTicketDetail from "./pages/admin/AdminTicketDetail";
import AdminFinancial from "./pages/admin/AdminFinancial";
import AdminReports from "./pages/admin/AdminReports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminAboutApp from "./pages/admin/AdminAboutApp";
import AdminHelpSupport from "./pages/admin/AdminHelpSupport";
import AdminAppPolicies from "./pages/admin/AdminAppPolicies";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminPermissions from "./pages/admin/AdminPermissions";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return "/login";

    // Check role from role property - normalize to lowercase
    const userRole = (user.role || "").toLowerCase();
    const roleNames = (user.role_names || []).map((r) => r.toLowerCase());

    const hasAdminRole =
      userRole === "admin" ||
      userRole === "ADMIN" ||
      roleNames.includes("admin");
    const hasTeacherRole =
      userRole === "teacher" ||
      userRole === "TEACHER" ||
      roleNames.includes("teacher");
    const hasStudentRole =
      userRole === "student" ||
      userRole === "STUDENT" ||
      roleNames.includes("student");

    if (hasAdminRole) return "/admin/dashboard";
    if (hasTeacherRole) return "/admin/dashboard"; // Teachers can access admin dashboard
    if (hasStudentRole) return "/dashboard";
    return "/login";
  };

  return (
    <Routes>
      {/* Admin/Teacher Login - Protected from students */}
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Login />
          )
        }
      />

      {/* Student Login/Register - Protected from admins/teachers */}
      <Route
        path="/student/login"
        element={
          user ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <StudentLogin />
          )
        }
      />
      <Route
        path="/student/register"
        element={
          user ? (
            <Navigate to={getDefaultRoute()} replace />
          ) : (
            <Register />
          )
        }
      />

      {/* Admin Routes - LMS Only */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Categories */}
      <Route
        path="/admin/categories"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCategories />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCategoryCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCategoryDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/categories/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCategoryEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Courses */}
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourses />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourseCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourseDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourseEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:courseId/content"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourseContentManage />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Exams */}
      <Route
        path="/admin/exams"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminExams />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminExamCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminExamDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/exams/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminExamEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Banners */}
      <Route
        path="/admin/banners"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBanners />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/banners/new"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBannerCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/banners/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBannerDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/banners/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminBannerEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Payments */}
      <Route
        path="/admin/payments"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminPayments />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/payments/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminPaymentDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Course Requests */}
      <Route
        path="/admin/course-requests"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminCourseRequests />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Video Uploads */}
      <Route
        path="/admin/uploads"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUploads />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Users */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/create"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUserCreate />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUserEdit />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminUserDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Ratings */}
      <Route
        path="/admin/ratings"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminRatings />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ratings/:type/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminRatingDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Support/Tickets */}
      <Route
        path="/admin/support"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminSupport />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/support/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminTicketDetail />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Financial */}
      <Route
        path="/admin/financial"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminFinancial />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminNotifications />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Profile */}
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* About App */}
      <Route
        path="/admin/about-app"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminAboutApp />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Help & Support */}
      <Route
        path="/admin/help-support"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminHelpSupport />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* App Policies */}
      <Route
        path="/admin/app-policies"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminAppPolicies />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Roles & Permissions */}
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminRoles />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/permissions"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <AdminPermissions />
            </AdminLayout>
          </ProtectedRoute>
        }
      />

      {/* Student Routes - STRICT: Only students allowed */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <StudentHome />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/my-courses"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <MyCourses />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/all-courses"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <AllCourses />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/courses/:id"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <CourseDetail />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/learning/:id"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Learning />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Profile />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/help"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Help />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/share"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Share />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/wishlist"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Wishlist />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/cart"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Cart />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/payment"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Payment />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/exams"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <Exams />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/exams/:id"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <ExamDetail />
            </StudentLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/exams/:id/result"
        element={
          <ProtectedRoute requireStudent>
            <StudentLayout>
              <ExamResult />
            </StudentLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
