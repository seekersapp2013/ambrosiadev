import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { EventFormData } from '../types/booking';

interface EventCreationProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function EventCreation({ onBack, onSuccess }: EventCreationProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    sessionDate: '',
    sessionTime: '',
    duration: 60,
    maxParticipants: 5,
    pricePerPerson: 25,
    sessionDetails: '',
    tags: [],
    isPublic: true
  });

  // Get provider's subscription to use default group session price
  const mySubscription = useQuery(api.bookingSubscribers.getMySubscription);
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const createEvent = useMutation(api.events.createEvent);

  // Set default price when subscription loads
  useEffect(() => {
    if (mySubscription && formData.pricePerPerson === 25) {
      setFormData(prev => ({
        ...prev,
        pricePerPerson: (mySubscription as any).groupSessionPrice || mySubscription.sessionPrice || 25
      }));
    }
  }, [mySubscription, formData.pricePerPerson]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Event description is required';
    }

    if (!formData.sessionDate) {
      newErrors.sessionDate = 'Session date is required';
    } else {
      const selectedDate = new Date(formData.sessionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.sessionDate = 'Session date cannot be in the past';
      }
    }

    if (!formData.sessionTime) {
      newErrors.sessionTime = 'Session time is required';
    }

    if (formData.duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    }

    if (formData.maxParticipants < 2) {
      newErrors.maxParticipants = 'Events must allow at least 2 participants';
    }

    if (formData.pricePerPerson < 0) {
      newErrors.pricePerPerson = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        sessionDate: formData.sessionDate,
        sessionTime: formData.sessionTime,
        duration: formData.duration,
        maxParticipants: formData.maxParticipants,
        pricePerPerson: formData.pricePerPerson,
        sessionDetails: formData.sessionDetails || undefined,
        tags: formData.tags,
        isPublic: formData.isPublic
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Generate time options
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

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
        <h1 className="text-2xl font-bold text-gray-800">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Create a group session where multiple people can join
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., React Fundamentals Workshop"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        {/* Event Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe what participants will learn and what to expect..."
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date *
            </label>
            <input
              type="date"
              min={today}
              value={formData.sessionDate}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionDate: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.sessionDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.sessionDate && <p className="text-red-500 text-sm mt-1">{errors.sessionDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Time *
            </label>
            <select
              value={formData.sessionTime}
              onChange={(e) => setFormData(prev => ({ ...prev, sessionTime: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.sessionTime ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select time</option>
              {timeOptions.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
            {errors.sessionTime && <p className="text-red-500 text-sm mt-1">{errors.sessionTime}</p>}
          </div>
        </div>

        {/* Duration and Participants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              min="15"
              max="480"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.duration ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Participants *
            </label>
            <input
              type="number"
              min="2"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 5 }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.maxParticipants && <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>}
          </div>
        </div>

        {/* Price Per Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Per Person (USD) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.pricePerPerson}
            onChange={(e) => setFormData(prev => ({ ...prev, pricePerPerson: parseFloat(e.target.value) || 0 }))}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
              errors.pricePerPerson ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="25.00"
          />
          {errors.pricePerPerson && <p className="text-red-500 text-sm mt-1">{errors.pricePerPerson}</p>}
        </div>

        {/* Session Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Instructions
          </label>
          <textarea
            value={formData.sessionDetails}
            onChange={(e) => setFormData(prev => ({ ...prev, sessionDetails: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder="Meeting link, preparation notes, or other instructions for participants..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-accent/10 text-accent"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-accent/60 hover:text-accent"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Add a tag (e.g., React, Beginner, Workshop)"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Add
            </button>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
              className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <div>
              <span className="font-medium text-gray-800">Make this event public</span>
              <p className="text-sm text-gray-600">
                Public events can be discovered and booked by anyone
              </p>
            </div>
          </label>
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
                Creating Event...
              </span>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}