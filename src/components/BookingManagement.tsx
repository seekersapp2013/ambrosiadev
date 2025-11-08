import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { LiveStreamJoin } from './LiveStreamJoin';

interface BookingManagementProps {
    onBack: () => void;
}

type ViewMode = 'my-bookings' | 'provider-bookings' | 'live-stream';
type StatusFilter = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// Helper component to display provider avatar
function ProviderAvatar({ booking }: { booking: any }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    'provider' in booking && booking.provider?.profile?.avatar ? { storageId: booking.provider.profile.avatar } : "skip"
  );

  return (
    <img
      src={avatarUrl || '/default-avatar.svg'}
      alt="Provider"
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-avatar.svg';
      }}
    />
  );
}

// Helper component to display client avatar
function ClientAvatar({ booking }: { booking: any }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    'client' in booking && booking.client?.profile?.avatar ? { storageId: booking.client.profile.avatar } : "skip"
  );

  return (
    <img
      src={avatarUrl || '/default-avatar.svg'}
      alt="Client"
      className="w-10 h-10 rounded-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-avatar.svg';
      }}
    />
  );
}

export function BookingManagement({ onBack }: BookingManagementProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('my-bookings');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [selectedBookingForStream, setSelectedBookingForStream] = useState<Id<"bookings"> | null>(null);

    // Check if user is a provider
    const mySubscription = useQuery(api.bookingSubscribers.getMySubscription);

    // Get bookings based on view mode
    const myBookings = useQuery(api.bookings.getMyBookings, {
        status: statusFilter === 'all' ? undefined : statusFilter
    });

    const providerBookings = useQuery(api.bookings.getProviderBookings, {
        status: statusFilter === 'all' ? undefined : statusFilter
    });

    // Mutations
    const updateBookingStatus = useMutation(api.bookings.updateBookingStatus);
    const cancelBooking = useMutation(api.bookings.cancelBooking);
    const startSession = useMutation(api.bookings.startSession);
    const stopSession = useMutation(api.bookings.stopSession);

    // Remove debug queries that don't exist

    const currentBookings = viewMode === 'my-bookings' ? myBookings : providerBookings;

    const handleStatusUpdate = async (bookingId: Id<"bookings">, status: string) => {
        try {
            await updateBookingStatus({ bookingId, status });
        } catch (error) {
            console.error('Error updating booking status:', error);
            alert('Failed to update booking status');
        }
    };

    const handleCancelBooking = async (bookingId: Id<"bookings">) => {
        if (!confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            await cancelBooking({ bookingId });
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Failed to cancel booking');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const canCancelBooking = (booking: any) => {
        if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
            return false;
        }

        // Check if booking is within cancellation policy
        const bookingDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}`);
        const now = new Date();
        const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursUntilBooking > 24; // Default 24-hour cancellation policy
    };

    const canJoinLiveStream = (booking: any) => {
        // Can join if session is live
        if (booking.liveStreamStatus === 'LIVE') return true;

        // Can't join if not confirmed or already ended
        if (booking.status !== 'CONFIRMED' || booking.liveStreamStatus === 'ENDED') return false;

        const now = new Date();
        const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}`);
        const timeDiff = sessionDateTime.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        // Allow joining 15 minutes before session start and up to session duration after
        return minutesDiff <= 15 && minutesDiff >= -(booking.duration || 60);
    };

    const handleJoinLiveStream = (bookingId: Id<"bookings">) => {
        setSelectedBookingForStream(bookingId);
        setViewMode('live-stream');
    };

    const handleStartSession = async (bookingId: Id<"bookings">) => {
        try {
            await startSession({ bookingId });
        } catch (error) {
            console.error('Error starting session:', error);
            alert('Failed to start session');
        }
    };

    const handleStopSession = async (bookingId: Id<"bookings">) => {
        if (!confirm('Are you sure you want to stop this session? This will mark it as completed.')) {
            return;
        }

        try {
            await stopSession({ bookingId });
        } catch (error) {
            console.error('Error stopping session:', error);
            alert('Failed to stop session');
        }
    };

    const handleBackFromStream = () => {
        setSelectedBookingForStream(null);
        setViewMode('my-bookings');
    };

    // Show live stream view if selected
    if (viewMode === 'live-stream' && selectedBookingForStream) {
        return (
            <LiveStreamJoin
                bookingId={selectedBookingForStream}
                onBack={handleBackFromStream}
            />
        );
    }

    if (!currentBookings) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-accent text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={onBack}
                                className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold">Booking Management</h1>
                                <p className="text-white/90 mt-1">Manage your bookings and sessions</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* View Mode Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('my-bookings')}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'my-bookings'
                                ? 'bg-white text-accent shadow-sm'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                        >
                            My Bookings
                        </button>

                        {mySubscription && (
                            <button
                                onClick={() => setViewMode('provider-bookings')}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${viewMode === 'provider-bookings'
                                    ? 'bg-white text-accent shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                                    }`}
                            >
                                Provider Bookings
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            {(['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] as StatusFilter[]).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === status
                                        ? 'bg-accent text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Debug Info - Removed non-existent functions */}

                    {/* Bookings List */}
                    {currentBookings.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-calendar-times text-2xl text-gray-400"></i>
                            </div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">No bookings found</h3>
                            <p className="text-gray-600">
                                {viewMode === 'my-bookings'
                                    ? "You haven't booked any sessions yet"
                                    : "You don't have any provider bookings yet"
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {currentBookings.map((booking) => (
                                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                {viewMode === 'my-bookings' ? (
                                                    // Show provider info for client bookings
                                                    <>
                                                        <ProviderAvatar booking={booking} />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {'provider' in booking ? (booking.provider?.profile?.name || booking.provider?.profile?.username || 'Provider') : 'Provider'}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">
                                                                {'provider' in booking ? booking.provider?.subscription?.jobTitle : 'Service Provider'}
                                                            </p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Show client info for provider bookings
                                                    <>
                                                        <ClientAvatar booking={booking} />
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800">
                                                                {'client' in booking ? (booking.client?.profile?.name || booking.client?.profile?.username || 'Client') : 'Client'}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">Session booking</p>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Date:</span>
                                                    <div className="font-medium">{formatDate(booking.sessionDate)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Time:</span>
                                                    <div className="font-medium">{formatTime(booking.sessionTime)}</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Duration:</span>
                                                    <div className="font-medium">{booking.duration} min</div>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Amount:</span>
                                                    <div className="font-medium">${booking.totalAmount}</div>
                                                </div>
                                            </div>

                                            {booking.sessionDetails && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                                    <h4 className="text-sm font-medium text-blue-800 mb-1">Session Details:</h4>
                                                    <p className="text-sm text-blue-700">{booking.sessionDetails}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end space-y-2">
                                            <div className="flex flex-col items-end space-y-1">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>

                                                {booking.liveStreamStatus && booking.liveStreamStatus !== 'NOT_STARTED' && (
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${booking.liveStreamStatus === 'LIVE'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {booking.liveStreamStatus === 'LIVE' && (
                                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                        )}
                                                        <span>{booking.liveStreamStatus === 'LIVE' ? 'LIVE' : 'ENDED'}</span>
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2">
                                                {/* Join Live Stream Button */}
                                                {canJoinLiveStream(booking) && (
                                                    <button
                                                        onClick={() => handleJoinLiveStream(booking._id)}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                                    >
                                                        <i className="fas fa-video"></i>
                                                        <span>Join Live Session</span>
                                                    </button>
                                                )}

                                                {/* Provider Session Controls */}
                                                {viewMode === 'provider-bookings' && booking.status === 'CONFIRMED' && (
                                                    <>
                                                        {booking.liveStreamStatus === 'NOT_STARTED' && (
                                                            <button
                                                                onClick={() => handleStartSession(booking._id)}
                                                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 flex items-center space-x-2"
                                                            >
                                                                <i className="fas fa-play"></i>
                                                                <span>Start Session</span>
                                                            </button>
                                                        )}

                                                        {booking.liveStreamStatus === 'LIVE' && (
                                                            <button
                                                                onClick={() => handleStopSession(booking._id)}
                                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 flex items-center space-x-2"
                                                            >
                                                                <i className="fas fa-stop"></i>
                                                                <span>Stop Session</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}

                                                <div className="flex space-x-2">
                                                    {/* Provider actions */}
                                                    {viewMode === 'provider-bookings' && booking.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(booking._id, 'CONFIRMED')}
                                                                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancelBooking(booking._id)}
                                                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Cancel button for both views */}
                                                    {canCancelBooking(booking) && (
                                                        <button
                                                            onClick={() => handleCancelBooking(booking._id)}
                                                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}

                                                    {/* Mark as completed for providers */}
                                                    {viewMode === 'provider-bookings' && booking.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(booking._id, 'COMPLETED')}
                                                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}