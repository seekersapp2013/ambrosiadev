import React, { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type PrivacyLevel = 'everyone' | 'followers' | 'following' | 'mutual_follows' | 'none';

const ChatPrivacySettings: React.FC = () => {
    const settings = useQuery(api.chatPrivacy.getChatPrivacySettings);
    const updateSettings = useMutation(api.chatPrivacy.updateChatPrivacySettings);

    const [whoCanMessage, setWhoCanMessage] = useState<PrivacyLevel>('everyone');
    const [allowMessagesFromArticles, setAllowMessagesFromArticles] = useState(true);
    const [allowMessagesFromBookings, setAllowMessagesFromBookings] = useState(true);
    const [autoAcceptFromFollowing, setAutoAcceptFromFollowing] = useState(true);

    // Update local state when settings load
    React.useEffect(() => {
        if (settings) {
            setWhoCanMessage(settings.whoCanMessage as PrivacyLevel);
            setAllowMessagesFromArticles(settings.allowMessagesFromArticles);
            setAllowMessagesFromBookings(settings.allowMessagesFromBookings);
            setAutoAcceptFromFollowing(settings.autoAcceptFromFollowing);
        }
    }, [settings]);

    const handleSave = async () => {
        try {
            await updateSettings({
                whoCanMessage,
                allowMessagesFromArticles,
                allowMessagesFromBookings,
                autoAcceptFromFollowing,
            });
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings');
        }
    };

    const privacyOptions = [
        { value: 'everyone', label: 'Everyone', description: 'Anyone can message you' },
        { value: 'followers', label: 'Followers Only', description: 'Only people who follow you can message you' },
        { value: 'following', label: 'Following Only', description: 'Only people you follow can message you' },
        { value: 'mutual_follows', label: 'Mutual Follows', description: 'Only people you follow and who follow you back' },
        { value: 'none', label: 'No One', description: 'No one can message you' },
    ];

    if (!settings) {
        return <div>Loading...</div>;
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Chat Privacy Settings</h2>

            <div className="space-y-6">
                {/* Who can message you */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Who can message you?
                    </label>
                    <div className="space-y-3">
                        {privacyOptions.map((option) => (
                            <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                                <input
                                    type="radio"
                                    name="whoCanMessage"
                                    value={option.value}
                                    checked={whoCanMessage === option.value}
                                    onChange={(e) => setWhoCanMessage(e.target.value as PrivacyLevel)}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-gray-500">{option.description}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Additional settings */}
                <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={allowMessagesFromArticles}
                            onChange={(e) => setAllowMessagesFromArticles(e.target.checked)}
                        />
                        <span>Allow messages from article viewers</span>
                    </label>

                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={allowMessagesFromBookings}
                            onChange={(e) => setAllowMessagesFromBookings(e.target.checked)}
                        />
                        <span>Allow messages from booking clients/providers</span>
                    </label>

                    <label className="flex items-center space-x-3">
                        <input
                            type="checkbox"
                            checked={autoAcceptFromFollowing}
                            onChange={(e) => setAutoAcceptFromFollowing(e.target.checked)}
                        />
                        <span>Auto-accept conversations from people you follow</span>
                    </label>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default ChatPrivacySettings;