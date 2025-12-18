import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Save, 
  Loader2, 
  Key, 
  Plus, 
  Trash2, 
  Edit,
  Upload
} from "lucide-react";

export default function AdminPermissions() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [groupedPermissions, setGroupedPermissions] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    nameEn: "",
    description: "",
    resource: "",
    action: "",
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/permissions");
      const data = extractDataFromResponse(response);
      setPermissions(data.permissions || []);
      setGroupedPermissions(data.grouped || {});
    } catch (error) {
      console.error("Error fetching permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (editingId) {
        await api.put(`/admin/permissions/${editingId}`, formData);
        alert(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await api.post("/admin/permissions", formData);
        alert(language === "ar" ? "تم الإنشاء بنجاح" : "Created successfully");
      }
      
      setFormData({ name: "", nameAr: "", nameEn: "", description: "", resource: "", action: "" });
      setEditingId(null);
      await fetchPermissions();
    } catch (error) {
      console.error("Error saving permission:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (permission) => {
    setFormData({
      name: permission.name,
      nameAr: permission.nameAr || "",
      nameEn: permission.nameEn || "",
      description: permission.description || "",
      resource: permission.resource,
      action: permission.action,
    });
    setEditingId(permission.id);
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }

    try {
      await api.delete(`/admin/permissions/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
      await fetchPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting"));
    }
  };

  const handleBulkCreate = async () => {
    const resources = ['courses', 'users', 'exams', 'categories', 'banners', 'notifications', 'reports', 'settings'];
    const actions = ['create', 'read', 'update', 'delete'];
    
    const bulkPermissions = [];
    for (const resource of resources) {
      for (const action of actions) {
        bulkPermissions.push({
          name: `${resource}.${action}`,
          nameAr: language === "ar" ? `${resource} - ${action}` : undefined,
          nameEn: `${resource} - ${action}`,
          resource,
          action,
        });
      }
    }

    try {
      setSaving(true);
      const response = await api.post("/admin/permissions/bulk-create", {
        permissions: bulkPermissions,
      });
      alert(
        language === "ar"
          ? `تم إنشاء ${response.data.data?.created?.length || 0} صلاحية`
          : `Created ${response.data.data?.created?.length || 0} permission(s)`
      );
      await fetchPermissions();
    } catch (error) {
      console.error("Error bulk creating permissions:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الإنشاء" : "Error creating"));
    } finally {
      setSaving(false);
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
            {language === "ar" ? "الصلاحيات" : "Permissions"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة الصلاحيات"
              : "Manage permissions"}
          </p>
        </div>
        <Button onClick={handleBulkCreate} disabled={saving} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          {language === "ar" ? "إنشاء صلاحيات افتراضية" : "Create Default Permissions"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {editingId
                ? language === "ar"
                  ? "تعديل الصلاحية"
                  : "Edit Permission"
                : language === "ar"
                ? "إضافة صلاحية"
                : "Add Permission"}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "اسم الصلاحية" : "Permission Name"} *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., courses.create"
                disabled={editingId !== null}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "المورد" : "Resource"} *
                </label>
                <Input
                  value={formData.resource}
                  onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                  required
                  placeholder="e.g., courses"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الإجراء" : "Action"} *
                </label>
                <Input
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  required
                  placeholder="e.g., create"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الاسم (عربي)" : "Name (Arabic)"}
                </label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={language === "ar" ? "مثال: إنشاء دورة" : "e.g., إنشاء دورة"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "الاسم (إنجليزي)" : "Name (English)"}
                </label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="e.g., Create Course"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === "ar" ? "وصف الصلاحية..." : "Permission description..."}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", nameAr: "", nameEn: "", description: "", resource: "", action: "" });
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

      <div className="space-y-4">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <h2 className="text-xl font-semibold capitalize">{resource}</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {perms.map((permission) => (
                  <motion.div
                    key={permission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm mb-1">
                          {language === "ar" ? permission.nameAr || permission.action : permission.nameEn || permission.action}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-1">{permission.name}</p>
                        {permission.description && (
                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                        )}
                        <span className="text-xs text-primary">
                          {permission._count?.rolePermissions || 0} {language === "ar" ? "دور" : "roles"}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(permission)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(permission.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}






