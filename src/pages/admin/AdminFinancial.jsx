import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Download, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminFinancial() {
  const { language } = useLanguage();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
    completedPayments: 0,
    pendingPayments: 0,
  });
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // day, week, month, year

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, dashboardRes] = await Promise.all([
        api.get("/admin/payments?limit=50"),
        api.get("/admin/dashboard/stats"),
      ]);

      const paymentsData = extractDataFromResponse(paymentsRes);
      const dashboard = dashboardRes.data?.data || dashboardRes.data || {};

      setPayments(paymentsData.payments || []);
      setStats({
        totalRevenue: dashboard.stats?.totalRevenue || 0,
        todayRevenue: dashboard.stats?.todayRevenue || 0,
        monthlyRevenue: dashboard.stats?.monthlyRevenue || 0,
        completedPayments: paymentsData.payments?.filter((p) => p.status === "COMPLETED").length || 0,
        pendingPayments: paymentsData.payments?.filter((p) => p.status === "PENDING").length || 0,
      });
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/admin/reports/financial?format=${format}&period=${period}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial-report-${period}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert(error.response?.data?.message || "Error exporting report");
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "المالية" : "Financial"}
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="day">{language === "ar" ? "اليوم" : "Today"}</option>
            <option value="week">{language === "ar" ? "هذا الأسبوع" : "This Week"}</option>
            <option value="month">{language === "ar" ? "هذا الشهر" : "This Month"}</option>
            <option value="year">{language === "ar" ? "هذه السنة" : "This Year"}</option>
          </select>
          <Button variant="outline" onClick={() => handleExport("pdf")}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport("xlsx")}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.totalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} KWD
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "إيرادات اليوم" : "Today Revenue"}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {stats.todayRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} KWD
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "المدفوعات المكتملة" : "Completed Payments"}
                </p>
                <p className="text-2xl font-bold mt-2">{stats.completedPayments}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "المدفوعات المعلقة" : "Pending Payments"}
                </p>
                <p className="text-2xl font-bold mt-2">{stats.pendingPayments}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">
            {language === "ar" ? "المدفوعات الأخيرة" : "Recent Payments"}
          </h2>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد مدفوعات" : "No payments found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.slice(0, 10).map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {payment.student?.nameEn || payment.student?.nameAr}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.purchase?.course?.titleEn || payment.purchase?.course?.titleAr}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {payment.createdAt ? format(new Date(payment.createdAt), "PPp") : "-"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {parseFloat(payment.amount || 0).toFixed(2)} KWD
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        payment.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                        payment.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



