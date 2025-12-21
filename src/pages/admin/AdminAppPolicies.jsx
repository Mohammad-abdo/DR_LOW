import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, FileText, Edit, Trash2 } from "lucide-react";

export default function AdminAppPolicies() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: "privacy_policy",
    content: "",
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/policies");
      const data = extractDataFromResponse(response);
      setPolicies(data.policies || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (editingId) {
        await api.put(`/admin/policies/${editingId}`, { content: formData.content });
        alert(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await api.post("/admin/policies", formData);
        alert(language === "ar" ? "تم الإنشاء بنجاح" : "Created successfully");
      }
      
      setFormData({ type: "privacy_policy", content: "" });
      setEditingId(null);
      await fetchPolicies();
    } catch (error) {
      console.error("Error saving policy:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (policy) => {
    setFormData({
      type: policy.type,
      content: policy.content || "",
    });
    setEditingId(policy.id);
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }

    try {
      await api.delete(`/admin/policies/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
      await fetchPolicies();
    } catch (error) {
      console.error("Error deleting policy:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting"));
    }
  };

  const getPolicyTypeLabel = (type) => {
    if (type === "privacy_policy") {
      return language === "ar" ? "سياسة الخصوصية" : "Privacy Policy";
    }
    if (type === "terms_and_conditions") {
      return language === "ar" ? "الشروط والأحكام" : "Terms & Conditions";
    }
    return type;
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
            {language === "ar" ? "سياسات التطبيق" : "App Policies"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة سياسات التطبيق (سياسة الخصوصية والشروط والأحكام)"
              : "Manage app policies (Privacy Policy & Terms & Conditions)"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {editingId
                ? language === "ar"
                  ? "تعديل السياسة"
                  : "Edit Policy"
                : language === "ar"
                ? "إضافة سياسة"
                : "Add Policy"}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "نوع السياسة" : "Policy Type"} *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="privacy_policy">
                    {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </option>
                  <option value="terms_and_conditions">
                    {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
                  </option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "المحتوى" : "Content"} *
              </label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                placeholder={language === "ar" ? "محتوى السياسة..." : "Policy content..."}
                rows={10}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ type: "privacy_policy", content: "" });
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
            {language === "ar" ? "قائمة السياسات" : "Policies List"}
          </h2>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar" ? "لا توجد سياسات" : "No policies found"}
            </p>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <motion.div
                  key={policy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">
                      {getPolicyTypeLabel(policy.type)}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(policy)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(policy.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans">
                      {policy.content}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === "ar" ? "آخر تحديث:" : "Last updated:"}{" "}
                    {new Date(policy.updatedAt).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}







