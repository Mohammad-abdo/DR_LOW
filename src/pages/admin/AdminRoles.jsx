import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Shield, 
  Plus, 
  Trash2, 
  Edit, 
  Users,
  CheckSquare,
  XSquare
} from "lucide-react";

export default function AdminRoles() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    nameAr: "",
    nameEn: "",
    description: "",
    permissionIds: [],
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/roles");
      const data = extractDataFromResponse(response);
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get("/admin/permissions");
      const data = extractDataFromResponse(response);
      setPermissions(data.permissions || []);
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (editingId) {
        await api.put(`/admin/roles/${editingId}`, formData);
        alert(language === "ar" ? "تم التحديث بنجاح" : "Updated successfully");
      } else {
        await api.post("/admin/roles", formData);
        alert(language === "ar" ? "تم الإنشاء بنجاح" : "Created successfully");
      }
      
      setFormData({ name: "", nameAr: "", nameEn: "", description: "", permissionIds: [] });
      setEditingId(null);
      await fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحفظ" : "Error saving"));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (role) => {
    setFormData({
      name: role.name,
      nameAr: role.nameAr || "",
      nameEn: role.nameEn || "",
      description: role.description || "",
      permissionIds: role.permissions?.map(rp => rp.permissionId) || [],
    });
    setEditingId(role.id);
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }

    try {
      await api.delete(`/admin/roles/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Deleted successfully");
      await fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحذف" : "Error deleting"));
    }
  };

  const togglePermission = (permissionId) => {
    setFormData(prev => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter(id => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

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
            {language === "ar" ? "الأدوار" : "Roles"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة الأدوار والصلاحيات"
              : "Manage roles and permissions"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {editingId
                ? language === "ar"
                  ? "تعديل الدور"
                  : "Edit Role"
                : language === "ar"
                ? "إضافة دور"
                : "Add Role"}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "اسم الدور (إنجليزي)" : "Role Name (English)"} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g., content_manager"
                  disabled={editingId !== null}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "اسم الدور (عربي)" : "Role Name (Arabic)"}
                </label>
                <Input
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder={language === "ar" ? "مثال: مدير المحتوى" : "e.g., مدير المحتوى"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "اسم الدور (إنجليزي)" : "Role Name (English)"}
              </label>
              <Input
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="e.g., Content Manager"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === "ar" ? "وصف الدور..." : "Role description..."}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الصلاحيات" : "Permissions"}
              </label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-semibold text-sm text-primary capitalize">{resource}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissionIds.includes(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="h-4 w-4"
                          />
                          <span className="text-sm">
                            {language === "ar" ? perm.nameAr || perm.action : perm.nameEn || perm.action}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: "", nameAr: "", nameEn: "", description: "", permissionIds: [] });
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
            {language === "ar" ? "قائمة الأدوار" : "Roles List"}
          </h2>
        </CardHeader>
        <CardContent>
          {roles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {language === "ar" ? "لا توجد أدوار" : "No roles found"}
            </p>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">
                          {language === "ar" ? role.nameAr || role.name : role.nameEn || role.name}
                        </h3>
                        {role.isSystem && (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {language === "ar" ? "نظام" : "System"}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          ({role._count?.userRoles || 0} {language === "ar" ? "مستخدم" : "users"})
                        </span>
                      </div>
                      {role.description && (
                        <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {role.permissions?.map((rp) => (
                          <span
                            key={rp.permissionId}
                            className="px-2 py-1 rounded text-xs bg-primary/10 text-primary"
                          >
                            {rp.permission.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(role)}
                        disabled={role.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(role.id)}
                        disabled={role.isSystem}
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















