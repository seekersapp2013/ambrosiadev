import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { EventCreation } from './EventCreation';
import { ProviderSubscription } from './ProviderSubscription';

type DashboardView = 'overview' | 'bookings' | 'events' | 'create-event' | 'settings' | 'subscription';

interface ProviderDashboardProps {
  onBack?: () => void;
}

export function ProviderDashboard({ onBack }: ProviderDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  // Get provider data
  const mySubscription = useQuery(api.bookingSubscribers.getMySubscription);
  const myBookings = useQuery(api.bookings.getProviderBookings, {});
  const myEvents = useQuery(api.events.getProviderEvents, {});

  // Check if user is a provider
  if (mySubscription === null) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <i className="fas fa-user-tie text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Become a Service Provider</h2>
          <p className="text-gray-600 mb-6">
            Share your expertise and start earning by offering 1-on-1 sessions and group events.
          </p>
          <button
            onClick={() => setCurrentView('subscription')}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'subscription') {
    return (
      <ProviderSubscription
        onBack={() => setCurrentView('overview')}
        onSuccess={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'create-event') {
    return (
      <EventCreation
        onBack={() => setCurrentView('events')}
        onSuccess={() => setCurrentView('events')}
      />
    );
  }

  const pendingBookings = myBookings?.filter(b => b.status === 'PENDING') || [];
  const confirmedBookings = myBookings?.filter(b => b.status === 'CONFIRMED') || [];
  const activeEvents = myEvents?.filter(e => e.status === 'ACTIVE') || [];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-8 lg:mb-12">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
        )}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Provider Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">Manage your sessions and events</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              mySubscription?.isActive 
                ? 'bg-green-100 text-green-800 ring-1 ring-green-200' 
                : 'bg-red-100 text-red-800 ring-1 ring-red-200'
            }`}>
              <i className={`mr-2 ${mySubscription?.isActive ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'}`}></i>
              {mySubscription?.isActive ? 'Active Provider' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 lg:mb-12 bg-gray-100 p-2 rounded-xl shadow-sm">
        {[
          { id: 'overview', label: 'Overview', icon: 'fas fa-chart-line', shortLabel: 'Overview' },
          { id: 'bookings', label: '1-on-1 Sessions', icon: 'fas fa-calendar-check', shortLabel: '1-on-1' },
          { id: 'events', label: 'Group Events', icon: 'fas fa-users', shortLabel: 'Events' },
          { id: 'settings', label: 'Settings', icon: 'fas fa-cog', shortLabel: 'Settings' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id as DashboardView)}
            className={`flex items-center px-4 lg:px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === tab.id
                ? 'bg-white text-accent shadow-md transform scale-105'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {currentView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-4 bg-blue-100 rounded-xl">
                  <i className="fas fa-clock text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                  <p className="text-3xl font-bold text-gray-800">{pendingBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-4 bg-green-100 rounded-xl">
                  <i className="fas fa-check-circle text-green-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Confirmed Sessions</p>
                  <p className="text-3xl font-bold text-gray-800">{confirmedBookings.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-4 bg-purple-100 rounded-xl">
                  <i className="fas fa-users text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">Active Events</p>
                  <p className="text-3xl font-bold text-gray-800">{activeEvents.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 lg:p-8 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="p-4 bg-yellow-100 rounded-xl">
                  <i className="fas fa-dollar-sign text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">1-on-1 Rate</p>
                  <p className="text-3xl font-bold text-gray-800">
                    ${(mySubscription as any)?.oneOnOnePrice || mySubscription?.sessionPrice || 0}/hr
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setCurrentView('create-event')}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <i className="fas fa-plus-circle text-accent mr-3"></i>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Create Group Event</p>
                  <p className="text-sm text-gray-600">Host multiple participants</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('settings')}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <i className="fas fa-cog text-accent mr-3"></i>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Update Settings</p>
                  <p className="text-sm text-gray-600">Manage availability & pricing</p>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('subscription')}
                className="flex items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-accent hover:bg-accent/5 transition-colors"
              >
                <i className="fas fa-edit text-accent mr-3"></i>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Edit Profile</p>
                  <p className="text-sm text-gray-600">Update your service details</p>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Recent 1-on-1 Bookings</h3>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {myBookings?.slice(0, 3).map((booking) => (
                  <div key={booking._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 mr-3">
                        <RecentBookingAvatar booking={booking} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {booking.client?.profile?.name || booking.client?.profile?.username || 'Client'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.sessionDate} at {booking.sessionTime}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No recent bookings</p>
                )}
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Active Group Events</h3>
                <button
                  onClick={() => setCurrentView('events')}
                  className="text-accent hover:text-accent/80 text-sm"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {activeEvents.slice(0, 3).map((event) => (
                  <div key={event._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-800">{event.title}</p>
                      <span className="text-sm text-gray-600">
                        {event.currentParticipants}/{event.maxParticipants}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {event.sessionDate} at {event.sessionTime}
                    </p>
                    <p className="text-sm text-accent font-medium">
                      ${event.pricePerPerson}/person
                    </p>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No active events</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === 'bookings' && (
        <BookingsView bookings={myBookings || []} />
      )}

      {currentView === 'events' && (
        <EventsView 
          events={myEvents || []} 
          onCreateEvent={() => setCurrentView('create-event')}
        />
      )}

      {currentView === 'settings' && (
        <SettingsView onEditProfile={() => setCurrentView('subscription')} />
      )}
    </div>
  );
}

// Helper component to display client avatar
function ClientAvatar({ booking }: { booking: any }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    booking.client?.profile?.avatar ? { storageId: booking.client.profile.avatar } : "skip"
  );

  return (
    <img
      className="h-10 w-10 rounded-full object-cover"
      src={avatarUrl || '/default-avatar.svg'}
      alt={booking.client?.profile?.name || booking.client?.profile?.username || 'Client'}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-avatar.svg';
      }}
    />
  );
}

// Helper component for recent bookings avatar
function RecentBookingAvatar({ booking }: { booking: any }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    booking.client?.profile?.avatar ? { storageId: booking.client.profile.avatar } : "skip"
  );

  return (
    <img
      className="h-8 w-8 rounded-full object-cover"
      src={avatarUrl || '/default-avatar.svg'}
      alt={booking.client?.profile?.name || booking.client?.profile?.username || 'Client'}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-avatar.svg';
      }}
    />
  );
}

// Bookings View Component
function BookingsView({ bookings }: { bookings: any[] }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBookings = bookings.filter(booking => 
    statusFilter === 'all' || booking.status.toLowerCase() === statusFilter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">1-on-1 Sessions</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <ClientAvatar booking={booking} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.client?.profile?.name || booking.client?.profile?.username || 'Client'}
                        </div>
                        {booking.client?.profile?.name && booking.client?.profile?.username && (
                          <div className="text-sm text-gray-500">
                            @{booking.client?.profile?.username}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.sessionDate}</div>
                    <div className="text-sm text-gray-500">{booking.sessionTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${booking.totalAmount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                      booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {booking.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button className="text-green-600 hover:text-green-900">
                          Approve
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Decline
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-calendar-times text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Events View Component
function EventsView({ events, onCreateEvent }: { events: any[], onCreateEvent: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Group Events</h2>
        <button
          onClick={onCreateEvent}
          className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent/90"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white p-6 rounded-lg border">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                event.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                event.status === 'FULL' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {event.status}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <i className="fas fa-calendar mr-2"></i>
                {event.sessionDate} at {event.sessionTime}
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-clock mr-2"></i>
                {event.duration} minutes
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-users mr-2"></i>
                {event.currentParticipants}/{event.maxParticipants} participants
              </div>
              <div className="flex items-center text-accent font-medium">
                <i className="fas fa-dollar-sign mr-2"></i>
                ${event.pricePerPerson}/person
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <button className="text-accent hover:text-accent/80 text-sm">
                Edit
              </button>
              <button className="text-red-600 hover:text-red-800 text-sm">
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <i className="fas fa-users text-4xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No events created yet</p>
          <button
            onClick={onCreateEvent}
            className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent/90"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
}

// Settings View Component
function SettingsView({ onEditProfile }: { onEditProfile: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h3>
          <p className="text-gray-600 mb-4">Update your service information, pricing, and availability.</p>
          <button
            onClick={onEditProfile}
            className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-accent/90"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Settings</h3>
          <p className="text-gray-600 mb-4">Configure how bookings are handled and confirmed.</p>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}