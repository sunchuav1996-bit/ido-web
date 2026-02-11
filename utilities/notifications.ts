// Notification utility for showing toast-like messages
// This is a simple implementation without external dependencies

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

let notificationListeners: ((notification: Notification) => void)[] = [];

/**
 * Subscribe to notifications
 * Used by components to listen for notification events
 */
export const onNotification = (callback: (notification: Notification) => void): (() => void) => {
    notificationListeners.push(callback);
    return () => {
        notificationListeners = notificationListeners.filter(cb => cb !== callback);
    };
};

/**
 * Show a notification
 * @param message - The notification message
 * @param type - Type of notification (success, error, info, warning)
 * @param duration - Duration in milliseconds before auto-dismissing (0 = no auto-dismiss)
 */
export const showNotification = (
    message: string,
    type: NotificationType = 'info',
    duration: number = 3000
): string => {
    const id = `${Date.now()}-${Math.random()}`;
    const notification: Notification = {
        id,
        message,
        type,
        duration
    };

    notificationListeners.forEach(callback => callback(notification));

    return id;
};

/**
 * Show success notification
 */
export const showSuccess = (message: string, duration?: number): string => {
    return showNotification(message, 'success', duration);
};

/**
 * Show error notification
 */
export const showError = (message: string, duration?: number): string => {
    return showNotification(message, 'error', duration);
};

/**
 * Show info notification
 */
export const showInfo = (message: string, duration?: number): string => {
    return showNotification(message, 'info', duration);
};

/**
 * Show warning notification
 */
export const showWarning = (message: string, duration?: number): string => {
    return showNotification(message, 'warning', duration);
};
