import { useState } from "react";
import { NotificationsScreen } from "./NotificationsScreen";
import { NotificationSettingsScreen } from "./NotificationSettingsScreen";

interface NotificationManagerProps {
  onBack: () => void;
}

export function NotificationManager({ onBack }: NotificationManagerProps) {
  const [currentView, setCurrentView] = useState<"notifications" | "settings">("notifications");

  const handleBack = () => {
    if (currentView === "settings") {
      setCurrentView("notifications");
    } else {
      onBack();
    }
  };

  const handleOpenSettings = () => {
    setCurrentView("settings");
  };

  if (currentView === "settings") {
    return <NotificationSettingsScreen onBack={handleBack} />;
  }

  return (
    <NotificationsScreen 
      onBack={handleBack} 
      onOpenSettings={handleOpenSettings}
    />
  );
}