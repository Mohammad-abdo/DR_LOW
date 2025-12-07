import { toast } from 'sonner';

export const showToast = {
  success: (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  },
  error: (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  },
  info: (message, options = {}) => {
    toast.info(message, {
      duration: 3000,
      ...options,
    });
  },
  warning: (message, options = {}) => {
    toast.warning(message, {
      duration: 3000,
      ...options,
    });
  },
};

export default showToast;
