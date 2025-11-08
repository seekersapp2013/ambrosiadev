import { useState } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { LiveStreamRoom } from './LiveStreamRoom';

interface LiveStreamJoinProps {
    bookingId: Id<"bookings">;
    onBack: () => void;
}

// Helper component to display provider avatar
function ProviderAvatar({ booking }: { booking: any }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    booking.provider?.avatar ? { storageId: booking.provider.avatar } : "skip"
  );

  return (
    <img
      src={avatarUrl || '/default-avatar.svg'}
      alt={booking.provider?.name || 'Provider'}
      className="w-8 h-8 rounded-full object-cover"
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
    booking.client?.avatar ? { storageId: booking.client.avatar } : "skip"
  );

  return (
    <img
      src={avatarUrl || '/default-avatar.svg'}
      alt={booking.client?.name || 'Client'}
      className="w-8 h-8 rounded-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/default-avatar.svg';
      }}
    />
  );
}

export function LiveStreamJoin({ bookingId, onBack }: LiveStreamJoinProps) {
    const [isJoining, setIsJoining] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [streamData, setStreamData] = useState<{
        token: string;
        wsUrl: string;
        roomName: string;
    } | null>(null);

    const booking = useQuery(api.livekit.getBookingForStream, { bookingId });
    const createRoom = useMutation(api.livekit.createLiveStreamRoom);
    const generateToken = useAction(api.livekitActions.generateAccessToken);
    const testConnection = useAction(api.livekitActions.testLiveKitConnection);

    const handleJoinStream = async (isRetry = false) => {
        if (!booking || isJoining) return;

        setIsJoining(true);
        setConnectionError(null);

        if (!isRetry) {
            setRetryCount(0);
        }

        try {
            console.log('Starting join process for booking:', bookingId);
            console.log('Current booking data:', booking);

            // Add timeout for the entire join process
            const joinTimeout = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Join process timeout after 30 seconds')), 30000);
            });

            // Create room if it doesn't exist
            if (!booking.liveStreamRoomName) {
                console.log('Creating new room...');
                await createRoom({ bookingId });
                // Refetch booking data to get the room name
                // Note: In a real app, you might want to wait for the booking to update
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Determine user role - fallback to checking user IDs if isProvider is not set
            let isProvider = booking.isProvider;
            if (isProvider === undefined || isProvider === null) {
                // Fallback: try to determine from current user context
                // This is a temporary solution - ideally the backend should provide this
                console.warn('isProvider not set in booking data, using fallback logic');
                isProvider = false; // Default to client for safety
            }

            const participantName = isProvider
                ? (booking.provider?.name || 'Provider')
                : (booking.client?.name || 'Client');

            console.log('Generating token for:', {
                participantName,
                isProvider,
                bookingId,
                roomName: booking.liveStreamRoomName
            });

            const tokenData = await Promise.race([
                generateToken({
                    bookingId,
                    participantName
                }),
                joinTimeout
            ]);

            console.log('Token generated successfully:', {
                wsUrl: tokenData.wsUrl,
                roomName: tokenData.roomName,
                tokenLength: tokenData.token.length
            });

            setStreamData(tokenData);
            setIsJoining(false);
        } catch (error: any) {
            console.error('Failed to join stream:', error);

            // Provide more specific error messages
            let errorMessage = 'Failed to join stream';
            if (error?.message?.includes('Not authenticated')) {
                errorMessage = 'Please log in to join the stream';
            } else if (error?.message?.includes('Not authorized')) {
                errorMessage = 'You are not authorized to join this session';
            } else if (error?.message?.includes('not found')) {
                errorMessage = 'Session not found or has ended';
            } else if (error?.message?.includes('LiveKit configuration')) {
                errorMessage = 'LiveKit service is not properly configured. Please contact support.';
            } else if (error?.message?.includes('timeout')) {
                errorMessage = 'Connection timeout. Please check your internet connection and try again.';
            } else if (error?.message) {
                errorMessage = `Connection failed: ${error.message}`;
            }

            setConnectionError(errorMessage);
            setIsJoining(false);

            // Auto-retry up to 2 times for certain errors
            if (retryCount < 2 && (
                error?.message?.includes('timeout') ||
                error?.message?.includes('network') ||
                error?.message?.includes('ENOTFOUND')
            )) {
                console.log(`Auto-retrying connection (attempt ${retryCount + 1}/2)...`);
                setRetryCount(prev => prev + 1);
                setTimeout(() => handleJoinStream(true), 3000);
            }
        }
    };

    const handleLeaveStream = () => {
        setStreamData(null);
        setConnectionError(null);
        setIsJoining(false);
        setRetryCount(0);
        onBack();
    };

    const handleTestConnection = async () => {
        try {
            const result = await testConnection({});
            if (result.success) {
                alert('LiveKit connection test successful! ✅');
            } else {
                alert(`LiveKit connection test failed: ${result.error}`);
            }
        } catch (error: any) {
            alert(`Connection test error: ${error?.message || 'Unknown error'}`);
        }
    };

    if (!booking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    // Check if user authentication is working
    if (booking.currentUserId === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full mx-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Authentication Required</h2>
                        <p className="text-gray-600 mb-4">
                            Please log in to join the live session.
                        </p>
                        <button
                            onClick={onBack}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                        >
                            Back to Bookings
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If already in stream, show the room
    if (streamData) {
        // Determine if current user is provider or client
        const isProvider = booking.isProvider || false;
        const participantName = isProvider
            ? (booking.provider?.name || 'Provider')
            : (booking.client?.name || 'Client');

        return (
            <LiveStreamRoom
                bookingId={bookingId}
                token={streamData.token}
                wsUrl={streamData.wsUrl}
                roomName={streamData.roomName}
                participantName={participantName}
                isProvider={isProvider}
                onLeave={handleLeaveStream}
            />
        );
    }

    const isSessionTime = () => {
        // Check if time restriction is disabled for testing/debugging
        const disableTimeRestriction = import.meta.env.VITE_DISABLE_STREAM_TIME_RESTRICTION === 'true';
        
        if (disableTimeRestriction) {
            // Allow joining anytime when restriction is disabled
            return true;
        }

        const now = new Date();
        const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}`);
        const timeDiff = sessionDateTime.getTime() - now.getTime();
        const minutesDiff = timeDiff / (1000 * 60);

        // Allow joining 15 minutes before and up to session duration after
        return minutesDiff <= 15 && minutesDiff >= -(booking.duration || 60);
    };

    const getTimeUntilSession = () => {
        const now = new Date();
        const sessionDateTime = new Date(`${booking.sessionDate}T${booking.sessionTime}`);
        const timeDiff = sessionDateTime.getTime() - now.getTime();

        if (timeDiff <= 0) {
            return 'Session has started';
        }

        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m until session`;
        }
        return `${minutes}m until session`;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md w-full mx-4">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-video text-2xl text-blue-600"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Join Live Session
                        </h2>
                    </div>

                    {/* Session Details */}
                    <div className="space-y-4 mb-6">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Date</span>
                            <span className="font-medium">{booking.sessionDate}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Time</span>
                            <span className="font-medium">{booking.sessionTime}</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium">{booking.duration} minutes</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Type</span>
                            <span className="font-medium">
                                {booking.sessionType === 'ONE_ON_ONE' ? '1-on-1 Session' : 'Group Event'}
                            </span>
                        </div>

                        {/* Participants */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600 block mb-2">Participants</span>
                            <div className="space-y-2">
                                {booking.provider && (
                                    <div className="flex items-center space-x-2">
                                        <ProviderAvatar booking={booking} />
                                        <span className="text-sm">
                                            {booking.provider.name} (Provider)
                                        </span>
                                    </div>
                                )}
                                {booking.client && (
                                    <div className="flex items-center space-x-2">
                                        <ClientAvatar booking={booking} />
                                        <span className="text-sm">
                                            {booking.client.name} (Client)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stream Status */}
                    <div className="mb-6">
                        {booking.liveStreamStatus === 'LIVE' && (
                            <div className="flex items-center justify-center p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-red-700 font-medium">Session is Live</span>
                            </div>
                        )}

                        {booking.liveStreamStatus === 'ENDED' && (
                            <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <i className="fas fa-check-circle text-gray-500 mr-2"></i>
                                <span className="text-gray-700">Session has ended</span>
                            </div>
                        )}

                        {(!booking.liveStreamStatus || booking.liveStreamStatus === 'NOT_STARTED') && (
                            <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-blue-700">{getTimeUntilSession()}</span>
                            </div>
                        )}
                    </div>

                    {/* Connection Error */}
                    {connectionError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <i className="fas fa-exclamation-triangle text-red-500 mt-0.5 mr-3"></i>
                                <div className="flex-1">
                                    <h4 className="font-medium text-red-800 mb-1">Connection Failed</h4>
                                    <p className="text-red-700 text-sm">{connectionError}</p>
                                    {retryCount > 0 && (
                                        <p className="text-red-600 text-xs mt-1">
                                            Retry attempt {retryCount}/2
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        {isSessionTime() && booking.liveStreamStatus !== 'ENDED' && (
                            <>
                                <button
                                    onClick={() => handleJoinStream(false)}
                                    disabled={isJoining}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isJoining ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            {retryCount > 0 ? `Retrying (${retryCount}/2)...` : 'Joining...'}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-video mr-2"></i>
                                            {connectionError ? 'Try Again' : 'Join Live Session'}
                                        </>
                                    )}
                                </button>

                                {connectionError && !isJoining && (
                                    <>
                                        <button
                                            onClick={() => handleJoinStream(false)}
                                            className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 flex items-center justify-center"
                                        >
                                            <i className="fas fa-redo mr-2"></i>
                                            Retry Connection
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                setStreamData(null);
                                                setConnectionError(null);
                                                setIsJoining(false);
                                                setRetryCount(0);
                                            }}
                                            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 flex items-center justify-center text-sm"
                                        >
                                            <i className="fas fa-refresh mr-2"></i>
                                            Reset Connection
                                        </button>
                                    </>
                                )}
                            </>
                        )}

                        {!isSessionTime() && booking.liveStreamStatus !== 'ENDED' && (
                            <div className="text-center text-gray-500 text-sm">
                                You can join 15 minutes before the session starts
                            </div>
                        )}

                        {/* Debug indicator when time restriction is disabled */}
                        {import.meta.env.VITE_DISABLE_STREAM_TIME_RESTRICTION === 'true' && (
                            <div className="text-center text-orange-600 text-xs bg-orange-50 p-2 rounded border">
                                ⚠️ Time restriction disabled for testing
                            </div>
                        )}

                        <button
                            onClick={onBack}
                            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50"
                        >
                            Back to Bookings
                        </button>

                        {/* Debug: Test Connection Button */}
                        {connectionError && (
                            <button
                                onClick={handleTestConnection}
                                className="w-full border border-blue-300 text-blue-700 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 text-sm"
                            >
                                <i className="fas fa-network-wired mr-2"></i>
                                Test LiveKit Connection
                            </button>
                        )}
                    </div>

                    {/* Session Instructions */}
                    {booking.sessionDetails && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Session Instructions</h4>
                            <p className="text-yellow-700 text-sm">{booking.sessionDetails}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}