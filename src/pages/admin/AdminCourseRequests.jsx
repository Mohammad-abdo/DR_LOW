import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Eye, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  AlertCircle,
  User,
  BookOpen,
  Filter,
  Check,
  X,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";

export default function AdminCourseRequests() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCourseRequests();
  }, [statusFilter]);

  const fetchCourseRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/course-requests", {
        params: {
          status: statusFilter || undefined,
        },
      });
      const data = extractDataFromResponse(response);
      
      setRequests(data.requests || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      console.error("Error fetching course requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setProcessing(true);
      await api.post(`/admin/course-requests/${requestId}/approve`);
      await fetchCourseRequests();
      alert(language === "ar" ? "تم اعتماد الطلب بنجاح" : "Request approved successfully");
    } catch (error) {
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في اعتماد الطلب" : "Error approving request"));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId, reason = "") => {
    const rejectionReason = reason || prompt(
      language === "ar" 
        ? "يرجى إدخال سبب الرفض (اختياري):" 
        : "Please enter rejection reason (optional):"
    );
    
    try {
      setProcessing(true);
      await api.post(`/admin/course-requests/${requestId}/reject`, {
        rejectionReason: rejectionReason || null,
      });
      await fetchCourseRequests();
      alert(language === "ar" ? "تم رفض الطلب بنجاح" : "Request rejected successfully");
    } catch (error) {
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في رفض الطلب" : "Error rejecting request"));
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      alert(language === "ar" ? "يرجى اختيار طلبات للموافقة" : "Please select requests to approve");
      return;
    }

    if (!confirm(
      language === "ar"
        ? `هل أنت متأكد من الموافقة على ${selectedRequests.length} طلب؟`
        : `Are you sure you want to approve ${selectedRequests.length} request(s)?`
    )) {
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post("/admin/course-requests/bulk-approve", {
        requestIds: selectedRequests,
      });
      await fetchCourseRequests();
      setSelectedRequests([]);
      alert(
        language === "ar"
          ? `تم اعتماد ${response.data.data?.approved?.length || 0} طلب بنجاح`
          : `${response.data.data?.approved?.length || 0} request(s) approved successfully`
      );
    } catch (error) {
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الموافقة الجماعية" : "Error in bulk approval"));
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircle2;
      case "pending":
        return Clock;
      case "rejected":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = language === "ar" 
      ? request.student?.nameAr?.toLowerCase() || ""
      : request.student?.nameEn?.toLowerCase() || "";
    const courseTitle = language === "ar"
      ? request.course?.titleAr?.toLowerCase() || ""
      : request.course?.titleEn?.toLowerCase() || "";
    const studentEmail = request.student?.email?.toLowerCase() || "";
    
    return (
      studentName.includes(searchLower) ||
      courseTitle.includes(searchLower) ||
      studentEmail.includes(searchLower)
    );
  });

  const toggleRequestSelection = (requestId) => {
    setSelectedRequests((prev) =>
      prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "طلبات الدورات" : "Course Requests"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة طلبات التسجيل في الدورات"
              : "Manage course enrollment requests"}
          </p>
        </div>
        {selectedRequests.length > 0 && statusFilter === "pending" && (
          <Button onClick={handleBulkApprove} disabled={processing}>
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            {language === "ar"
              ? `اعتماد ${selectedRequests.length} طلب`
              : `Approve ${selectedRequests.length} Request(s)`}
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "قيد الانتظار" : "Pending"}
                </p>
                <p className="text-2xl font-bold">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "معتمدة" : "Approved"}
                </p>
                <p className="text-2xl font-bold">{counts.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "مرفوضة" : "Rejected"}
                </p>
                <p className="text-2xl font-bold">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                <Clock className="h-4 w-4 mr-2" />
                {language === "ar" ? "قيد الانتظار" : "Pending"}
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                onClick={() => setStatusFilter("approved")}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {language === "ar" ? "معتمدة" : "Approved"}
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                onClick={() => setStatusFilter("rejected")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {language === "ar" ? "مرفوضة" : "Rejected"}
              </Button>
              <Button
                variant={statusFilter === "" ? "default" : "outline"}
                onClick={() => setStatusFilter("")}
              >
                <Filter className="h-4 w-4 mr-2" />
                {language === "ar" ? "الكل" : "All"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد طلبات" : "No requests found"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            const isSelected = selectedRequests.includes(request.id);
            
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {statusFilter === "pending" && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRequestSelection(request.id)}
                          className="mt-1 h-4 w-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="h-5 w-5 text-primary" />
                              <h3 className="text-lg font-semibold">
                                {language === "ar"
                                  ? request.course?.titleAr
                                  : request.course?.titleEn}
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {language === "ar"
                                    ? request.student?.nameAr
                                    : request.student?.nameEn}
                                </span>
                              </div>
                              <span>•</span>
                              <span>{request.student?.email}</span>
                              {request.student?.phone && (
                                <>
                                  <span>•</span>
                                  <span>{request.student?.phone}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(request.status)}`}>
                            <StatusIcon className="h-3 w-3" />
                            {language === "ar"
                              ? request.status === "pending"
                                ? "قيد الانتظار"
                                : request.status === "approved"
                                ? "معتمد"
                                : "مرفوض"
                              : request.status}
                          </div>
                        </div>

                        {request.rejectionReason && (
                          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              <strong>{language === "ar" ? "سبب الرفض:" : "Rejection Reason:"}</strong>{" "}
                              {request.rejectionReason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            {language === "ar" ? "تاريخ الطلب:" : "Request Date:"}{" "}
                            {format(new Date(request.createdAt), "PPp")}
                          </div>
                          {request.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={processing}
                              >
                                {processing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    {language === "ar" ? "اعتماد" : "Approve"}
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(request.id)}
                                disabled={processing}
                              >
                                <X className="h-4 w-4 mr-2" />
                                {language === "ar" ? "رفض" : "Reject"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}





