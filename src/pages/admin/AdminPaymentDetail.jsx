import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, DollarSign, User, Book } from "lucide-react";
import { format } from "date-fns";

export default function AdminPaymentDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/payments/${id}`);
      const data = extractDataFromResponse(response);
      setPayment(data.payment || data);
    } catch (error) {
      console.error("Error fetching payment:", error);
      alert(error.response?.data?.message || "Error loading payment");
      navigate("/admin/payments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!confirm(language === "ar" ? `هل تريد تغيير الحالة إلى ${newStatus}؟` : `Change status to ${newStatus}?`)) {
      return;
    }
    try {
      setUpdating(true);
      await api.put(`/admin/payments/${id}/status`, { status: newStatus });
      await fetchPayment();
      alert(language === "ar" ? "تم تحديث الحالة بنجاح" : "Status updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating payment status");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "REFUNDED":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
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
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/payments")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        {payment.status === "PENDING" && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("COMPLETED")}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {language === "ar" ? "قبول الدفع" : "Approve Payment"}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("FAILED")}
              disabled={updating}
            >
              {updating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {language === "ar" ? "رفض الدفع" : "Reject Payment"}
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {language === "ar" ? "تفاصيل الدفع" : "Payment Details"}
                </h1>
                <p className="text-muted-foreground mt-1">ID: {payment.id}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(payment.status)}`}>
              {getStatusIcon(payment.status)}
              <span className="font-semibold">{payment.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "المبلغ" : "Amount"}</p>
              <p className="text-2xl font-bold text-primary">${parseFloat(payment.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "طريقة الدفع" : "Payment Method"}</p>
              <p className="font-semibold">{payment.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ الدفع" : "Payment Date"}</p>
              <p className="font-semibold">
                {payment.createdAt ? format(new Date(payment.createdAt), "PPp") : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "رقم المعاملة" : "Transaction ID"}</p>
              <p className="font-semibold">{payment.transactionId || "-"}</p>
            </div>
          </div>

          {/* Student Info */}
          {payment.student && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                {language === "ar" ? "معلومات الطالب" : "Student Information"}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الاسم" : "Name"}</p>
                  <p className="font-semibold">
                    {language === "ar" ? payment.student.nameAr : payment.student.nameEn}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "البريد الإلكتروني" : "Email"}</p>
                  <p className="font-semibold">{payment.student.email}</p>
                </div>
                {payment.student.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الهاتف" : "Phone"}</p>
                    <p className="font-semibold">{payment.student.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Course Info */}
          {payment.purchase?.course && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                {language === "ar" ? "معلومات الدورة" : "Course Information"}
              </h3>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">
                  {language === "ar" ? payment.purchase.course.titleAr : payment.purchase.course.titleEn}
                </h4>
                {payment.purchase.course.teacher && (
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "المعلم" : "Teacher"}:{" "}
                    {language === "ar" ? payment.purchase.course.teacher.nameAr : payment.purchase.course.teacher.nameEn}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {payment.notes && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">{language === "ar" ? "ملاحظات" : "Notes"}</h3>
              <p className="text-muted-foreground">{payment.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


