import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, Loader2 } from "lucide-react";
import { getImageUrl } from "@/lib/imageHelper";
import { alertSuccess, alertError, confirm } from "@/lib/alert";

export default function AdminBanners() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, inactive
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchBanners();
  }, [pagination.page, filter]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/banners", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          active: filter === "all" ? undefined : filter === "active",
        },
      });
      const data = extractDataFromResponse(response);
      console.log("Banners API Response:", response.data);
      console.log("Extracted Data:", data);
      
      // Handle different response structures
      let bannersList = [];
      let paginationData = {};
      
      if (Array.isArray(data)) {
        bannersList = data;
      } else if (data.banners) {
        bannersList = Array.isArray(data.banners) ? data.banners : [];
        paginationData = data.pagination || {};
      } else if (data.data && Array.isArray(data.data)) {
        bannersList = data.data;
        paginationData = data.pagination || {};
      } else {
        bannersList = [];
      }
      
      setBanners(bannersList);
      setPagination((prev) => ({
        ...prev,
        ...paginationData,
      }));
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await api.put(`/admin/banners/${id}`, { active: !currentActive });
      console.log("Toggle active response:", response.data);
      if (response.data?.success) {
        fetchBanners();
      } else {
        alertError(response.data?.message || "Error updating banner");
      }
    } catch (error) {
      console.error("Error updating banner:", error);
      alertError(error.response?.data?.message || "Error updating banner");
    }
  };

  const handleDelete = async (id) => {
    const result = await confirm(
      language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?",
      language === "ar" ? "تأكيد الحذف" : "Confirm Delete",
      { type: 'danger' }
    );
    if (!result) {
      return;
    }
    try {
      const response = await api.delete(`/admin/banners/${id}`);
      console.log("Delete response:", response.data);
      if (response.data?.success) {
        alertSuccess(language === "ar" ? "تم حذف البانر بنجاح" : "Banner deleted successfully");
        fetchBanners();
      } else {
        alertError(response.data?.message || "Error deleting banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
      alertError(error.response?.data?.message || "Error deleting banner");
    }
  };

  if (loading && banners.length === 0) {
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
          {language === "ar" ? "اللافتات" : "Banners"}
        </h1>
        <Button onClick={() => navigate("/admin/banners/new")}>
          <Plus className="w-4 h-4 mr-2" />
          {language === "ar" ? "إضافة لافتة" : "Add Banner"}
        </Button>
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
              <option value="active">{language === "ar" ? "نشط" : "Active"}</option>
              <option value="inactive">{language === "ar" ? "غير نشط" : "Inactive"}</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد لافتات" : "No banners found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.map((banner) => (
                <motion.div
                  key={banner.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {banner.image ? (
                    <img
                      src={getImageUrl(banner.image)}
                      alt={banner.titleEn || banner.titleAr}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-32 bg-gray-100 flex items-center justify-center ${banner.image ? 'hidden' : ''}`}>
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">
                      {language === "ar" ? banner.titleAr : banner.titleEn}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant={banner.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleActive(banner.id, banner.active)}
                      >
                        {banner.active
                          ? language === "ar" ? "نشط" : "Active"
                          : language === "ar" ? "غير نشط" : "Inactive"}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/banners/${banner.id}/edit`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
