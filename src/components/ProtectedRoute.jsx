import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const ProtectedRoute = ({ children, requireAdmin = false, requireDoctor = false, requireRepresentative = false, requireShop = false, requireDriver = false, requireCompany = false, requirePharmacy = false, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const { language } = useLanguage();

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

  if (!user) {
    // Check if trying to access student routes
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/dashboard') || currentPath.startsWith('/student')) {
      return <Navigate to="/student/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check role requirements - normalize to lowercase for comparison
  const userRole = (user.role || '').toLowerCase();
  const roleNames = (user.role_names || []).map(r => r.toLowerCase());
  
  const hasAdminRole = userRole === 'admin' || userRole === 'ADMIN' || roleNames.includes('admin');
  const hasTeacherRole = userRole === 'teacher' || userRole === 'TEACHER' || roleNames.includes('teacher');
  const hasStudentRole = userRole === 'student' || userRole === 'STUDENT' || roleNames.includes('student');
  // Legacy roles for backward compatibility
  const hasDoctorRole = userRole === 'doctor' || roleNames.includes('doctor');
  const hasRepresentativeRole = userRole === 'representative' || roleNames.includes('representative');
  const hasShopRole = userRole === 'shop' || roleNames.includes('shop');
  const hasDriverRole = userRole === 'driver' || roleNames.includes('driver');
  const hasCompanyRole = userRole === 'company' || roleNames.includes('company');
  const hasPharmacyRole = userRole === 'pharmacy' || roleNames.includes('pharmacy');

  if (requireAdmin && !hasAdminRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  if (requireDoctor && !hasDoctorRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only doctors can access this page.</p>
          <p className="text-sm text-muted-foreground mt-2">Your roles: {roleNames.length > 0 ? roleNames.join(', ') : 'None'}</p>
        </div>
      </div>
    );
  }

  if (requireRepresentative && !hasRepresentativeRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only representatives can access this page.</p>
        </div>
      </div>
    );
  }

  if (requireShop && !hasShopRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only shop owners can access this page.</p>
        </div>
      </div>
    );
  }

  if (requireDriver && !hasDriverRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only drivers can access this page.</p>
        </div>
      </div>
    );
  }

  if (requireCompany && !hasCompanyRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only company owners can access this page.</p>
        </div>
      </div>
    );
  }

  if (requirePharmacy && !hasPharmacyRole) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">Only pharmacy owners can access this page.</p>
        </div>
      </div>
    );
  }

  // Check if trying to access student routes - only students allowed
  const currentPath = window.location.pathname;
  if ((currentPath.startsWith('/dashboard') || currentPath.startsWith('/student')) && !hasStudentRole) {
    if (hasAdminRole || hasTeacherRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              {language === "ar" ? "غير مسموح" : "Access Denied"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "هذه الصفحة للطلاب فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بك."
                : "This page is for students only. Please use your login page."}
            </p>
          </div>
        </div>
      );
    }
    return <Navigate to="/student/login" replace />;
  }

  // Check if trying to access admin routes - only admins/teachers allowed
  if (currentPath.startsWith('/admin') && !hasAdminRole && !hasTeacherRole) {
    if (hasStudentRole) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">
              {language === "ar" ? "غير مسموح" : "Access Denied"}
            </h1>
            <p className="text-muted-foreground">
              {language === "ar" 
                ? "هذه الصفحة للمدراء فقط. يرجى استخدام صفحة تسجيل الدخول الخاصة بك."
                : "This page is for administrators only. Please use your login page."}
            </p>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && !allowedRoles.some(role => roleNames.includes(role))) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
