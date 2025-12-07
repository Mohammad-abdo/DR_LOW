import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import LanguageToggle from "@/components/LanguageToggle";
import ProfileDropdown from "@/components/ProfileDropdown";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  Menu,
  LogOut,
  User,
  Folder,
  Sliders,
  MessageSquare,
  BarChart3,
  Wallet,
  Upload,
  Settings,
  X,
  Search,
  Bell,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  BookOpen,
  GraduationCap,
  ClipboardList,
  CreditCard,
  Star,
  Image,
  Settings2,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [quickStats, setQuickStats] = useState({
    pendingPayments: 0,
    unreadNotifications: 0,
    todayRevenue: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { sidebarStyle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const mainRef = useRef(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener("scroll", handleScroll);
      return () => mainElement.removeEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch quick stats for header
  useEffect(() => {
    const fetchQuickStats = async () => {
      try {
        const [dashboardRes, notificationsRes] = await Promise.all([
          api.get("/admin/dashboard/stats").catch(() => ({ data: {} })),
          api.get("/notifications?limit=10").catch(() => ({ data: {} })),
        ]);

        const dashboard = dashboardRes.data?.data || dashboardRes.data || {};
        const notificationsData = extractDataFromResponse(notificationsRes);
        
        // Ensure notifications is an array
        const notifications = Array.isArray(notificationsData) 
          ? notificationsData 
          : (notificationsData?.notifications || notificationsData?.data || []);

        // Get unread count from response or calculate from notifications
        let unreadNotifications = 0;
        if (notificationsData?.unreadCount !== undefined) {
          unreadNotifications = notificationsData.unreadCount;
        } else if (notificationsData?.data?.unreadCount !== undefined) {
          unreadNotifications = notificationsData.data.unreadCount;
        } else if (Array.isArray(notifications)) {
          unreadNotifications = notifications.filter((n) => {
            const recipient = n.recipients?.[0];
            return !recipient?.read && !n.read && !n.is_read;
          }).length;
        }

        setQuickStats({
          pendingPayments: 0, // Will be calculated from payments
          unreadNotifications,
          todayRevenue: dashboard.stats?.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Error fetching quick stats:", error);
        // Set default values on error
        setQuickStats({
          pendingPayments: 0,
          unreadNotifications: 0,
          todayRevenue: 0,
        });
      }
    };

    fetchQuickStats();
    const interval = setInterval(fetchQuickStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const isRTL = language === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: isRTL ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 300 : -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed ${
                isRTL ? "right-0" : "left-0"
              } top-0 h-full w-64 bg-card border-r border z-50 lg:hidden`}
            >
              <SidebarContent
                location={location}
                user={user}
                onClose={() => setSidebarOpen(false)}
                isRTL={isRTL}
                sidebarStyle={sidebarStyle}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <div className="flex">
        {/* Fixed Sidebar */}
        <aside
          className={`hidden lg:flex lg:flex-shrink-0 fixed ${
            isRTL ? "right-0" : "left-0"
          } top-0 h-screen z-[80]`}
        >
          <div
            className={`w-64 h-full overflow-hidden flex flex-col transition-all ${
              sidebarStyle === "gradient"
                ? "bg-gradient-to-b from-primary/10 via-card to-card border-r border"
                : sidebarStyle === "minimal"
                ? "bg-card/50 backdrop-blur-sm border-r border/50"
                : sidebarStyle === "compact"
                ? "bg-card border-r border"
                : "bg-card border-r border"
            }`}
          >
            <SidebarContent
              location={location}
              user={user}
              isRTL={isRTL}
              sidebarStyle={sidebarStyle}
            />
          </div>
        </aside>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            isRTL ? "mr-64" : "ml-64"
          }`}
        >
          {/* Animated Header */}
          <motion.header
            style={{
              opacity: headerOpacity,
            }}
            className={`sticky top-0 z-[90] bg-card/95 backdrop-blur-md border-b border transition-shadow duration-300 ${
              isScrolled ? "shadow-lg" : "shadow-sm"
            } ${isRTL ? "text-right" : "text-left"}`}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="space-y-2">
              {/* Top Row - Menu, Search, Actions */}
              <div
                className={`flex items-center justify-between h-16 px-4 lg:px-6 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <motion.button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.button>

                  {/* Search Bar */}
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="hidden md:flex items-center relative"
                  >
                    <Search
                      className={`absolute ${
                        isRTL ? "right-3" : "left-3"
                      } top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4`}
                    />
                    <input
                      type="text"
                      placeholder={language === "ar" ? "بحث..." : "Search..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && searchQuery) {
                          navigate(`/admin/search?q=${searchQuery}`);
                        }
                      }}
                      className={`${
                        isRTL ? "pr-10 pl-4" : "pl-10 pr-4"
                      } py-2 w-64 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary`}
                    />
                  </motion.div>
                </div>

                <motion.div
                  className={`flex items-center gap-2 ${
                    isRTL ? "mr-auto flex-row-reverse" : "ml-auto"
                  }`}
                  initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <NotificationsDropdown />
                  <LanguageToggle />
                  <ProfileDropdown />
                </motion.div>
              </div>

              {/* Bottom Row - Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`hidden lg:flex items-center gap-4 px-4 lg:px-6 pb-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                {/* Quick Stats Cards */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/admin/payments?status=PENDING")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 cursor-pointer hover:bg-orange-500/20 transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">
                    {language === "ar" ? "مدفوعات معلقة" : "Pending Payments"}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/admin/notifications")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 cursor-pointer hover:bg-blue-500/20 transition-colors"
                >
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    {quickStats.unreadNotifications}{" "}
                    {language === "ar" ? "إشعارات غير مقروءة" : "Unread"}
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  onClick={() => navigate("/admin/financial")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 cursor-pointer hover:bg-green-500/20 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">
                    {quickStats.todayRevenue.toLocaleString()} KWD{" "}
                    {language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.header>

          {/* Scrollable Main Content */}
          <main ref={mainRef} className="flex-1 p-4 lg:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
      //{" "}
    </div>
  );
}

function SidebarLogo({ isRTL }) {
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    // Try to get logo from localStorage or fetch from API
    const storedLogo = localStorage.getItem("site_logo");
    if (storedLogo) {
      setLogoUrl(storedLogo);
    } else {
      // Try to fetch from API
      api
        .get("/admin/settings")
        .then((response) => {
          const settings = response.data?.data || response.data || {};
          if (settings.site_logo) {
            setLogoUrl(settings.site_logo);
            localStorage.setItem("site_logo", settings.site_logo);
          }
        })
        .catch(() => {});
    }

    // Listen for logo updates
    const handleStorageChange = () => {
      const newLogo = localStorage.getItem("site_logo");
      if (newLogo) setLogoUrl(newLogo);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", delay: 0.2 }}
      className="flex items-center gap-2"
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt="Logo"
          className="h-10 w-auto object-contain max-w-[120px]"
          onError={() => setLogoUrl("")}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
            style={{ color: "hsl(var(--primary-foreground))" }}
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
          </svg>
        </div>
      )}
      <span
        className="font-bold text-lg"
        style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.6))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {isRTL ? "نظام إدارة التعلم" : "LMS Admin"}
      </span>
    </motion.div>
  );
}

function SidebarContent({
  location,
  user,
  onClose,
  isRTL,
  sidebarStyle = "default",
}) {
  const { t, language } = useLanguage();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setOpenMenus((prev) => {
      // Close all other menus when opening a new one
      const newState = {};
      if (!prev[menuKey]) {
        // Opening this menu - close all others
        newState[menuKey] = true;
      }
      // If already open, close it (don't set to false, just remove it)
      return newState;
    });
  };

  const adminMenuItems = [
    {
      icon: LayoutDashboard,
      label: language === "ar" ? "لوحة التحكم" : "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: BookOpen,
      label: language === "ar" ? "الدورات" : "Courses",
      path: "/admin/courses",
      children: [
        {
          label: language === "ar" ? "جميع الدورات" : "All Courses",
          path: "/admin/courses",
        },
        {
          label: language === "ar" ? "إضافة دورة" : "Add Course",
          path: "/admin/courses/new",
        },
      ],
    },
    {
      icon: Folder,
      label: language === "ar" ? "الفئات" : "Categories",
      path: "/admin/categories",
      children: [
        {
          label: language === "ar" ? "جميع الفئات" : "All Categories",
          path: "/admin/categories",
        },
        {
          label: language === "ar" ? "إضافة فئة" : "Add Category",
          path: "/admin/categories/new",
        },
      ],
    },
    {
      icon: ClipboardList,
      label: language === "ar" ? "الامتحانات" : "Exams",
      path: "/admin/exams",
      children: [
        {
          label: language === "ar" ? "جميع الامتحانات" : "All Exams",
          path: "/admin/exams",
        },
        {
          label: language === "ar" ? "إضافة امتحان" : "Add Exam",
          path: "/admin/exams/new",
        },
      ],
    },
    {
      icon: Users,
      label: language === "ar" ? "المستخدمين" : "Users",
      path: "/admin/users",
      children: [
        {
          label: language === "ar" ? "جميع المستخدمين" : "All Users",
          path: "/admin/users",
        },
        {
          label: language === "ar" ? "إضافة طالب" : "Add Student",
          path: "/admin/users/create?role=STUDENT",
        },
        {
          label: language === "ar" ? "إضافة معلم" : "Add Teacher",
          path: "/admin/users/create?role=TEACHER",
        },
      ],
    },
    {
      icon: Image,
      label: language === "ar" ? "البانرات" : "Banners",
      path: "/admin/banners",
      children: [
        {
          label: language === "ar" ? "جميع البانرات" : "All Banners",
          path: "/admin/banners",
        },
        {
          label: language === "ar" ? "إضافة بانر" : "Add Banner",
          path: "/admin/banners/new",
        },
      ],
    },
    {
      icon: CreditCard,
      label: language === "ar" ? "المدفوعات" : "Payments",
      path: "/admin/payments",
    },
    {
      icon: Star,
      label: language === "ar" ? "التقييمات" : "Ratings",
      path: "/admin/ratings",
    },
    {
      icon: MessageSquare,
      label: language === "ar" ? "الدعم الفني" : "Support",
      path: "/admin/support",
    },
    {
      icon: BarChart3,
      label: language === "ar" ? "التقارير" : "Reports",
      path: "/admin/reports",
    },
    {
      icon: Wallet,
      label: language === "ar" ? "المالية" : "Financial",
      path: "/admin/financial",
    },
    {
      icon: Bell,
      label: language === "ar" ? "الإشعارات" : "Notifications",
      path: "/admin/notifications",
    },
    {
      icon: Settings,
      label: language === "ar" ? "الإعدادات" : "Settings",
      path: "/admin/settings",
    },
  ];

  return (
    <div className="flex flex-col h-full" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar Header */}
      <div className="h-16 flex items-center justify-center border-b border flex-shrink-0">
        <SidebarLogo isRTL={isRTL} />
        {onClose && (
          <motion.button
            onClick={onClose}
            className={`absolute ${
              isRTL ? "left-4" : "right-4"
            } p-2 rounded-lg hover:bg-accent transition-colors lg:hidden`}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {adminMenuItems.map((item, index) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isMenuOpen = openMenus[item.path] || false;
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/admin/dashboard" &&
              item.path !== "/admin/settings" &&
              location.pathname.startsWith(item.path + "/"));

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <div>
                <div
                  className={`flex items-center gap-3 rounded-lg transition-all relative group ${
                    sidebarStyle === "compact" ? "px-3 py-2" : "px-4 py-3"
                  } ${
                    isActive
                      ? sidebarStyle === "gradient"
                        ? "bg-primary text-primary-foreground shadow-lg"
                        : sidebarStyle === "minimal"
                        ? "bg-primary/20 text-primary border-l-2 border-primary"
                        : "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  } ${hasChildren ? "cursor-pointer" : ""}`}
                  onClick={
                    hasChildren ? () => toggleMenu(item.path) : undefined
                  }
                >
                  <Icon
                    className={`flex-shrink-0 ${
                      sidebarStyle === "compact" ? "w-4 h-4" : "w-5 h-5"
                    }`}
                  />
                  {!hasChildren ? (
                    <Link to={item.path} onClick={onClose} className="flex-1">
                      <span
                        className={`font-medium ${
                          sidebarStyle === "compact" ? "text-xs" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  ) : (
                    <>
                      <span
                        className={`font-medium flex-1 ${
                          sidebarStyle === "compact" ? "text-xs" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                      <motion.div
                        animate={{ rotate: isMenuOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </>
                  )}
                  {isActive && !hasChildren && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-primary rounded-lg -z-10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </div>

                {/* Children Menu */}
                {hasChildren && (
                  <AnimatePresence>
                    {isMenuOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={`${
                            isRTL ? "mr-4" : "ml-4"
                          } mt-1 space-y-1`}
                        >
                          {item.children.map((child, childIndex) => {
                            const childIsActive =
                              location.pathname === child.path;
                            return (
                              <motion.div
                                key={child.path}
                                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: childIndex * 0.05 }}
                              >
                                <Link
                                  to={child.path}
                                  onClick={onClose}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                                    childIsActive
                                      ? "bg-primary/20 text-primary font-medium"
                                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                  }`}
                                >
                                  <ChevronRight
                                    className={`w-3 h-3 flex-shrink-0 ${
                                      isRTL ? "rotate-180" : ""
                                    }`}
                                  />
                                  <span className="flex-1">{child.label}</span>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
