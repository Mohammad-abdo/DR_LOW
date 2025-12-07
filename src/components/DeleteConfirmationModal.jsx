import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function DeleteConfirmationModal({ open, onClose, onConfirm, title, description, loading = false }) {
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>
              {title || (language === "ar" ? "تأكيد الحذف" : "Confirm Deletion")}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            {description || (language === "ar" ? "هل أنت متأكد من الحذف؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete? This action cannot be undone.")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {language === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2">{language === "ar" ? "جاري الحذف..." : "Deleting..."}</span>
              </>
            ) : (
              language === "ar" ? "حذف" : "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


