import { useState } from 'react';
import { ProviderDashboard } from './ProviderDashboard';
import { BookingBrowser } from './BookingBrowser';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type BookingView = 'browse' | 'provider-dashboard' | 'my-bookings';

export function BookingSystem() {
  const [currentView, setCurrentView] = useState<BookingView>('browse');

  const renderNavigation = () => (
    <div className="bg-white border-b shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Ambrosia Booking</h1>
            <nav className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-0">
              <button
                onClick={() => setCurrentView('browse')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'browse'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-search mr-2"></i>
                Browse Sessions
              </button>
              <button
                onClick={() => setCurrentView('my-bookings')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'my-bookings'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-calendar-check mr-2"></i>
                My Bookings
              </button>
              <button
                onClick={() => setCurrentView('provider-dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentView === 'provider-dashboard'
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <i className="fas fa-user-tie mr-2"></i>
                Provider Dashboard
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 booking-container">
      {renderNavigation()}
      
      <div className="w-full">
        {currentView === 'browse' && <BookingBrowser />}
        {currentView === 'my-bookings' && <MyBookings />}
        {currentView === 'provider-dashboard' && <ProviderDashboard />}
      </div>
    </div>
  );
}

// My Bookings Component
function MyBookings() {
  const myBookings = useQuery(api.bookings.getMyBookings);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">My Bookings</h1>
        <p className="text-lg text-gray-600">View and manage your upcoming sessions and events</p>
      </div>

      {myBookings === undefined ? (
        <div className="text-center py-12">
          <i className="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">Loading your bookings...</p>
        </div>
      ) : myBookings.length === 0 ? (
        <div className="text-center py-16">
          <i className="fas fa-calendar-times text-6xl text-gray-300 mb-6"></i>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">Start by browsing available sessions and events</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Browse Sessions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myBookings.map((booking) => (
            <div key={booking._id} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {booking.sessionType === 'ONE_ON_ONE' ? '1-on-1 Session' : 'Group Event'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    with {booking.provider?.profile?.name || booking.provider?.profile?.username || 'Expert'}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-calendar mr-3 w-4"></i>
                  <span className="text-sm">{booking.sessionDate} at {booking.sessionTime}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-clock mr-3 w-4"></i>
                  <span className="text-sm">{booking.duration} minutes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-dollar-sign mr-3 w-4"></i>
                  <span className="text-sm font-medium">${booking.totalAmount}</span>
                </div>
              </div>

              {booking.sessionDetails && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    {booking.sessionDetails}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                {booking.status === 'CONFIRMED' && (
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                    <i className="fas fa-video mr-2"></i>
                    Join Session
                  </button>
                )}
                {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors">
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}