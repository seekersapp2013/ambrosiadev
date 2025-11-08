import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { WeeklySchedule, DaySchedule } from '../types/booking';

interface ProviderSubscriptionProps {
  onBack: () => void;
  onSuccess: () => void;
}

const defaultDaySchedule: DaySchedule = {
  start: "09:00",
  end: "17:00",
  available: false
};

const defaultOpenHours: WeeklySchedule = {
  monday: { ...defaultDaySchedule },
  tuesday: { ...defaultDaySchedule },
  wednesday: { ...defaultDaySchedule },
  thursday: { ...defaultDaySchedule },
  friday: { ...defaultDaySchedule },
  saturday: { ...defaultDaySchedule },
  sunday: { ...defaultDaySchedule }
};

export function ProviderSubscription({ onBack, onSuccess }: ProviderSubscriptionProps) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    specialization: '',
    oneOnOnePrice: 50,
    groupSessionPrice: 30,
    sessionPrice: 50, // Legacy field - matches oneOnOnePrice for backward compatibility
    aboutUser: '',
    xLink: '',
    linkedInLink: '',
    offerDescription: '',
    openHours: defaultOpenHours
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user profile for auto-population
  const myProfile = useQuery(api.profiles.getMyProfile);
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    myProfile?.avatar ? { storageId: myProfile.avatar } : "skip"
  );

  // Get existing subscription if any
  const existingSubscription = useQuery(api.bookingSubscribers.getMySubscription);

  // Mutations
  const createSubscriber = useMutation(api.bookingSubscribers.createSubscriber);
  const updateSubscriber = useMutation(api.bookingSubscribers.updateSubscriber);

  // Load existing data if editing
  useEffect(() => {
    if (existingSubscription) {
      const oneOnOnePrice = (existingSubscription as any).oneOnOnePrice || existingSubscription.sessionPrice || 50;
      const groupSessionPrice = (existingSubscription as any).groupSessionPrice || 30;
      
      setFormData({
        jobTitle: existingSubscription.jobTitle,
        specialization: existingSubscription.specialization,
        oneOnOnePrice: oneOnOnePrice,
        groupSessionPrice: groupSessionPrice,
        sessionPrice: existingSubscription.sessionPrice || oneOnOnePrice, // Use existing sessionPrice or fallback to oneOnOnePrice
        aboutUser: existingSubscription.aboutUser,
        xLink: existingSubscription.xLink || '',
        linkedInLink: existingSubscription.linkedInLink || '',
        offerDescription: existingSubscription.offerDescription,
        openHours: existingSubscription.openHours
      });
    }
  }, [existingSubscription]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.specialization.trim()) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.oneOnOnePrice || formData.oneOnOnePrice <= 0) {
      newErrors.oneOnOnePrice = '1-on-1 session price must be greater than 0';
    }

    if (!formData.groupSessionPrice || formData.groupSessionPrice <= 0) {
      newErrors.groupSessionPrice = 'Group session price must be greater than 0';
    }

    if (!formData.aboutUser.trim()) {
      newErrors.aboutUser = 'About section is required';
    }

    if (!formData.offerDescription.trim()) {
      newErrors.offerDescription = 'Offer description is required';
    }

    // Validate at least one day is available
    const hasAvailableDay = Object.values(formData.openHours).some(day => day.available);
    if (!hasAvailableDay) {
      newErrors.openHours = 'At least one day must be available';
    }

    // Validate URLs if provided
    if (formData.xLink && !isValidUrl(formData.xLink)) {
      newErrors.xLink = 'Please enter a valid URL';
    }

    if (formData.linkedInLink && !isValidUrl(formData.linkedInLink)) {
      newErrors.linkedInLink = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure all required fields are present
      const submissionData = {
        ...formData,
        // Ensure backward compatibility by syncing sessionPrice with oneOnOnePrice
        sessionPrice: formData.oneOnOnePrice
      };
      
      console.log('Submitting data:', submissionData); // Debug log
      
      if (existingSubscription) {
        await updateSubscriber(submissionData);
      } else {
        await createSubscriber(submissionData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving subscription:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save subscription' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOpenHours = (day: keyof WeeklySchedule, field: keyof DaySchedule, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      openHours: {
        ...prev.openHours,
        [day]: {
          ...prev.openHours[day],
          [field]: value
        }
      }
    }));
  };

  const timeOptions: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {existingSubscription ? 'Update Your Service' : 'Become a Service Provider'}
        </h1>
        <p className="text-gray-600 mt-2">
          Share your expertise and connect with people who need your services
        </p>
      </div>

      {/* Profile Preview */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Your Profile Information</h3>
        <div className="flex items-center space-x-3">
          <img
            src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-800">
              {myProfile?.name || myProfile?.username || 'Your Name'}
            </p>
            <p className="text-sm text-gray-600">@{myProfile?.username || 'username'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.jobTitle ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Software Engineer, Doctor, Consultant"
          />
          {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>}
        </div>

        {/* Specialization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Specialization *
          </label>
          <input
            type="text"
            value={formData.specialization}
            onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.specialization ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., React Development, Cardiology, Business Strategy"
          />
          {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
        </div>

        {/* Pricing Section */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-800">Session Pricing</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1-on-1 Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1-on-1 Session Price (USD per hour) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.oneOnOnePrice}
                onChange={(e) => {
                  const price = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({ 
                    ...prev, 
                    oneOnOnePrice: price,
                    sessionPrice: price // Keep sessionPrice in sync for backward compatibility
                  }));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.oneOnOnePrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="50"
              />
              {errors.oneOnOnePrice && <p className="text-red-500 text-sm mt-1">{errors.oneOnOnePrice}</p>}
              <p className="text-xs text-gray-500 mt-1">Price for private 1-on-1 sessions</p>
            </div>

            {/* Group Session Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Session Price (USD per person per hour) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.groupSessionPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, groupSessionPrice: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                  errors.groupSessionPrice ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="30"
              />
              {errors.groupSessionPrice && <p className="text-red-500 text-sm mt-1">{errors.groupSessionPrice}</p>}
              <p className="text-xs text-gray-500 mt-1">Price per person for group events</p>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
            <p className="text-sm text-blue-700">
              <i className="fas fa-info-circle mr-1"></i>
              <strong>Pricing Tips:</strong> Group sessions typically cost less per person than 1-on-1 sessions. 
              Consider offering group sessions at 50-70% of your 1-on-1 rate to attract more participants.
            </p>
          </div>
        </div>

        {/* About User */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            About You *
          </label>
          <textarea
            value={formData.aboutUser}
            onChange={(e) => setFormData(prev => ({ ...prev, aboutUser: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.aboutUser ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Tell people about your background, experience, and expertise..."
          />
          {errors.aboutUser && <p className="text-red-500 text-sm mt-1">{errors.aboutUser}</p>}
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X/Twitter Link
            </label>
            <input
              type="url"
              value={formData.xLink}
              onChange={(e) => setFormData(prev => ({ ...prev, xLink: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.xLink ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://x.com/username"
            />
            {errors.xLink && <p className="text-red-500 text-sm mt-1">{errors.xLink}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LinkedIn Link
            </label>
            <input
              type="url"
              value={formData.linkedInLink}
              onChange={(e) => setFormData(prev => ({ ...prev, linkedInLink: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.linkedInLink ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="https://linkedin.com/in/username"
            />
            {errors.linkedInLink && <p className="text-red-500 text-sm mt-1">{errors.linkedInLink}</p>}
          </div>
        </div>

        {/* Offer Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What Can People Learn From You? *
          </label>
          <textarea
            value={formData.offerDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, offerDescription: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.offerDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe what value you can provide in a session. What skills, knowledge, or insights will people gain?"
          />
          {errors.offerDescription && <p className="text-red-500 text-sm mt-1">{errors.offerDescription}</p>}
        </div>

        {/* Open Hours */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Available Hours *
          </label>
          <div className="space-y-3">
            {Object.entries(formData.openHours).map(([day, schedule]) => (
              <div key={day} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-20">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={schedule.available}
                      onChange={(e) => updateOpenHours(day as keyof WeeklySchedule, 'available', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium capitalize">{day}</span>
                  </label>
                </div>
                
                {schedule.available && (
                  <>
                    <div>
                      <select
                        value={schedule.start}
                        onChange={(e) => updateOpenHours(day as keyof WeeklySchedule, 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-sm text-gray-500">to</span>
                    <div>
                      <select
                        value={schedule.end}
                        onChange={(e) => updateOpenHours(day as keyof WeeklySchedule, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          {errors.openHours && <p className="text-red-500 text-sm mt-1">{errors.openHours}</p>}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {existingSubscription ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              existingSubscription ? 'Update Service' : 'Become a Provider'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}