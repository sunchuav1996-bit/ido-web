import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { onNotification, Notification, NotificationType } from '../utilities/notifications';

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const unsubscribe = onNotification((notification) => {
            setNotifications(prev => [...prev, notification]);

            // Auto-remove notification after duration
            if (notification.duration && notification.duration > 0) {
                const timer = setTimeout(() => {
                    removeNotification(notification.id);
                }, notification.duration);

                return () => clearTimeout(timer);
            }
        });

        return unsubscribe;
    }, []);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'info':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    const getTextColor = (type: NotificationType) => {
        switch (type) {
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'warning':
                return 'text-yellow-800';
            case 'info':
            default:
                return 'text-blue-800';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm space-y-3 pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto transition-opacity ${getBgColor(
                        notification.type
                    )}`}
                >
                    {getIcon(notification.type)}
                    <p className={`flex-1 text-sm font-medium ${getTextColor(notification.type)}`}>
                        {notification.message}
                    </p>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className={`flex-shrink-0 ${getTextColor(notification.type)} hover:opacity-70 transition-opacity`}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
