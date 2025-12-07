import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/settings");
      const data = extractDataFromResponse(response);
      setSettings(data.settings || []);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (setting) => {
    try {
      setSaving((prev) => ({ ...prev, [setting.key]: true }));
      await api.put(`/admin/settings/${setting.key}`, {
        valueAr: setting.valueAr,
        valueEn: setting.valueEn,
        value: setting.value,
        description: setting.description,
      });
      fetchSettings();
    } catch (error) {
      alert(error.response?.data?.message || "Error saving setting");
    } finally {
      setSaving((prev) => ({ ...prev, [setting.key]: false }));
    }
  };

  const handleChange = (key, field, value) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  if (loading) {
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
          {language === "ar" ? "الإعدادات" : "Settings"}
        </h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          {settings.length === 0 ? (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === "ar" ? "لا توجد إعدادات" : "No settings found"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {settings.map((setting) => (
                <motion.div
                  key={setting.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-lg p-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold">{setting.key}</label>
                      {setting.description && (
                        <p className="text-xs text-muted-foreground mt-1">{setting.description}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "ar" ? "القيمة (عربي)" : "Value (Arabic)"}
                        </label>
                        <Input
                          value={setting.valueAr || ""}
                          onChange={(e) => handleChange(setting.key, "valueAr", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          {language === "ar" ? "القيمة (إنجليزي)" : "Value (English)"}
                        </label>
                        <Input
                          value={setting.valueEn || ""}
                          onChange={(e) => handleChange(setting.key, "valueEn", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {language === "ar" ? "القيمة العامة" : "General Value"}
                      </label>
                      <Input
                        value={setting.value || ""}
                        onChange={(e) => handleChange(setting.key, "value", e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={() => handleSave(setting)}
                      disabled={saving[setting.key]}
                    >
                      {saving[setting.key] ? (
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
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



