import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminBannerCreate() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titleAr: "",
    titleEn: "",
    link: "",
    order: 0,
    active: true,
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append("titleAr", formData.titleAr);
      formDataToSend.append("titleEn", formData.titleEn);
      formDataToSend.append("link", formData.link || "");
      formDataToSend.append("order", formData.order.toString());
      formDataToSend.append("active", formData.active.toString());
      if (image) {
        formDataToSend.append("image", image);
      }

      await api.post("/admin/banners", formDataToSend);

      alert(language === "ar" ? "تم إنشاء البانر بنجاح" : "Banner created successfully");
      navigate("/admin/banners");
    } catch (error) {
      console.error("Error creating banner:", error);
      alert(error.response?.data?.message || "Error creating banner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/admin/banners")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "ar" ? "العودة" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold">
          {language === "ar" ? "إنشاء بانر جديد" : "Create New Banner"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">
            {language === "ar" ? "معلومات البانر" : "Banner Information"}
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الصورة" : "Image"} *
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    required
                  />
                </div>
                {imagePreview && (
                  <div className="w-32 h-20 rounded-lg overflow-hidden border">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Title Arabic */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "العنوان (عربي)" : "Title (Arabic)"} *
              </label>
              <Input
                value={formData.titleAr}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                required
                dir="rtl"
              />
            </div>

            {/* Title English */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "العنوان (إنجليزي)" : "Title (English)"} *
              </label>
              <Input
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                required
              />
            </div>

            {/* Link - Optional */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الرابط (اختياري)" : "Link (Optional)"}
              </label>
              <Input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder={language === "ar" ? "https://example.com (اختياري)" : "https://example.com (optional)"}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === "ar" ? "اتركه فارغاً إذا لم تكن بحاجة إلى رابط" : "Leave empty if you don't need a link"}
              </p>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الترتيب" : "Order"}
              </label>
              <Input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            {/* Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="active" className="text-sm font-medium">
                {language === "ar" ? "نشط" : "Active"}
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/banners")}
              >
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === "ar" ? "جاري الحفظ..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {language === "ar" ? "حفظ" : "Save"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


