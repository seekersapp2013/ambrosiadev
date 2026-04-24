import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ModerationSettingsPanel() {
  const settings = useQuery(api.moderationSettings.getModerationSettings);
  const updateSettings = useMutation(api.moderationSettings.updateModerationSettings);

  const handleToggle = async (field: string, value: boolean) => {
    try {
      await updateSettings({ [field]: value });
    } catch (error) {
      console.error("Error updating settings:", error);
      alert(error instanceof Error ? error.message : "Failed to update settings");
    }
  };

  if (settings === undefined) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6">Moderation Settings</h2>

      <div className="space-y-6">
        <SettingToggle
          label="Articles Require Approval"
          description="New articles must be approved before being published"
          checked={settings.articlesRequireApproval}
          onChange={(checked) => handleToggle("articlesRequireApproval", checked)}
        />

        <SettingToggle
          label="Reels Require Approval"
          description="New reels must be approved before being published"
          checked={settings.reelsRequireApproval}
          onChange={(checked) => handleToggle("reelsRequireApproval", checked)}
        />

        <SettingToggle
          label="Circles Require Approval"
          description="New circles must be approved before being created"
          checked={settings.circlesRequireApproval}
          onChange={(checked) => handleToggle("circlesRequireApproval", checked)}
        />

        <SettingToggle
          label="Expert Requests Require Approval"
          description="New expert requests must be approved before being posted"
          checked={settings.expertRequestsRequireApproval}
          onChange={(checked) => handleToggle("expertRequestsRequireApproval", checked)}
        />

        <SettingToggle
          label="Booking Subscribers Require Approval"
          description="Users must be approved before becoming booking providers"
          checked={settings.bookingSubscribersRequireApproval}
          onChange={(checked) => handleToggle("bookingSubscribersRequireApproval", checked)}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          <i className="fas fa-info-circle mr-2 text-blue-500"></i>
          Changes take effect immediately. Content created while approval is disabled will not require approval.
        </p>
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 mb-1">{label}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  );
}
