import { toast } from 'sonner';

/**
 * Show success toast notification
 * @param message - Success message to display
 * @param description - Optional description
 */
export const showSuccessToast = (message: string, description?: string) => {
    toast.success(message, {
        description,
        duration: 4000,
    });
};

/**
 * Show error toast notification
 * @param message - Error message to display
 * @param description - Optional description
 */
export const showErrorToast = (message: string, description?: string) => {
    toast.error(message, {
        description,
        duration: 5000,
    });
};

/**
 * Show info toast notification
 * @param message - Info message to display
 * @param description - Optional description
 */
export const showInfoToast = (message: string, description?: string) => {
    toast.info(message, {
        description,
        duration: 4000,
    });
};

/**
 * Show loading toast notification
 * @param message - Loading message to display
 * @returns Toast ID for dismissal
 */
export const showLoadingToast = (message: string) => {
    return toast.loading(message);
};

/**
 * Dismiss a specific toast
 * @param toastId - ID of the toast to dismiss
 */
export const dismissToast = (toastId: string | number) => {
    toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = () => {
    toast.dismiss();
};
