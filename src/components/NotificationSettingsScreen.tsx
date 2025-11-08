import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface NotificationSettingsScreenProps {
    onBack: () => void;
}

export function NotificationSettingsScreen({ onBack }: NotificationSettingsScreenProps) {
    const userSettings = useQuery(api.notifications.getUserSettings, { includeDefaults: true });
    const notificationTypes = useQuery(api.notifications.getNotificationTypes);
    const globalPreferences = useQuery(api.notifications.getGlobalNotificationPreferences);

    const updateSetting = useMutation(api.notifications.updateNotificationSetting);
    const updateAllSettings = useMutation(api.notifications.updateAllNotificationSettings);
    const resetSettings = useMutation(api.notifications.resetAllNotificationSettings);
    const updateGlobalPreferences = useMutation(api.notifications.updateGlobalNotificationPreferences);

    const [isLoading, setIsLoading] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Group notification types by category
    const categorizedTypes = notificationTypes?.reduce((acc, type) => {
        const category = type.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(type);
        return acc;
    }, {} as Record<string, typeof notificationTypes>) || {};

    const categories = [
        { id: 'all', name: 'All Notifications', icon: 'fas fa-bell' },
        { id: 'engagement', name: 'Engagement', icon: 'fas fa-heart' },
        { id: 'social', name: 'Social', icon: 'fas fa-users' },
        { id: 'content', name: 'Content', icon: 'fas fa-file-alt' },
        { id: 'system', name: 'System', icon: 'fas fa-cog' }
    ];

    const handleToggleSetting = async (notificationType: string, channel: 'in_app' | 'email', enabled: boolean) => {
        try {
            setIsLoading(true);
            
            // Get current setting
            const currentSetting = getSettingForType(notificationType);
            const currentChannels = currentSetting?.channels || {
                in_app: true,
                email: true,
                whatsapp: false,
                sms: false,
                push: false
            };
            
            // Update the specific channel
            const updatedChannels = {
                ...currentChannels,
                [channel]: enabled
            };
            
            await updateSetting({
                notificationType,
                enabled: currentSetting?.enabled !== false,
                channels: updatedChannels,
                batchingPreference: currentSetting?.batchingPreference || 'immediate'
            });
        } catch (error) {
            console.error(`Failed to update ${channel} setting:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetSettings = async () => {
        if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
            try {
                setIsLoading(true);
                await resetSettings();
            } catch (error) {
                console.error('Failed to reset settings:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleUpdateGlobalPreference = async (field: string, value: any) => {
        try {
            setIsLoading(true);
            await updateGlobalPreferences({ [field]: value });
        } catch (error) {
            console.error(`Failed to update ${field}:`, error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSettingForType = (notificationType: string) => {
        return userSettings?.find(setting => setting.notificationType === notificationType);
    };

    const filteredTypes = activeCategory === 'all'
        ? Object.values(categorizedTypes).flat()
        : categorizedTypes[activeCategory] || [];

    if (!userSettings || !notificationTypes) {
        return (
            <div className="p-4">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
                    <p className="text-gray-500">Loading notification settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full"
                    >
                        <i className="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <h1 className="text-xl font-semibold text-gray-900">Notification Settings</h1>
                </div>

                <button
                    onClick={handleResetSettings}
                    disabled={isLoading}
                    className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                    Reset to defaults
                </button>
            </div>

            {/* Global Settings */}
            {globalPreferences && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <h2 className="text-lg font-medium text-gray-900">Global Preferences</h2>

                    {/* Quiet Hours */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Quiet Hours</label>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">From:</label>
                                <input
                                    type="time"
                                    value={globalPreferences.quietHoursStart || "22:00"}
                                    onChange={(e) => handleUpdateGlobalPreference('quietHoursStart', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="text-sm text-gray-600">To:</label>
                                <input
                                    type="time"
                                    value={globalPreferences.quietHoursEnd || "08:00"}
                                    onChange={(e) => handleUpdateGlobalPreference('quietHoursEnd', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Batching Preferences */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Notification Batching</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={globalPreferences.batchingEnabled !== false}
                                onChange={(e) => handleUpdateGlobalPreference('batchingEnabled', e.target.checked)}
                                className="rounded border-gray-300"
                                disabled={isLoading}
                            />
                            <span className="text-sm text-gray-600">
                                Group similar notifications together (reduces notification frequency)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${activeCategory === category.id
                            ? "bg-accent text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                    >
                        <i className={category.icon}></i>
                        <span>{category.name}</span>
                    </button>
                ))}
            </div>

            {/* Notification Types */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900">
                        {activeCategory === 'all' ? 'All Notifications' : categories.find(c => c.id === activeCategory)?.name}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>In-App</span>
                        <span>Email</span>
                    </div>
                </div>

                {filteredTypes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No notification types found for this category.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredTypes.map((type) => {
                            const setting = getSettingForType(type.id);
                            return (
                                <div
                                    key={type.id}
                                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                                >
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium text-gray-900">{type.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                                        {type.priority === 'high' && (
                                            <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                                High Priority
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-6 ml-4">
                                        {/* In-App Toggle */}
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={setting?.channels?.in_app !== false}
                                                onChange={(e) => handleToggleSetting(type.id, 'in_app', e.target.checked)}
                                                disabled={isLoading}
                                                className="sr-only"
                                            />
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting?.channels?.in_app !== false ? 'bg-accent' : 'bg-gray-200'
                                                } ${isLoading ? 'opacity-50' : ''}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting?.channels?.in_app !== false ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </div>
                                        </label>

                                        {/* Email Toggle */}
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={setting?.channels?.email !== false}
                                                onChange={(e) => handleToggleSetting(type.id, 'email', e.target.checked)}
                                                disabled={isLoading}
                                                className="sr-only"
                                            />
                                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${setting?.email !== false ? 'bg-accent' : 'bg-gray-200'
                                                } ${isLoading ? 'opacity-50' : ''}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting?.email !== false ? 'translate-x-6' : 'translate-x-1'
                                                    }`} />
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
