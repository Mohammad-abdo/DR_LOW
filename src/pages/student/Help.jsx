import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import {
  HelpCircle,
  Mail,
  Phone,
  Clock,
  MessageSquare,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import showToast from "@/lib/toast";

export default function Help() {
  const { language } = useLanguage();
  const [helpContent, setHelpContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFaq, setExpandedFaq] = useState({});
  const [ticketForm, setTicketForm] = useState({
    title: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    fetchHelpContent();
    fetchMyTickets();
  }, []);

  const fetchHelpContent = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mobile/student/help");
      const data = extractDataFromResponse(response);
      setHelpContent(data);
    } catch (error) {
      console.error("Error fetching help content:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await api.get("/mobile/student/support/tickets");
      const data = extractDataFromResponse(response);
      const ticketsList = Array.isArray(data.tickets) ? data.tickets : (Array.isArray(data) ? data : []);
      setTickets(ticketsList);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/mobile/student/support/tickets", ticketForm);
      showToast.success(
        language === "ar" ? "تم إنشاء تذكرة الدعم بنجاح" : "Support ticket created successfully"
      );
      setTicketForm({ title: "", message: "" });
      fetchMyTickets(); // Refresh tickets list
    } catch (error) {
      showToast.error(
        error.response?.data?.message || (language === "ar" ? "خطأ في إنشاء التذكرة" : "Error creating ticket")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {language === "ar" ? "المساعدة والدعم" : "Help & Support"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "احصل على المساعدة والدعم الذي تحتاجه"
            : "Get the help and support you need"}
        </p>
      </div>

      {/* FAQ Section */}
      {helpContent?.faq && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HelpCircle className="w-6 h-6" />
              {language === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {helpContent.faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-left">
                    {language === "ar" ? item.questionAr : item.questionEn}
                  </span>
                  {expandedFaq[index] ? (
                    <ChevronUp className="w-5 h-5 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq[index] && (
                  <div className="p-4 pt-0 border-t bg-gray-50">
                    <p className="text-muted-foreground">
                      {language === "ar" ? item.answerAr : item.answerEn}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      {helpContent?.contact && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold">
              {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">{helpContent.contact.email}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "البريد الإلكتروني" : "Email"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">{helpContent.contact.phone}</p>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "الهاتف" : "Phone"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
              <div>
                <p className="font-semibold">
                  {language === "ar" ? helpContent.contact.hoursAr : helpContent.contact.hoursEn}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === "ar" ? "ساعات العمل" : "Working Hours"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Support Ticket */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {language === "ar" ? "إنشاء تذكرة دعم" : "Create Support Ticket"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "العنوان" : "Title"}
              </label>
              <Input
                type="text"
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                placeholder={language === "ar" ? "عنوان المشكلة" : "Problem title"}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الرسالة" : "Message"}
              </label>
              <Textarea
                value={ticketForm.message}
                onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })}
                placeholder={language === "ar" ? "وصف المشكلة بالتفصيل" : "Describe your problem in detail"}
                rows={6}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "ar" ? "جاري الإرسال..." : "Submitting..."}
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {language === "ar" ? "إرسال" : "Submit"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Support Tickets */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            {language === "ar" ? "تذاكري" : "My Tickets"}
          </h2>
        </CardHeader>
        <CardContent>
          {loadingTickets ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد تذاكر دعم" : "No support tickets"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{ticket.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticket.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {language === "ar" ? "الحالة" : "Status"}:{" "}
                          <span className={`font-medium ${
                            ticket.status === "OPEN" ? "text-green-600" :
                            ticket.status === "CLOSED" ? "text-gray-600" :
                            "text-amber-600"
                          }`}>
                            {ticket.status || "OPEN"}
                          </span>
                        </span>
                        {ticket.createdAt && (
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
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

