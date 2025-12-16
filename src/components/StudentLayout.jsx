import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageToggle from "@/components/LanguageToggle";
import {
  Home,
  BookOpen,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ShoppingCart,
  GraduationCap,
  Award,
  Settings,
  HelpCircle,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Search,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import showToast from "@/lib/toast";
import { getImageUrl } from "@/lib/imageHelper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Force light mode for student view
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    
    fetchNotifications();
    fetchCartCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications?limit=10");
      const data = extractDataFromResponse(response);
      const notificationsList = Array.isArray(data.notifications) ? data.notifications : [];
      setNotifications(notificationsList);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await api.get("/mobile/student/cart");
      const data = extractDataFromResponse(response);
      const items = Array.isArray(data.items) ? data.items : (data.cart?.items || []);
      setCartCount(items.length);
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/student/login");
    showToast.success(
      language === "ar" ? "تم تسجيل الخروج" : "Logged out successfully"
    );
  };

  const navItems = [
    {
      icon: Home,
      label: language === "ar" ? "الرئيسية" : "Home",
      path: "/dashboard",
      id: "home",
    },
    {
      icon: BookOpen,
      label: language === "ar" ? "دوراتي" : "My Courses",
      path: "/dashboard/my-courses",
      id: "my-courses",
    },
    {
      icon: GraduationCap,
      label: language === "ar" ? "جميع الكورسات" : "All Courses",
      path: "/dashboard/all-courses",
      id: "all-courses",
    },
    {
      icon: FileText,
      label: language === "ar" ? "الامتحانات" : "Exams",
      path: "/dashboard/exams",
      id: "exams",
    },
    {
      icon: User,
      label: language === "ar" ? "الملف الشخصي" : "Profile",
      path: "/dashboard/profile",
      id: "profile",
    },
    {
      icon: HelpCircle,
      label: language === "ar" ? "المساعدة" : "Help",
      path: "/dashboard/help",
      id: "help",
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-3 sm:gap-4">
            {/* Logo Section */}
            <Link to="/dashboard" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-lg sm:text-xl font-bold text-white">D</span>
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent hidden sm:inline">
                D.Low
              </span>
            </Link>

            {/* Desktop Navigation - Text Only, No Icons */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl">
              {navItems.slice(0, 4).map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`relative flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-amber-50 text-amber-700 shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.id === "cart" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                  {isActive(item.path) && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-amber-50 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                <input
                  type="text"
                  placeholder={language === "ar" ? "ابحث عن الدورات..." : "Search courses..."}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/dashboard/all-courses?search=${e.target.value}`);
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {/* Language Toggle */}
              <div className="hidden sm:block">
                <LanguageToggle />
              </div>

              {/* Notifications */}
              <NotificationsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                fetchNotifications={fetchNotifications}
              />

              {/* Cart Icon - Desktop */}
              <Link
                to="/dashboard/cart"
                className="hidden lg:flex relative items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full p-0 hover:ring-2 hover:ring-amber-500/20 transition-all"
                  >
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user?.avatar)}
                        alt={user?.nameEn || "User"}
                        className="h-full w-full rounded-full object-cover ring-2 ring-gray-200"
                      />
                    ) : (
                      <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {(language === "ar" ? user?.nameAr : user?.nameEn)?.charAt(0) || "U"}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-2" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {language === "ar" ? user?.nameAr : user?.nameEn}
                      </p>
                      <p className="text-xs leading-none text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>{language === "ar" ? "الملف الشخصي" : "Profile"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{language === "ar" ? "الإعدادات" : "Settings"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{language === "ar" ? "تسجيل الخروج" : "Log out"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Button - Mobile/Tablet */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => {
                  const searchQuery = prompt(language === "ar" ? "ابحث عن الدورات..." : "Search courses...");
                  if (searchQuery) {
                    navigate(`/dashboard/all-courses?search=${searchQuery}`);
                  }
                }}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Menu Button - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 sm:h-10 sm:w-10"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: language === "ar" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: language === "ar" ? "100%" : "-100%" }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-y-0 ${language === "ar" ? "right-0" : "left-0"} w-64 bg-white shadow-xl z-50 md:hidden flex flex-col`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold">
                  D
                </div>
                <span className="text-xl font-bold text-gray-900">D.Low</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                    isActive(item.path)
                      ? "bg-amber-100 text-amber-900 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 mt-4 text-red-600 hover:bg-red-50 font-medium"
                onClick={handleLogout}
              >
                <span>{language === "ar" ? "تسجيل الخروج" : "Log out"}</span>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        />
      )}

      {/* Main Content - Full width on large screens */}
      <main className="w-full min-h-[calc(100vh-4rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* About Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-md">
                  <span className="text-xl font-bold text-white">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">D.Low</span>
              </div>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {language === "ar" 
                  ? "منصة تعليمية متكاملة لتطوير مهاراتك ومعرفتك"
                  : "A comprehensive educational platform to develop your skills and knowledge"}
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-600 hover:text-amber-600 transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-600 hover:text-amber-600 transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-amber-100 flex items-center justify-center text-gray-600 hover:text-amber-600 transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">
                {language === "ar" ? "روابط سريعة" : "Quick Links"}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-block">
                    {language === "ar" ? "الرئيسية" : "Home"}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/all-courses" className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-block">
                    {language === "ar" ? "جميع الكورسات" : "All Courses"}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/my-courses" className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-block">
                    {language === "ar" ? "دوراتي" : "My Courses"}
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard/profile" className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-block">
                    {language === "ar" ? "الملف الشخصي" : "Profile"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">
                {language === "ar" ? "الدعم" : "Support"}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard/help" className="text-gray-600 hover:text-amber-600 text-sm transition-colors inline-block">
                    {language === "ar" ? "المساعدة" : "Help Center"}
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@dlow.edu" className="text-gray-600 hover:text-amber-600 text-sm transition-colors flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    support@dlow.edu
                  </a>
                </li>
                <li>
                  <a href="tel:+96512345678" className="text-gray-600 hover:text-amber-600 text-sm transition-colors flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +965 1234 5678
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4 text-gray-900">
                {language === "ar" ? "معلومات الاتصال" : "Contact Info"}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600 text-sm">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                  <span>
                    {language === "ar" 
                      ? "الكويت، مدينة الكويت"
                      : "Kuwait City, Kuwait"}
                  </span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-sm">
                  <Mail className="w-5 h-5 shrink-0 text-gray-400" />
                  <span>info@dlow.edu</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600 text-sm">
                  <Phone className="w-5 h-5 shrink-0 text-gray-400" />
                  <span>+965 1234 5678</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">
              {language === "ar" 
                ? "© 2024 D.Low. جميع الحقوق محفوظة."
                : "© 2024 D.Low. All rights reserved."}
            </p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) - Text Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40 shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] ${
                isActive(item.path) ? "text-amber-600 font-semibold" : "text-gray-600"
              }`}
            >
              <div className="relative">
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
                {item.id === "cart" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
