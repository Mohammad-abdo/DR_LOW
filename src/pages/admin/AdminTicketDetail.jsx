import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2, User, MessageSquare, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminTicketDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/tickets/${id}`);
      const data = extractDataFromResponse(response);
      setTicket(data.ticket || data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      alert(error.response?.data?.message || "Error loading ticket");
      navigate("/admin/support");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      setReplying(true);
      await api.post(`/admin/tickets/${id}/reply`, { adminReply: replyText });
      setReplyText("");
      await fetchTicket();
      alert(language === "ar" ? "تم إرسال الرد بنجاح" : "Reply sent successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error sending reply");
    } finally {
      setReplying(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/admin/tickets/${id}/status`, { status: newStatus });
      await fetchTicket();
      alert(language === "ar" ? "تم تحديث الحالة بنجاح" : "Status updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating status");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RESOLVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "IN_PROGRESS":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "CLOSED":
        return <XCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "CLOSED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/support")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          {ticket.status === "OPEN" && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("IN_PROGRESS")}
            >
              {language === "ar" ? "بدء المعالجة" : "Start Processing"}
            </Button>
          )}
          {ticket.status === "IN_PROGRESS" && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("RESOLVED")}
            >
              {language === "ar" ? "تم الحل" : "Mark as Resolved"}
            </Button>
          )}
          {ticket.status !== "CLOSED" && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate("CLOSED")}
            >
              {language === "ar" ? "إغلاق" : "Close"}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {language === "ar" ? ticket.subjectAr : ticket.subjectEn}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {language === "ar" ? ticket.user?.nameAr : ticket.user?.nameEn}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {ticket.createdAt ? format(new Date(ticket.createdAt), "PPp") : "-"}
                </span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(ticket.status)}`}>
              {getStatusIcon(ticket.status)}
              <span className="font-semibold">{ticket.status}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ticket Message */}
          <div>
            <h3 className="font-semibold mb-2">{language === "ar" ? "الرسالة" : "Message"}</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{ticket.message}</p>
            </div>
          </div>

          {/* Admin Reply */}
          {ticket.adminReply && (
            <div>
              <h3 className="font-semibold mb-4">{language === "ar" ? "رد الإدارة" : "Admin Reply"}</h3>
              <div className="border rounded-lg p-4 bg-muted">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">Admin</span>
                  </div>
                  {ticket.repliedAt && (
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(ticket.repliedAt), "PPp")}
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{ticket.adminReply}</p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {ticket.status !== "CLOSED" && (
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">{language === "ar" ? "إرسال رد" : "Send Reply"}</h3>
              <form onSubmit={handleReply} className="space-y-4">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={language === "ar" ? "اكتب ردك هنا..." : "Type your reply here..."}
                  rows={4}
                  required
                />
                <Button type="submit" disabled={replying || !replyText.trim()}>
                  {replying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "ar" ? "جاري الإرسال..." : "Sending..."}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {language === "ar" ? "إرسال" : "Send"}
                    </>
                  )}
                </Button>
              </form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

