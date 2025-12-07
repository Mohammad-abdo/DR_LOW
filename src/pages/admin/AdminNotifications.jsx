import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Bell, Plus, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminNotifications() {
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    messageAr: "",
    messageEn: "",
    type: "GENERAL",
    recipientIds: [],
    sendToAll: true,
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchNotifications();
    if (showForm) {
      fetchUsers();
    }
  }, [pagination.page, showForm]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/notifications", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Notifications API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let notificationsList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        notificationsList = data;
      } else if (data.notifications) {
        notificationsList = Array.isArray(data.notifications) ? data.notifications : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        notificationsList = data.data;
        paginationData = data.pagination || {};
      } else {
        notificationsList = [];
      }
      
      setNotifications(notificationsList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get("/admin/users?limit=1000");
      const data = extractDataFromResponse(response);
      const usersList = Array.isArray(data) ? data : (data.users || []);
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        recipientIds: formData.sendToAll ? [] : formData.recipientIds,
      };
      console.log("Creating notification with data:", payload);
      const response = await api.post("/admin/notifications", payload);
      console.log("Notification creation response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم إنشاء الإشعار بنجاح" : "Notification created successfully");
        setShowForm(false);
        setFormData({
          titleAr: "",
          titleEn: "",
          messageAr: "",
          messageEn: "",
          type: "GENERAL",
          recipientIds: [],
          sendToAll: true,
        });
        fetchNotifications();
      } else {
        alert(response.data?.message || "Error creating notification");
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      alert(error.response?.data?.message || "Error creating notification");
    }
  };

  const toggleUserSelection = (userId) => {
    setFormData((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(userId)
        ? prev.recipientIds.filter((id) => id !== userId)
        : [...prev.recipientIds, userId],
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/notifications/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف الإشعار بنجاح" : "Notification deleted successfully");
        fetchNotifications();
      } else {
        alert(response.data?.message || "Error deleting notification");
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert(error.response?.data?.message || "Error deleting notification");
    }
  };

  if (loading && notifications.length === 0) {
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
          {language === "ar" ? "الإشعارات" : "Notifications"}
        </h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة إشعار" : "Add Notification"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">
              {language === "ar" ? "إضافة إشعار جديد" : "Create New Notification"}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}
                  </label>
                  <Input
                    value={formData.titleAr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleAr: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}
                  </label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "الرسالة (عربي)" : "Message (Arabic)"}
                  </label>
                  <Textarea
                    value={formData.messageAr}
                    onChange={(e) => setFormData((prev) => ({ ...prev, messageAr: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "الرسالة (إنجليزي)" : "Message (English)"}
                  </label>
                  <Textarea
                    value={formData.messageEn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, messageEn: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {language === "ar" ? "نوع الإشعار" : "Notification Type"}
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="GENERAL">{language === "ar" ? "عام" : "General"}</option>
                  <option value="COURSE">{language === "ar" ? "دورة" : "Course"}</option>
                  <option value="EXAM">{language === "ar" ? "امتحان" : "Exam"}</option>
                  <option value="PAYMENT">{language === "ar" ? "دفع" : "Payment"}</option>
                  <option value="SYSTEM">{language === "ar" ? "نظام" : "System"}</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sendToAll"
                  checked={formData.sendToAll}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sendToAll: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="sendToAll" className="text-sm font-medium">
                  {language === "ar" ? "إرسال للجميع" : "Send to All Users"}
                </label>
              </div>

              {!formData.sendToAll && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {language === "ar" ? "اختر المستلمين" : "Select Recipients"}
                  </label>
                  {loadingUsers ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="space-y-2">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              checked={formData.recipientIds.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4 rounded border-gray-300"
                            />
                            <label htmlFor={`user-${user.id}`} className="text-sm cursor-pointer">
                              {language === "ar" ? user.nameAr : user.nameEn} ({user.email})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button type="submit">
                  {language === "ar" ? "إرسال" : "Send"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد إشعارات" : "No notifications found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ar" ? notification.titleAr : notification.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "ar" ? notification.messageAr : notification.messageEn}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{notification._count?.recipients || 0} {language === "ar" ? "مستلم" : "recipients"}</span>
                        <span>{notification.createdAt ? format(new Date(notification.createdAt), "PPp") : "-"}</span>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {language === "ar" ? "حذف" : "Delete"}
                    </Button>
                  </div>
                </motion.div>
              ))}
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

