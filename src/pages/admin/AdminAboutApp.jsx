import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Info } from "lucide-react";

export default function AdminAboutApp() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutApp, setAboutApp] = useState({
    appName: "",
    description: "",
    version: "",
    whatsappPhone1: "",
    whatsappPhone2: "",
  });
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    fetchAboutApp();
  }, []);

  const fetchAboutApp = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/about-app");
      const data = extractDataFromResponse(response);
      
      if (data.aboutApp) {
        setAboutApp({
          appName: data.aboutApp.appName || "",
          description: data.aboutApp.description || "",
          version: data.aboutApp.version || "",
          whatsappPhone1: data.aboutApp.whatsappPhone1 || "",
          whatsappPhone2: data.aboutApp.whatsappPhone2 || "",
        });
        setIsNew(false);
      } else {
        setIsNew(true);
      }
    } catch (error) {
      console.error("Error fetching about app:", error);
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (isNew) {
        await api.post("/admin/about-app", aboutApp);
        alert(language === "ar" ? "تم إنشاء معلومات التطبيق بنجاح" : "About app created successfully");
      } else {
        const response = await api.get("/admin/about-app");
        const data = extractDataFromResponse(response);
        if (data.aboutApp?.id) {
          await api.put(`/admin/about-app/${data.aboutApp.id}`, aboutApp);
          alert(language === "ar" ? "تم تحديث معلومات التطبيق بنجاح" : "About app updated successfully");
        }
      }
      
      await fetchAboutApp();
    } catch (error) {
      console.error("Error saving about app:", error);
      alert(error.response?.data?.message || (language === "ar" ? "خطأ في الحفظ" : "Error saving"));
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
            {language === "ar" ? "معلومات التطبيق" : "About App"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "ar"
              ? "إدارة معلومات التطبيق"
              : "Manage app information"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {language === "ar" ? "معلومات التطبيق" : "App Information"}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "اسم التطبيق" : "App Name"} *
              </label>
              <Input
                value={aboutApp.appName}
                onChange={(e) => setAboutApp({ ...aboutApp, appName: e.target.value })}
                required
                placeholder={language === "ar" ? "اسم التطبيق" : "App Name"}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الوصف" : "Description"}
              </label>
              <Textarea
                value={aboutApp.description}
                onChange={(e) => setAboutApp({ ...aboutApp, description: e.target.value })}
                placeholder={language === "ar" ? "وصف التطبيق" : "App Description"}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {language === "ar" ? "الإصدار" : "Version"} *
              </label>
              <Input
                value={aboutApp.version}
                onChange={(e) => setAboutApp({ ...aboutApp, version: e.target.value })}
                required
                placeholder="1.0.0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "واتساب 1" : "WhatsApp 1"}
                </label>
                <Input
                  value={aboutApp.whatsappPhone1}
                  onChange={(e) => setAboutApp({ ...aboutApp, whatsappPhone1: e.target.value })}
                  placeholder="+96512345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === "ar" ? "واتساب 2" : "WhatsApp 2"}
                </label>
                <Input
                  value={aboutApp.whatsappPhone2}
                  onChange={(e) => setAboutApp({ ...aboutApp, whatsappPhone2: e.target.value })}
                  placeholder="+96587654321"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
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
    </div>
  );
}

















