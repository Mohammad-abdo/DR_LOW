import { toast } from 'sonner';
import { createRoot } from 'react-dom/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';

// Get language from localStorage or default to 'en'
const getLanguage = () => {
  try {
    return localStorage.getItem('language') || 'en';
  } catch {
    return 'en';
  }
};

// Alert types
const ALERT_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Alert component for custom alerts
function AlertDialog({ open, onClose, title, message, type = ALERT_TYPES.INFO, confirmText, onConfirm, language }) {
  const getIcon = () => {
    switch (type) {
      case ALERT_TYPES.SUCCESS:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case ALERT_TYPES.ERROR:
        return <XCircle className="w-5 h-5 text-red-600" />;
      case ALERT_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case ALERT_TYPES.SUCCESS:
        return 'bg-green-100';
      case ALERT_TYPES.ERROR:
        return 'bg-red-100';
      case ALERT_TYPES.WARNING:
        return 'bg-yellow-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getButtonVariant = () => {
    switch (type) {
      case ALERT_TYPES.ERROR:
        return 'destructive';
      case ALERT_TYPES.WARNING:
        return 'default';
      default:
        return 'default';
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${getIconBg()} flex items-center justify-center`}>
              {getIcon()}
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant={getButtonVariant()} onClick={onConfirm || onClose}>
            {confirmText || (language === 'ar' ? 'موافق' : 'OK')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Confirm Dialog Component
function ConfirmDialog({ open, onClose, title, message, confirmText, cancelText, onConfirm, type = 'warning', language }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (onConfirm) {
        await onConfirm();
      }
      onClose();
    } catch (error) {
      console.error('Confirm action error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${
              type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
            } flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${
                type === 'danger' ? 'text-red-600' : 'text-yellow-600'
              }`} />
            </div>
            <DialogTitle>
              {title || (language === 'ar' ? 'تأكيد' : 'Confirm')}
            </DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelText || (language === 'ar' ? 'إلغاء' : 'Cancel')}
          </Button>
          <Button 
            variant={type === 'danger' ? 'destructive' : 'default'} 
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
              </>
            ) : (
              confirmText || (language === 'ar' ? 'تأكيد' : 'Confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Alert function - replacement for window.alert()
export const alert = (message, type = ALERT_TYPES.INFO, title = null) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const language = getLanguage();

    const getDefaultTitle = () => {
      switch (type) {
        case ALERT_TYPES.SUCCESS:
          return language === 'ar' ? 'نجح' : 'Success';
        case ALERT_TYPES.ERROR:
          return language === 'ar' ? 'خطأ' : 'Error';
        case ALERT_TYPES.WARNING:
          return language === 'ar' ? 'تحذير' : 'Warning';
        default:
          return language === 'ar' ? 'معلومة' : 'Information';
      }
    };

    const handleClose = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve();
    };

    root.render(
      <AlertDialog
        open={true}
        onClose={handleClose}
        title={title || getDefaultTitle()}
        message={message}
        type={type}
        onConfirm={handleClose}
        language={language}
      />
    );
  });
};

// Confirm function - replacement for window.confirm()
export const confirm = (message, title = null, options = {}) => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const language = getLanguage();

    const {
      confirmText = null,
      cancelText = null,
      type = 'warning',
      onConfirm: customOnConfirm = null,
    } = options;

    const handleConfirm = async () => {
      if (customOnConfirm) {
        await customOnConfirm();
      }
      root.unmount();
      document.body.removeChild(container);
      resolve(true);
    };

    const handleCancel = () => {
      root.unmount();
      document.body.removeChild(container);
      resolve(false);
    };

    root.render(
      <ConfirmDialog
        open={true}
        onClose={handleCancel}
        title={title || (language === 'ar' ? 'تأكيد' : 'Confirm')}
        message={message}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        type={type}
        language={language}
      />
    );
  });
};

// Convenience methods
export const alertSuccess = (message, title = null) => alert(message, ALERT_TYPES.SUCCESS, title);
export const alertError = (message, title = null) => alert(message, ALERT_TYPES.ERROR, title);
export const alertWarning = (message, title = null) => alert(message, ALERT_TYPES.WARNING, title);
export const alertInfo = (message, title = null) => alert(message, ALERT_TYPES.INFO, title);

// Export types
export { ALERT_TYPES };

// Default export with all methods
export default {
  alert,
  confirm,
  success: alertSuccess,
  error: alertError,
  warning: alertWarning,
  info: alertInfo,
  ALERT_TYPES,
};

