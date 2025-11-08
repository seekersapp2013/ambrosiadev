import React, { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface BookingCalendarProps {
  providerId: Id<"users">;
  onTimeSelect: (date: string, time: string) => void;
  onBack?: () => void;
  selectedDate?: string;
  selectedTime?: string;
}

export function BookingCalendar({ providerId, onTimeSelect, onBack, selectedDate, selectedTime }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDateState, setSelectedDateState] = useState<string | null>(selectedDate || null);

  // Calculate date range for the current month
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  // Get provider availability for the current month
  const availabilityData = useQuery(api.bookings.getProviderAvailability, {
    providerId,
    startDate,
    endDate
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      
      // Find availability data for this date
      const dayAvailability = availabilityData?.availability?.find(a => a.date === dateString);
      
      days.push({
        date: day,
        dateString,
        isToday: dateString === today,
        isPast: dateString < today,
        isAvailable: dayAvailability?.available || false,
        availability: dayAvailability
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDateClick = (dateString: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    setSelectedDateState(dateString);
  };

  const handleTimeClick = (time: string) => {
    if (selectedDateState) {
      onTimeSelect(selectedDateState, time);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
    setSelectedDateState(null);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get selected date availability for time slots
  const selectedDateAvailability = selectedDateState 
    ? availabilityData?.availability?.find(a => a.date === selectedDateState)
    : null;

  if (!availabilityData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!availabilityData.available) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Provider Unavailable</h3>
        <p className="text-gray-600">{availabilityData.reason || 'This provider is not currently available for bookings.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Provider Details
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-accent text-white p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <h2 className="text-xl font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Calendar Grid */}
          <div className="p-4">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Select a Date</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                  <span className="text-gray-600">Unavailable</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Selected</span>
                </div>
              </div>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div key={index} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => handleDateClick(day.dateString, day.isAvailable && !day.isPast)}
                      disabled={day.isPast || !day.isAvailable}
                      className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                        day.isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : day.isAvailable
                          ? selectedDateState === day.dateString
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      } ${day.isToday ? 'ring-2 ring-accent' : ''}`}
                    >
                      {day.date}
                    </button>
                  ) : (
                    <div></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="p-4 border-l border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">
              {selectedDateState ? (
                <>Select a Time - {new Date(selectedDateState).toLocaleDateString()}</>
              ) : (
                'Select a date to see available times'
              )}
            </h3>

            {selectedDateState && selectedDateAvailability ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDateAvailability.timeSlots.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No time slots available for this day</p>
                ) : (
                  selectedDateAvailability.timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleTimeClick(slot.time)}
                      disabled={!slot.available}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        slot.available
                          ? selectedTime === slot.time
                            ? 'bg-accent text-white'
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{slot.time}</span>
                        <span className="text-sm">
                          {slot.available ? (
                            <span className="text-green-600">Available</span>
                          ) : (
                            <span className="text-red-600">Booked</span>
                          )}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        60 minutes • ${availabilityData.provider.sessionPrice}
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clock text-2xl text-gray-400"></i>
                </div>
                <p className="text-gray-500">Select a date to view available time slots</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <i className="fas fa-info-circle mr-2"></i>
              All times are shown in your local timezone
            </div>
            {selectedDateState && selectedTime && (
              <div className="text-accent font-medium">
                Selected: {new Date(selectedDateState).toLocaleDateString()} at {selectedTime}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}