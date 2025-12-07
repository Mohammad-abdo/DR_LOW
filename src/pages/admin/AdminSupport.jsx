import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Eye, Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminSupport() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, open, closed, resolved
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/tickets", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: filter === "all" ? undefined : filter.toUpperCase(),
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Tickets API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let ticketsList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        ticketsList = data;
      } else if (data.tickets) {
        ticketsList = Array.isArray(data.tickets) ? data.tickets : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        ticketsList = data.data;
        paginationData = data.pagination || {};
      } else {
        ticketsList = [];
      }
      
      setTickets(ticketsList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketById = async (id) => {
    try {
      const response = await api.get(`/admin/tickets/${id}`);
      const data = extractDataFromResponse(response);
      setSelectedTicket(data.ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    }
  };

  const handleReply = async (ticketId) => {
    if (!reply.trim()) {
      alert(language === "ar" ? "الرجاء إدخال رد" : "Please enter a reply");
      return;
    }
    try {
      const response = await api.post(`/admin/tickets/${ticketId}/reply`, { message: reply });
      console.log("Reply response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم إرسال الرد بنجاح" : "Reply sent successfully");
        setReply("");
        fetchTicketById(ticketId);
        fetchTickets();
      } else {
        alert(response.data?.message || "Error sending reply");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      alert(error.response?.data?.message || "Error sending reply");
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      const response = await api.put(`/admin/tickets/${ticketId}/status`, { status: newStatus });
      console.log("Update status response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم تحديث الحالة بنجاح" : "Status updated successfully");
        fetchTicketById(ticketId);
        fetchTickets();
      } else {
        alert(response.data?.message || "Error updating status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return CheckCircle2;
      case "OPEN":
        return Clock;
      case "CLOSED":
        return XCircle;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "OPEN":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (selectedTicket) {
    const StatusIcon = getStatusIcon(selectedTicket.status);
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedTicket(null)}>
          {language === "ar" ? "← العودة" : "← Back"}
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                {language === "ar" ? "تفاصيل التذكرة" : "Ticket Details"}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${getStatusColor(selectedTicket.status)}`}>
                <StatusIcon className="w-4 h-4" />
                {selectedTicket.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "من" : "From"}</p>
              <p className="font-semibold">{language === "ar" ? selectedTicket.user?.nameAr : selectedTicket.user?.nameEn}</p>
              <p className="text-sm text-muted-foreground">{selectedTicket.user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الموضوع" : "Subject"}</p>
              <p className="font-semibold">{selectedTicket.title}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "الرسالة" : "Message"}</p>
              <p className="mt-2">{selectedTicket.message}</p>
            </div>
            {selectedTicket.adminReply && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">{language === "ar" ? "رد الإدارة" : "Admin Reply"}</p>
                <p>{selectedTicket.adminReply}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold mb-2">{language === "ar" ? "إرسال رد" : "Send Reply"}</p>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={language === "ar" ? "اكتب ردك هنا..." : "Type your reply here..."}
                className="mb-2"
              />
              <div className="flex items-center gap-2">
                <Button onClick={() => handleReply(selectedTicket.id)}>
                  {language === "ar" ? "إرسال" : "Send Reply"}
                </Button>
                {selectedTicket.status === "OPEN" && (
                  <>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}>
                      {language === "ar" ? "حل" : "Resolve"}
                    </Button>
                    <Button variant="outline" onClick={() => handleUpdateStatus(selectedTicket.id, "CLOSED")}>
                      {language === "ar" ? "إغلاق" : "Close"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "دعم العملاء" : "Support Tickets"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">{language === "ar" ? "الكل" : "All"}</option>
              <option value="open">{language === "ar" ? "مفتوحة" : "Open"}</option>
              <option value="resolved">{language === "ar" ? "محلولة" : "Resolved"}</option>
              <option value="closed">{language === "ar" ? "مغلقة" : "Closed"}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد تذاكر" : "No tickets found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => {
                const StatusIcon = getStatusIcon(ticket.status);
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => fetchTicketById(ticket.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{ticket.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(ticket.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            {ticket.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {language === "ar" ? ticket.user?.nameAr : ticket.user?.nameEn} • {ticket.user?.email}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {ticket.createdAt ? format(new Date(ticket.createdAt), "PPp") : "-"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchTicketById(ticket.id);
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

