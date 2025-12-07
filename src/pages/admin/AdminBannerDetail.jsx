import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, Loader2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { getImageUrl } from "@/lib/imageHelper";

export default function AdminBannerDetail() {
  const { id } = useParams();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/banners/${id}`);
      const data = extractDataFromResponse(response);
      setBanner(data.banner || data);
    } catch (error) {
      console.error("Error fetching banner:", error);
      alert(error.response?.data?.message || "Error loading banner");
      navigate("/admin/banners");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(language === "ar" ? "هل أنت متأكد من الحذف؟" : "Are you sure you want to delete?")) {
      return;
    }
    try {
      await api.delete(`/admin/banners/${id}`);
      alert(language === "ar" ? "تم الحذف بنجاح" : "Banner deleted successfully");
      navigate("/admin/banners");
    } catch (error) {
      alert(error.response?.data?.message || "Error deleting banner");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!banner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/banners")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/banners/${id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            {language === "ar" ? "تعديل" : "Edit"}
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            {language === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">
            {language === "ar" ? banner.titleAr : banner.titleEn}
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Banner Image */}
          {banner.image && (
            <div>
              <img
                src={getImageUrl(banner.image)}
                alt={banner.titleEn || banner.titleAr}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"}</p>
              <p className="font-semibold">{banner.titleAr}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"}</p>
              <p className="font-semibold">{banner.titleEn}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الرابط" : "Link"}</p>
              <p className="font-semibold">{banner.link || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الترتيب" : "Order"}</p>
              <p className="font-semibold">{banner.order}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "الحالة" : "Status"}</p>
              <div className="flex items-center gap-2">
                {banner.active ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`px-3 py-1 rounded text-sm ${
                  banner.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {banner.active ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "غير نشط" : "Inactive")}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{language === "ar" ? "تاريخ الإنشاء" : "Created At"}</p>
              <p className="font-semibold">
                {banner.createdAt ? format(new Date(banner.createdAt), "PPp") : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


