import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import type { Notification } from "@shared/schema";

interface FloatingNotificationProps {
  notifications?: Notification[];
}

export default function FloatingNotification({ notifications }: FloatingNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    const latestNotification = unreadNotifications[0];
    setCurrentNotification(latestNotification);
    setVisible(true);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'ERROR':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const hideNotification = () => {
    setVisible(false);
  };

  if (!visible || !currentNotification) {
    return null;
  }

  return (
    <div className="floating-notification">
      <Card className="w-80 shadow-lg border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(currentNotification.type)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {currentNotification.title}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {currentNotification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideNotification}
              className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
