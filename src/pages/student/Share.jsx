import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import api from "@/lib/api";
import { extractDataFromResponse } from "@/lib/apiHelper";
import {
  Share2,
  Copy,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import showToast from "@/lib/toast";

export default function Share() {
  const { language } = useLanguage();
  const [shareData, setShareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchShareData();
  }, []);

  const fetchShareData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/mobile/student/share");
      const data = extractDataFromResponse(response);
      setShareData(data);
    } catch (error) {
      console.error("Error fetching share data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareData?.url) {
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        showToast.success(
          language === "ar" ? "تم نسخ الرابط" : "Link copied"
        );
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        showToast.error(
          language === "ar" ? "فشل نسخ الرابط" : "Failed to copy link"
        );
      }
    }
  };

  const handleShare = async (method) => {
    if (!shareData) return;

    const shareText = language === "ar" ? shareData.messageAr : shareData.messageEn;
    const shareTitle = language === "ar" ? shareData.titleAr : shareData.titleEn;

    if (method === "native" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareData.url,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else if (method === "email") {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + "\n\n" + shareData.url)}`;
    } else if (method === "whatsapp") {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareData.url)}`,
        "_blank"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!shareData) {
    return null;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          {language === "ar" ? "شارك التطبيق" : "Share App"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ar"
            ? "شارك التطبيق مع أصدقائك وادعهم للانضمام"
            : "Share the app with your friends and invite them to join"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {language === "ar" ? shareData.titleAr : shareData.titleEn}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === "ar" ? shareData.messageAr : shareData.messageEn}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Share Link */}
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === "ar" ? "رابط المشاركة" : "Share Link"}
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={shareData.url}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    {language === "ar" ? "تم النسخ" : "Copied"}
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    {language === "ar" ? "نسخ" : "Copy"}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {navigator.share && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleShare("native")}
                className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex flex-col items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-colors"
              >
                <Share2 className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {language === "ar" ? "مشاركة" : "Share"}
                </span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare("whatsapp")}
              className="p-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg flex flex-col items-center gap-2 hover:from-green-600 hover:to-green-700 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-sm font-medium">WhatsApp</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare("email")}
              className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg flex flex-col items-center gap-2 hover:from-gray-600 hover:to-gray-700 transition-colors"
            >
              <Mail className="w-6 h-6" />
              <span className="text-sm font-medium">Email</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyLink}
              className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg flex flex-col items-center gap-2 hover:from-purple-600 hover:to-purple-700 transition-colors"
            >
              <LinkIcon className="w-6 h-6" />
              <span className="text-sm font-medium">
                {language === "ar" ? "رابط" : "Link"}
              </span>
            </motion.button>
          </div>

          {/* Share Message Preview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "ar" ? "معاينة الرسالة:" : "Message Preview:"}
            </p>
            <p className="text-sm">
              {language === "ar" ? shareData.messageAr : shareData.messageEn}
            </p>
            <p className="text-xs text-primary mt-2 break-all">{shareData.url}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

