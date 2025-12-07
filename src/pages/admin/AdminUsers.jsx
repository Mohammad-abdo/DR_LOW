import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye, Users, Loader2, UserCheck, UserX } from "lucide-react";

export default function AdminUsers() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters.role, filters.status, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          role: filters.role || undefined,
          status: filters.status || undefined,
          search: searchTerm || undefined,
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Users API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let usersList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users) {
        usersList = Array.isArray(data.users) ? data.users : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
        paginationData = data.pagination || {};
      } else {
        usersList = [];
      }
      
      setUsers(usersList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    try {
      const response = await api.post(`/admin/users/${id}/block`);
      console.log("Block response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حظر المستخدم بنجاح" : "User blocked successfully");
        fetchUsers();
      } else {
        alert(response.data?.message || "Error blocking user");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert(error.response?.data?.message || "Error blocking user");
    }
  };

  const handleUnblock = async (id) => {
    try {
      const response = await api.post(`/admin/users/${id}/unblock`);
      console.log("Unblock response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم إلغاء حظر المستخدم بنجاح" : "User unblocked successfully");
        fetchUsers();
      } else {
        alert(response.data?.message || "Error unblocking user");
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert(error.response?.data?.message || "Error unblocking user");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      const response = await api.delete(`/admin/users/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alert(language === "ar" ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
        fetchUsers();
      } else {
        alert(response.data?.message || "Error deleting user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(error.response?.data?.message || "Error deleting user");
    }
  };

  if (loading && users.length === 0) {
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
          {language === "ar" ? "المستخدمون" : "Users"}
        </h1>
        <Button onClick={() => navigate("/admin/users/create")}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة مستخدم" : "Add User"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === "ar" ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filters.role}
              onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع الأدوار" : "All Roles"}</option>
              <option value="ADMIN">{language === "ar" ? "مدير" : "Admin"}</option>
              <option value="TEACHER">{language === "ar" ? "معلم" : "Teacher"}</option>
              <option value="STUDENT">{language === "ar" ? "طالب" : "Student"}</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">{language === "ar" ? "جميع الحالات" : "All Status"}</option>
              <option value="ACTIVE">{language === "ar" ? "نشط" : "Active"}</option>
              <option value="BLOCKED">{language === "ar" ? "محظور" : "Blocked"}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا يوجد مستخدمون" : "No users found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.nameEn}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {language === "ar" ? user.nameAr : user.nameEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                          user.role === "TEACHER" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {user.role}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          user.status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {user.status}
                        </span>
                        {user.department && <span>{user.department}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        {language === "ar" ? "عرض" : "View"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        {language === "ar" ? "تعديل" : "Edit"}
                      </Button>
                      {user.status === "ACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlock(user.id)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          {language === "ar" ? "حظر" : "Block"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblock(user.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          {language === "ar" ? "إلغاء الحظر" : "Unblock"}
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {language === "ar" ? "حذف" : "Delete"}
                      </Button>
                    </div>
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

