import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, CreditCard, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function AdminPayments() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", method: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (id) {
      fetchPaymentById(id);
    } else {
      fetchPayments();
    }
  }, [id, pagination.page, filters.status, filters.method]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/payments", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status || undefined,
          method: filters.method || undefined,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Payments API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let paymentsList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        paymentsList = data;
      } else if (data.payments) {
        paymentsList = Array.isArray(data.payments) ? data.payments : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        paymentsList = data.data;
        paginationData = data.pagination || {};
      } else {
        paymentsList = [];
      }
      
      setPayments(paymentsList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentById = async (paymentId) => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/payments/${paymentId}`);
      const data = extractDataFromResponse(response);
      setPayment(data.payment || data);
    } catch (error) {
      console.error("Error fetching payment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId, newStatus) => {
    try {
      await api.put(`/admin/payments/${paymentId}/status`, { status: newStatus });
      if (id) {
        fetchPaymentById(id);
      } else {
        fetchPayments();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Error updating payment status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return CheckCircle2;
      case "PENDING":
        return Clock;
      case "FAILED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (id && payment) {
    const StatusIcon = getStatusIcon(payment.status);
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate("/admin/payments")}>
          {language === "ar" ? "← العودة" : "← Back"}
        </Button>
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">
              {language === "ar" ? "تفاصيل الدفع" : "Payment Details"}
            </h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "الطالب" : "Student"}</p>
                <p className="font-semibold">{payment.student?.nameEn || payment.student?.nameAr}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "الدورة" : "Course"}</p>
                <p className="font-semibold">{payment.purchase?.course?.titleEn || payment.purchase?.course?.titleAr}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "المبلغ" : "Amount"}</p>
                <p className="font-semibold">{parseFloat(payment.amount || 0).toFixed(2)} KWD</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "الحالة" : "Status"}</p>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getStatusColor(payment.status)}`}>
                  <StatusIcon className="w-3 h-3" />
                  {payment.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "طريقة الدفع" : "Payment Method"}</p>
                <p className="font-semibold">{payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "التاريخ" : "Date"}</p>
                <p className="font-semibold">{payment.createdAt ? format(new Date(payment.createdAt), "PPp") : "-"}</p>
              </div>
            </div>
            {payment.status === "PENDING" && (
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button onClick={() => handleUpdateStatus(payment.id, "COMPLETED")}>
                  {language === "ar" ? "قبول الدفع" : "Approve Payment"}
                </Button>
                <Button variant="destructive" onClick={() => handleUpdateStatus(payment.id, "FAILED")}>
                  {language === "ar" ? "رفض الدفع" : "Reject Payment"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && payments.length === 0) {
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
          {language === "ar" ? "المدفوعات" : "Payments"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع الحالات" : "All Status"}</option>
              <option value="COMPLETED">{language === "ar" ? "مكتمل" : "Completed"}</option>
              <option value="PENDING">{language === "ar" ? "معلق" : "Pending"}</option>
              <option value="FAILED">{language === "ar" ? "فاشل" : "Failed"}</option>
            </select>
            <select
              value={filters.method}
              onChange={(e) => setFilters((prev) => ({ ...prev, method: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع الطرق" : "All Methods"}</option>
              <option value="VISA">VISA</option>
              <option value="MASTERCARD">MasterCard</option>
              <option value="KNET">KNET</option>
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد مدفوعات" : "No payments found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const StatusIcon = getStatusIcon(payment.status);
                return (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/admin/payments/${payment.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            {payment.student?.nameEn || payment.student?.nameAr}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(payment.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {payment.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {payment.purchase?.course?.titleEn || payment.purchase?.course?.titleAr}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="font-semibold text-green-600">
                            {parseFloat(payment.amount || 0).toFixed(2)} KWD
                          </span>
                          <span>{payment.paymentMethod}</span>
                          <span>{payment.createdAt ? format(new Date(payment.createdAt), "PPp") : payment.created_at ? format(new Date(payment.created_at), "PPp") : "-"}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/payments/${payment.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "ar" ? "عرض" : "View"}
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={pagination.page === 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              >
                {language === "ar" ? "السابق" : "Previous"}
              </Button>
              <span className="text-sm text-muted-foreground">
                {language === "ar" ? "صفحة" : "Page"} {pagination.page} {language === "ar" ? "من" : "of"} {pagination.pages}
              </span>
              <Button
                variant="outline"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                {language === "ar" ? "التالي" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
