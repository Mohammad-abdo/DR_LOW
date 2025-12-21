import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, HelpCircle, Plus, Trash2, Edit } from "lucide-react";

export default function AdminHelpSupport() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [helpSupportList, setHelpSupportList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    whatsappPhone1: "",
    whatsappPhone2: "",
  });

  useEffect(() => {
    fetchHelpSupport();
  }, []);

  const fetchHelpSupport = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/help-support");
      const data = extractDataFromResponse(response);
      setHelpSupportList(data.helpSupport || []);
    } catch (error) {
      console.error("Error fetching help support:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (editingId) {
        await api.put(`/admin/help-support/${editingId}`, formData);
        alert(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await api.post("/admin/help-support", formData);
        alert(language === "ar" ? "تم الإنشاء بنجاح" : "Created successfully");
      }
      
      setFormData({ title: "", description: "", whatsappPhone1: "", whatsappPhone2: "" });
      setEditingId(null);
      await fetchHelpSupport();
    } catch (error) {
      console.error("Error saving help support:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title || "",
      description: item.description || "",
      whatsappPhone1: item.whatsappPhone1 || "",
      whatsappPhone2: item.whatsappPhone2 || "",
    });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }

    try {
      await api.delete(`/admin/help-support/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
      await fetchHelpSupport();
    } catch (error) {
      console.error("Error deleting help support:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting"));
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === "ar" ? "المساعدة والدعم" : "Help & Support"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة معلومات المساعدة والدعم"
              : "Manage help & support information"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {editingId
                ? language === "ar"
                  ? "تعديل معلومات المساعدة"
                  : "Edit Help & Support"
                : language === "ar"
                ? "إضافة معلومات المساعدة"
                : "Add Help & Support"}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "العنوان" : "Title"} *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder={language === "ar" ? "العنوان" : "Title"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === "ar" ? "الوصف" : "Description"}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "واتساب 1" : "WhatsApp 1"}
                </label>
                <Input
                  value={formData.whatsappPhone1}
                  onChange={(e) => setFormData({ ...formData, whatsappPhone1: e.target.value })}
                  placeholder="+96512345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "واتساب 2" : "WhatsApp 2"}
                </label>
                <Input
                  value={formData.whatsappPhone2}
                  onChange={(e) => setFormData({ ...formData, whatsappPhone2: e.target.value })}
                  placeholder="+96587654321"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", description: "", whatsappPhone1: "", whatsappPhone2: "" });
                  }}
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
              )}
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {language === "ar" ? "حفظ" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {language === "ar" ? "قائمة المساعدة والدعم" : "Help & Support List"}
          </h2>
        </CardHeader>
        <CardContent>
          {helpSupportList.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar" ? "لا توجد بيانات" : "No data found"}
            </p>
          ) : (
            <div className="space-y-4">
              {helpSupportList.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      {item.description && (
                        <p className="text-muted-foreground mb-2">{item.description}</p>
                      )}
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {item.whatsappPhone1 && (
                          <span>WhatsApp 1: {item.whatsappPhone1}</span>
                        )}
                        {item.whatsappPhone2 && (
                          <span>WhatsApp 2: {item.whatsappPhone2}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}







