import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import StatCard from "@/components/StatCard";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  Activity,
  ArrowRight,
  Eye,
  Clock,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  UserCog,
  Book,
  ClipboardList,
  Upload,
  HardDrive,
} from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";

export default function AdminDashboard() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    publishedCourses: 0,
    draftCourses: 0,
    pendingCourseRequests: 0,
    approvedCourseRequests: 0,
    rejectedCourseRequests: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [salesTrendData, setSalesTrendData] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [courseRequestsData, setCourseRequestsData] = useState({ requests: [], counts: {} });

  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array - only fetch once on mount

  // Memoize expensive calculations to prevent re-renders
  const memoizedChartData = useMemo(() => chartData, [chartData]);
  const memoizedBarChartData = useMemo(() => barChartData, [barChartData]);
  const memoizedSalesTrendData = useMemo(
    () => salesTrendData,
    [salesTrendData]
  );

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, paymentsRes, usersRes, coursesRes, courseRequestsRes] =
        await Promise.all([
          api.get("/admin/dashboard/stats").catch(() => ({ data: {} })),
          api.get("/admin/payments?limit=10").catch(() => ({ data: [] })),
          api.get("/admin/users?limit=10").catch(() => ({ data: [] })),
          api.get("/admin/courses?limit=10").catch(() => ({ data: [] })),
          api.get("/admin/course-requests").catch(() => ({ data: { requests: [], counts: {} } })),
        ]);

      console.log("Dashboard API Response:", dashboardRes.data);
      // Payments disabled
      // console.log("Payments API Response:", paymentsRes.data);
      console.log("Users API Response:", usersRes.data);
      console.log("Courses API Response:", coursesRes.data);

      const dashboard = dashboardRes.data?.data || dashboardRes.data || {};
      // Payments disabled
      // const paymentsData = extractDataFromResponse(paymentsRes);
      const usersData = extractDataFromResponse(usersRes);
      const coursesData = extractDataFromResponse(coursesRes);
      const courseRequestsData = extractDataFromResponse(courseRequestsRes);
      
      // Store courseRequestsData in state
      setCourseRequestsData(courseRequestsData);

      // Payments disabled
      // console.log("Extracted Payments Data:", paymentsData);
      console.log("Extracted Users Data:", usersData);
      console.log("Extracted Courses Data:", coursesData);

      const dashboardStats = dashboard.stats || {};

      // Payments disabled - using course requests instead
      // let payments = [];
      // if (Array.isArray(paymentsData)) {
      //   payments = paymentsData;
      // } else if (paymentsData.payments) {
      //   payments = Array.isArray(paymentsData.payments)
      //     ? paymentsData.payments
      //     : [];
      // }

      // Extract users
      let users = [];
      if (Array.isArray(usersData)) {
        users = usersData;
      } else if (usersData.users) {
        users = Array.isArray(usersData.users) ? usersData.users : [];
      }

      // Extract courses
      let courses = [];
      if (Array.isArray(coursesData)) {
        courses = coursesData;
      } else if (coursesData.courses) {
        courses = Array.isArray(coursesData.courses) ? coursesData.courses : [];
      }

      // Payments disabled
      // const recentPaymentsData =
      //   dashboard.recentPayments || payments.slice(0, 5);
      const topCoursesData = dashboard.topCourses || courses.slice(0, 5);

      // Filter users by role
      const students = users.filter((u) => u.role === "STUDENT");
      const teachers = users.filter((u) => u.role === "TEACHER");

      // Filter courses by status
      const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
      const draftCourses = courses.filter((c) => c.status === "DRAFT");

      // Payments disabled - using course requests instead
      // const pendingPayments = payments.filter((p) => p.status === "PENDING");
      // const completedPayments = payments.filter(
      //   (p) => p.status === "COMPLETED"
      // );

      const totalRevenueValue = dashboardStats.totalRevenue
        ? parseFloat(dashboardStats.totalRevenue)
        : 0; // Payments disabled

      const courseRequestsCounts = courseRequestsData.counts || {};
      
      setStats({
        totalStudents: dashboardStats.totalStudents || students.length || 0,
        totalTeachers: dashboardStats.totalTeachers || teachers.length || 0,
        totalCourses: dashboardStats.totalCourses || courses.length || 0,
        totalRevenue: totalRevenueValue,
        totalEnrollments:
          dashboard.recentEnrollments?.length || 0, // Payments disabled
        pendingPayments: 0, // Payments disabled
        completedPayments: 0, // Payments disabled
        todayRevenue: 0, // Will be calculated from analytics
        monthlyRevenue: 0, // Will be calculated from analytics
        publishedCourses: publishedCourses.length,
        draftCourses: draftCourses.length,
        pendingCourseRequests: courseRequestsCounts.pending || 0,
        approvedCourseRequests: courseRequestsCounts.approved || 0,
        rejectedCourseRequests: courseRequestsCounts.rejected || 0,
        // Upload stats (calculated from course content)
        totalUploads: courses.length || 0,
        completedUploads: courses.filter(c => c.videoUrl).length || 0,
        failedUploads: 0,
        pendingUploads: 0,
      });

      // Chart data - using course requests instead of payments
      setChartData([
        {
          name: language === "ar" ? "معتمدة" : "Approved",
          value: courseRequestsCounts.approved || 0,
          color: "#10b981",
        },
        {
          name: language === "ar" ? "معلقة" : "Pending",
          value: courseRequestsCounts.pending || 0,
          color: "#f59e0b",
        },
        {
          name: language === "ar" ? "مرفوضة" : "Rejected",
          value: courseRequestsCounts.rejected || 0,
          color: "#ef4444",
        },
      ]);

      // Bar chart data for users
      setBarChartData([
        {
          name: language === "ar" ? "الطلاب" : "Students",
          value: students.length,
        },
        {
          name: language === "ar" ? "المعلمون" : "Teachers",
          value: teachers.length,
        },
        {
          name: language === "ar" ? "الدورات" : "Courses",
          value: courses.length,
        },
      ]);

      // Payments disabled - using course requests instead
      // Generate sales trend from payments
      // const allPayments = Array.isArray(paymentsData)
      //   ? paymentsData
      //   : paymentsData.payments || [];
      // const salesTrend = generateSalesTrendData(
      //   allPayments,
      //   selectedPeriod === "7days" ? 7 : selectedPeriod === "30days" ? 30 : 90
      // );
      // setSalesTrendData(salesTrend);
      // setRecentPayments(recentPaymentsData);
      setSalesTrendData([]);
      setRecentPayments([]);
      setTopCourses(topCoursesData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSalesTrendData = (payments, days) => {
    const data = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const dayPayments = payments.filter((p) => {
        const paymentDate = new Date(p.createdAt || p.created_at);
        paymentDate.setHours(0, 0, 0, 0);
        return paymentDate.getTime() === date.getTime();
      });

      const revenue = dayPayments.reduce((sum, p) => {
        return sum + parseFloat(p.amount || 0);
      }, 0);

      data.push({
        date: format(new Date(date), language === "ar" ? "dd/MM" : "MM/dd"),
        payments: dayPayments.length,
        revenue: parseFloat(revenue.toFixed(2)),
      });
    }

    return data;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      completed: "bg-green-100 text-green-800",
      delivered: "bg-green-100 text-green-800",
      active: "bg-blue-100 text-blue-800",
      on_the_way: "bg-blue-100 text-blue-800",
      shipped: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-yellow-100 text-yellow-800",
      received: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status) => {
    if (["completed", "delivered"].includes(status)) return CheckCircle2;
    if (["active", "on_the_way", "shipped"].includes(status)) return Package;
    if (["pending", "processing", "received"].includes(status)) return Clock;
    return XCircle;
  };

  const statCards = [
    {
      title: language === "ar" ? "الطلاب" : "Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      trend: "+12%",
      trendUp: true,
      subtitle: language === "ar" ? "إجمالي الطلاب" : "Total Students",
    },
    {
      title: language === "ar" ? "المعلمون" : "Teachers",
      value: stats.totalTeachers,
      icon: UserCog,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      trend: "+8%",
      trendUp: true,
      subtitle: language === "ar" ? "إجمالي المعلمين" : "Total Teachers",
    },
    {
      title: language === "ar" ? "الدورات" : "Courses",
      value: stats.totalCourses,
      icon: Book,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      trend: `${stats.publishedCourses} ${
        language === "ar" ? "منشور" : "Published"
      }`,
      trendUp: true,
      subtitle: `${stats.draftCourses} ${
        language === "ar" ? "مسودة" : "Draft"
      }`,
    },
    {
      title: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} KWD`,
      icon: DollarSign,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      trend: "+15%",
      trendUp: true,
      subtitle: language === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
    },
    {
      title: language === "ar" ? "الاشتراكات" : "Enrollments",
      value: stats.totalEnrollments,
      icon: Calendar,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
      trend: `${stats.completedPayments} ${
        language === "ar" ? "مكتمل" : "Completed"
      }`,
      trendUp: true,
      subtitle: language === "ar" ? "إجمالي الاشتراكات" : "Total Enrollments",
    },
    // Payments disabled - using course requests instead
    // {
    //   title: language === "ar" ? "مدفوعات معلقة" : "Pending Payments",
    //   value: stats.pendingPayments,
    //   icon: FileText,
    //   color: "text-red-500",
    //   bgColor: "bg-red-500/10",
    //   borderColor: "border-red-500/20",
    //   trend: stats.pendingPayments > 0 ? `${stats.pendingPayments}` : "0",
    //   trendUp: false,
    //   subtitle: language === "ar" ? "المدفوعات المعلقة" : "Pending Payments",
    // },
    {
      title: language === "ar" ? "طلبات الدورات" : "Course Requests",
      value: stats.pendingCourseRequests,
      icon: ClipboardList,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      trend: `${stats.approvedCourseRequests} ${
        language === "ar" ? "معتمد" : "Approved"
      }`,
      trendUp: true,
      subtitle: `${stats.pendingCourseRequests} ${
        language === "ar" ? "قيد الانتظار" : "Pending"
      }`,
      onClick: () => navigate("/admin/course-requests"),
    },
    {
      title: language === "ar" ? "رفع الفيديوهات" : "Video Uploads",
      value: stats.totalUploads || 0,
      icon: Upload,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      trend: `${stats.completedUploads || 0} ${
        language === "ar" ? "مكتمل" : "Completed"
      }`,
      trendUp: true,
      subtitle: `${stats.pendingUploads || 0} ${
        language === "ar" ? "قيد المعالجة" : "In Progress"
      }`,
      onClick: () => navigate("/admin/uploads"),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {t("dashboard.loading") || "Loading..."}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
          >
            {t("dashboard.welcome")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mt-2 text-sm sm:text-base"
          >
            {t("dashboard.overview")}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2"
        >
          {["7days", "30days", "90days"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period === "7days" ? "7D" : period === "30days" ? "30D" : "90D"}
            </Button>
          ))}
        </motion.div>
      </motion.div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard
            key={`${stat.title}-${index}`}
            {...stat}
            delay={index * 0.05}
            onClick={() => {
              if (
                stat.title.includes("Users") ||
                stat.title.includes("Students") ||
                stat.title.includes("Teachers")
              )
                navigate("/admin/users");
              if (stat.title.includes("Courses")) navigate("/admin/courses");
              // Payments disabled - using course requests instead
              // if (
              //   stat.title.includes("Revenue") ||
              //   stat.title.includes("Payments")
              // )
              //   navigate("/admin/payments");
              // if (stat.title.includes("Enrollments"))
              //   navigate("/admin/payments");
              if (stat.title.includes("Course Requests") || stat.title.includes("طلبات"))
                navigate("/admin/course-requests");
            }}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {language === "ar" ? "حالة المدفوعات" : "Payment Status"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/payments")}
                className="gap-2"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="w-full h-64 sm:h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={memoizedChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {memoizedChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        style={{
                          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Platform Overview Bar Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-4">
              {language === "ar" ? "نظرة عامة على المنصة" : "Platform Overview"}
            </h2>
            <div className="w-full h-64 sm:h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memoizedBarChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={language === "ar" ? 0 : -45}
                    textAnchor={language === "ar" ? "middle" : "end"}
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    animationBegin={0}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Sales Trend & Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {language === "ar" ? "اتجاه المبيعات" : "Revenue Trend"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{language === "ar" ? "المدفوعات" : "Payments"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{language === "ar" ? "الإيرادات" : "Revenue"}</span>
              </div>
            </div>
          </div>
          <div className="w-full h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoizedSalesTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))",
                  }}
                />
                <Legend />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  animationBegin={0}
                  animationDuration={800}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="payments"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorOrders)"
                  animationBegin={0}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Recent Enrollments & Top Courses Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Enrollments */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                {language === "ar"
                  ? "طلبات الدورات المعلقة"
                  : "Pending Course Requests"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/course-requests?status=pending")}
                className="gap-2"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {courseRequestsData.requests && courseRequestsData.requests.filter(r => r.status === 'pending').length > 0 ? (
                  courseRequestsData.requests.filter(r => r.status === 'pending').slice(0, 5).map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate("/admin/course-requests")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">
                              {request.student?.nameEn ||
                                request.student?.nameAr ||
                                "Student"}
                            </p>
                            <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                              {language === "ar" ? "قيد الانتظار" : "PENDING"}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.course?.titleEn ||
                              request.course?.titleAr ||
                              "Course"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {request.createdAt
                              ? format(new Date(request.createdAt), "PPp")
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === "ar" 
                      ? "لا توجد طلبات معلقة" 
                      : "No pending requests"}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Top Courses */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5" />
                {language === "ar" ? "أفضل المنتجات" : "Top Products"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/admin/courses")}
                className="gap-2"
              >
                {language === "ar" ? "عرض الكل" : "View All"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {topCourses.length > 0 ? (
                  topCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: -4 }}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        {course.coverImage ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            <img
                              src={getImageUrl(course.coverImage)}
                              alt={course.titleEn || course.titleAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"><svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg></div>';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Book className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">
                            {course.titleEn || course.titleAr || "Course"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {course.teacher?.nameEn ||
                              course.teacher?.nameAr ||
                              "-"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {course._count?.purchases || 0}{" "}
                            {language === "ar" ? "اشتراك" : "enrollments"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {parseFloat(course.price || 0).toFixed(2)} KWD
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <Book className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>
                      {language === "ar" ? "لا توجد دورات" : "No courses yet"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-4">
              {language === "ar" ? "إحصائيات سريعة" : "Quick Stats"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-3 sm:p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-lg border border-green-500/20"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "ar" ? "مكتملة" : "Completed Payments"}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  {stats.completedPayments}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "ar" ? "الاشتراكات" : "Enrollments"}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">
                  {stats.totalEnrollments}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/admin/course-requests?status=pending")}
                className="p-3 sm:p-4 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-500/20 cursor-pointer"
              >
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === "ar" ? "طلبات دورات معلقة" : "Pending Course Requests"}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">
                  {stats.pendingCourseRequests}
                </p>
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Alerts & Notifications - Using Course Requests instead of Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {language === "ar" ? "التنبيهات" : "Alerts"}
            </h2>
            <div className="space-y-3">
              {stats.pendingCourseRequests > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {stats.pendingCourseRequests}{" "}
                      {language === "ar"
                        ? "طلبات دورات معلقة تحتاج إلى المراجعة"
                        : "pending course requests need review"}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => navigate("/admin/course-requests?status=pending")}
                      className="p-0 h-auto mt-1"
                    >
                      {language === "ar" ? "عرض الطلبات" : "View Requests"}
                    </Button>
                  </div>
                </motion.div>
              )}
              {stats.pendingCourseRequests === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="font-medium text-sm text-green-600">
                    {language === "ar" ? "كل شيء على ما يرام!" : "All good!"}
                  </p>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
