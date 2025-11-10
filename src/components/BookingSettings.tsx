import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface BookingSettingsProps {
  onBack: () => void;
}

export function BookingSettings({ onBack }: BookingSettingsProps) {
  const [settings, setSettings] = useState({
    confirmationType: 'AUTOMATIC',
    bufferTime: 15,
    maxAdvanceBooking: 30,
    cancellationPolicy: '24',
    sessionInstructions: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Get current settings
  const currentSettings = useQuery(api.bookingSettings.getMySettings);

  // Mutations
  const updateSettings = useMutation(api.bookingSettings.createOrUpdateSettings);
  const resetSettings = useMutation(api.bookingSettings.resetToDefaults);

  // Load current settings when available
  useEffect(() => {
    if (currentSettings) {
      setSettings({
        confirmationType: currentSettings.confirmationType,
        bufferTime: currentSettings.bufferTime,
        maxAdvanceBooking: currentSettings.maxAdvanceBooking,
        cancellationPolicy: currentSettings.cancellationPolicy,
        sessionInstructions: currentSettings.sessionInstructions || ''
      });
    }
  }, [currentSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateSettings({
        confirmationType: settings.confirmationType,
        bufferTime: settings.bufferTime,
        maxAdvanceBooking: settings.maxAdvanceBooking,
        cancellationPolicy: settings.cancellationPolicy,
        sessionInstructions: settings.sessionInstructions || undefined
      });

      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      await resetSettings();
      setSaveMessage('Settings reset to defaults!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setSaveMessage('Failed to reset settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!currentSettings) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-accent text-white p-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Booking Settings</h1>
              <p className="text-white/90 mt-1">Manage how your bookings are handled</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Confirmation Type */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Booking Confirmation</h3>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="confirmationType"
                  value="AUTOMATIC"
                  checked={settings.confirmationType === 'AUTOMATIC'}
                  onChange={(e) => updateSetting('confirmationType', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Automatic Confirmation</div>
                  <div className="text-sm text-gray-600">
                    Bookings are confirmed immediately after payment. Recommended for most providers.
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="confirmationType"
                  value="MANUAL"
                  checked={settings.confirmationType === 'MANUAL'}
                  onChange={(e) => updateSetting('confirmationType', e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-gray-800">Manual Confirmation</div>
                  <div className="text-sm text-gray-600">
                    You'll need to manually approve each booking. Use this if you want to screen clients first.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Buffer Time */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Buffer Time</h3>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="0"
                max="120"
                value={settings.bufferTime}
                onChange={(e) => updateSetting('bufferTime', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-gray-600">minutes between sessions</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Time buffer to prevent back-to-back bookings. Recommended: 15-30 minutes.
            </p>
          </div>

          {/* Max Advance Booking */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Advance Booking Limit</h3>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max="365"
                value={settings.maxAdvanceBooking}
                onChange={(e) => updateSetting('maxAdvanceBooking', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-gray-600">days in advance</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              How far in advance clients can book sessions. Recommended: 30 days.
            </p>
          </div>

          {/* Cancellation Policy */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Cancellation Policy</h3>
            <div className="flex items-center space-x-4">
              <select
                value={settings.cancellationPolicy}
                onChange={(e) => updateSetting('cancellationPolicy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
                <option value="48">48 hours</option>
                <option value="72">72 hours</option>
              </select>
              <span className="text-gray-600">before session</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Minimum notice required for cancellations. Recommended: 24 hours.
            </p>
          </div>

          {/* Session Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Default Session Instructions</h3>
            <textarea
              value={settings.sessionInstructions}
              onChange={(e) => updateSetting('sessionInstructions', e.target.value)}
              rows={4}
              placeholder="Enter default instructions that will be sent to clients when their booking is confirmed (e.g., meeting link, preparation notes, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-sm text-gray-500 mt-2">
              These instructions will be included in booking confirmations. You can customize them for each booking if needed.
            </p>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-3 rounded-lg ${
              saveMessage.includes('successfully') || saveMessage.includes('reset')
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 transition-colors"
            >
              Reset to Defaults
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </span>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">
          <i className="fas fa-info-circle mr-2"></i>
          Tips for Better Bookings
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use automatic confirmation for faster booking experience</li>
          <li>• Set appropriate buffer time to avoid rushing between sessions</li>
          <li>• Clear session instructions help clients prepare better</li>
          <li>• Consider your schedule when setting advance booking limits</li>
        </ul>
      </div>
    </div>
  );
}