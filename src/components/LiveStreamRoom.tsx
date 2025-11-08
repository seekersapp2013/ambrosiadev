import { useState, useEffect, useRef } from 'react';
import { useMutation, useAction, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
    Room,
    RoomEvent,
    RemoteParticipant,
    LocalParticipant,
    Track,
    VideoPresets,
} from 'livekit-client';
import { ParticipantGrid } from './ParticipantGrid';
import { GridToggleButton } from './GridToggleButton';
import { LiveStreamEngagement } from './LiveStreamEngagement';
import { LiveStreamComments } from './LiveStreamComments';
import './LiveStreamRoom.css';

interface LiveStreamRoomProps {
    bookingId: Id<"bookings">;
    token: string;
    wsUrl: string;
    roomName: string;
    participantName: string;
    isProvider: boolean;
    onLeave: () => void;
    onNavigate?: (screen: string, data?: any) => void;
}



export function LiveStreamRoom({
    bookingId,
    token,
    wsUrl,
    roomName,
    participantName,
    isProvider,
    onLeave,
    onNavigate
}: LiveStreamRoomProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionAttempts, setConnectionAttempts] = useState(0);
    const maxConnectionAttempts = 3;





    // Grid view states
    const [showGridView, setShowGridView] = useState(false);
    const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideosRef = useRef<{ [key: string]: HTMLVideoElement }>({});


    const updateStreamStatus = useMutation(api.livekit.updateStreamStatus);
    const startRecording = useAction(api.livekitActions.startRecording);
    const stopRecording = useAction(api.livekitActions.stopRecording);

    // Get booking data for engagement component
    const bookingData = useQuery(api.bookings.getBookingById, { bookingId });

    // Create booking object for engagement component
    const bookingForEngagement = bookingData ? {
        _id: bookingData._id,
        title: `Live Stream Session`,
        provider: {
            id: bookingData.provider.id,
            name: bookingData.provider.name || participantName,
            username: bookingData.provider.username || participantName,
            avatar: bookingData.provider.avatar
        }
    } : {
        _id: bookingId,
        title: `Live Stream Session`,
        provider: {
            id: undefined,
            name: participantName,
            username: participantName,
            avatar: undefined
        }
    };

    useEffect(() => {
        console.log('LiveStreamRoom component mounted with props:', {
            bookingId,
            token: token ? 'present' : 'missing',
            wsUrl,
            roomName,
            participantName,
            isProvider
        });

        // Prevent multiple connection attempts
        if (room || isConnecting) {
            console.log('Room already exists or connection in progress, skipping connection');
            return;
        }

        const connectToRoom = async () => {
            try {
                setIsConnecting(true);
                console.log('Attempting to connect to LiveKit room...', { wsUrl, roomName });

                if (!wsUrl || !token || !roomName) {
                    throw new Error('Missing connection parameters');
                }

                const newRoom = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    videoCaptureDefaults: {
                        resolution: VideoPresets.h720.resolution,
                    },
                    reconnectPolicy: {
                        nextRetryDelayInMs: (context) => {
                            return Math.min(context.retryCount * 2000, 10000);
                        },
                    },
                });

                newRoom.on(RoomEvent.Connected, async () => {
                    console.log('Successfully connected to room');
                    setIsConnected(true);
                    setConnectionError(null);
                    setParticipants([newRoom.localParticipant, ...Array.from(newRoom.remoteParticipants.values())]);

                    try {
                        console.log('Requesting camera and microphone permissions...');

                        await newRoom.localParticipant.enableCameraAndMicrophone();
                        console.log('Camera and microphone enabled successfully');

                        setTimeout(() => {
                            const videoTrack = newRoom.localParticipant.videoTrackPublications.values().next().value?.track;
                            if (videoTrack && localVideoRef.current) {
                                videoTrack.attach(localVideoRef.current);
                                console.log('Local video attached successfully');
                            }
                        }, 1000);
                    } catch (mediaError: any) {
                        console.error('Failed to enable camera/microphone:', mediaError);
                        setIsCameraOn(false);
                        setIsMicOn(false);

                        if (mediaError?.name === 'NotAllowedError') {
                            console.log('Media permissions denied by user');
                        } else if (mediaError?.name === 'NotFoundError') {
                            console.log('No camera/microphone found');
                        }
                    }
                });

                newRoom.on(RoomEvent.Disconnected, (reason) => {
                    console.log('Disconnected from room:', reason);
                    setIsConnected(false);

                    // Only set room to null if it's an intentional disconnect
                    if (reason?.toString() !== 'CLIENT_INITIATED') {
                        setConnectionError(`Disconnected: ${reason?.toString() || 'Unknown reason'}`);
                    }
                });

                newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
                    console.log('Participant connected:', participant.identity);
                    setParticipants([newRoom.localParticipant, ...Array.from(newRoom.remoteParticipants.values())]);
                });

                newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
                    console.log('Participant disconnected:', participant.identity);
                    setParticipants([newRoom.localParticipant, ...Array.from(newRoom.remoteParticipants.values())]);
                });

                newRoom.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
                    console.log('Track subscribed:', track.kind, participant.identity);
                    if (track.kind === Track.Kind.Video) {
                        const videoElement = remoteVideosRef.current[participant.identity];
                        if (videoElement) {
                            track.attach(videoElement);
                            console.log('Remote video attached for:', participant.identity);
                        }
                    }
                });

                newRoom.on(RoomEvent.TrackUnsubscribed, (track, _publication, participant) => {
                    console.log('Track unsubscribed:', track.kind, participant.identity);
                    track.detach();
                });

                newRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
                    console.log('Connection quality changed:', quality, participant?.identity);
                });

                newRoom.on(RoomEvent.Reconnecting, () => {
                    console.log('Attempting to reconnect...');
                    setConnectionError('Connection lost, attempting to reconnect...');
                    setIsConnected(false);
                });

                newRoom.on(RoomEvent.Reconnected, () => {
                    console.log('Successfully reconnected');
                    setConnectionError(null);
                    setIsConnected(true);
                });

                console.log('Connecting with token...', { wsUrl: wsUrl.substring(0, 30) + '...' });

                const connectPromise = newRoom.connect(wsUrl, token);
                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error('Connection timeout after 20 seconds')), 20000);
                });

                await Promise.race([connectPromise, timeoutPromise]);
                setRoom(newRoom);
                setIsConnecting(false);
                console.log('Room connection established successfully');

            } catch (error: any) {
                console.error('Failed to connect to room:', error);
                setIsConnecting(false);

                let errorMessage = 'Failed to connect to live stream';

                if (error?.message?.includes('timeout')) {
                    errorMessage = 'Connection timeout. Please check your internet connection and try again.';
                } else if (error?.message?.includes('NetworkError') || error?.message?.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection and firewall settings.';
                } else if (error?.message?.includes('WebSocket') || error?.message?.includes('websocket')) {
                    errorMessage = 'WebSocket connection failed. Please check if the LiveKit server is accessible.';
                } else if (error?.message?.includes('token') || error?.message?.includes('unauthorized')) {
                    errorMessage = 'Invalid access token. Please try refreshing the page.';
                } else if (error?.message?.includes('room') || error?.message?.includes('not found')) {
                    errorMessage = 'Room not found or access denied.';
                } else if (error?.message?.includes('ENOTFOUND') || error?.message?.includes('DNS')) {
                    errorMessage = 'Cannot reach LiveKit server. Please check your internet connection.';
                } else if (error?.message?.includes('ECONNREFUSED')) {
                    errorMessage = 'Connection refused by LiveKit server. Please try again later.';
                } else if (error?.message) {
                    errorMessage = `Connection failed: ${error.message}`;
                }

                // Increment connection attempts
                const newAttempts = connectionAttempts + 1;
                setConnectionAttempts(newAttempts);

                // Auto-retry with exponential backoff for certain errors, but limit attempts
                if (newAttempts < maxConnectionAttempts && (
                    error?.message?.includes('timeout') ||
                    error?.message?.includes('network') ||
                    error?.message?.includes('WebSocket')
                )) {
                    const retryDelay = Math.min(1000 * Math.pow(2, newAttempts), 10000); // Max 10 seconds
                    console.log(`Auto-retrying connection in ${retryDelay}ms (attempt ${newAttempts}/${maxConnectionAttempts})...`);

                    setTimeout(() => {
                        if (!room && !isConnected) { // Only retry if still not connected
                            connectToRoom();
                        }
                    }, retryDelay);

                    setConnectionError(`${errorMessage} (Retrying in ${Math.ceil(retryDelay / 1000)}s...)`);
                } else {
                    setConnectionError(errorMessage);
                }
            }
        };

        connectToRoom();

        return () => {
            if (room) {
                console.log('Cleaning up room connection');
                (room as Room).disconnect();
            }
        };
    }, [token, wsUrl, roomName]); // Remove 'room' from dependencies to prevent infinite loop

    const handleStartRecording = async () => {
        if (!isProvider) return;

        try {
            await startRecording({ bookingId });
            setIsRecording(true);
        } catch (error) {
            console.error('Failed to start recording:', error);
        }
    };

    const handleStopRecording = async () => {
        if (!isProvider) return;

        try {
            await stopRecording({ bookingId });
            setIsRecording(false);
            alert('Recording stopped successfully! You can download it from the Recording Management section.');
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const toggleCamera = async () => {
        if (!room) return;

        try {
            if (isCameraOn) {
                await room.localParticipant.setCameraEnabled(false);
            } else {
                await room.localParticipant.setCameraEnabled(true);
            }
            setIsCameraOn(!isCameraOn);
        } catch (error) {
            console.error('Failed to toggle camera:', error);
        }
    };

    const toggleMicrophone = async () => {
        if (!room) return;

        try {
            if (isMicOn) {
                await room.localParticipant.setMicrophoneEnabled(false);
            } else {
                await room.localParticipant.setMicrophoneEnabled(true);
            }
            setIsMicOn(!isMicOn);
        } catch (error) {
            console.error('Failed to toggle microphone:', error);
        }
    };

    const toggleScreenShare = async () => {
        if (!room) return;

        try {
            if (isScreenSharing) {
                await room.localParticipant.setScreenShareEnabled(false);
                setIsScreenSharing(false);
            } else {
                await room.localParticipant.setScreenShareEnabled(true);
                setIsScreenSharing(true);
            }
        } catch (error) {
            console.error('Failed to toggle screen share:', error);
            alert('Screen sharing failed. Please check your browser permissions.');
        }
    };

    const handleLeaveRoom = async () => {
        try {
            if (room) {
                console.log('Disconnecting from room...');
                await (room as Room).disconnect();
                setRoom(null);
                setIsConnected(false);
            }

            if (isProvider) {
                console.log('Updating stream status to ENDED...');
                await updateStreamStatus({
                    bookingId,
                    status: "ENDED"
                });
            }

            console.log('Leaving room...');
            onLeave();
        } catch (error) {
            console.error('Error during room cleanup:', error);
            onLeave(); // Still leave even if cleanup fails
        }
    };





    const handleParticipantFocus = (participantIdentity: string) => {
        setFocusedParticipant(participantIdentity);
        setShowGridView(false);

        // Switch the main video to show the focused participant
        const participant = participants.find(p => p.identity === participantIdentity);
        if (participant && localVideoRef.current) {
            if (participant.identity === room?.localParticipant.identity) {
                // Focusing on local participant - show their own video
                const localStream = localVideoRef.current.srcObject as MediaStream;
                if (localStream) {
                    localVideoRef.current.srcObject = localStream;
                }
            } else {
                // Focusing on remote participant - attach their video track
                const videoTrack = participant.videoTrackPublications.values().next().value?.track;
                if (videoTrack) {
                    videoTrack.attach(localVideoRef.current);
                }
            }
            console.log('Focused on participant:', participantIdentity);
        }
    };

    const toggleGridView = () => {
        setShowGridView(!showGridView);
        // Reset focus when opening grid view
        if (!showGridView) {
            setFocusedParticipant(null);
        }
    };

    const returnToMainView = () => {
        setFocusedParticipant(null);
        setShowGridView(false);

        // Return to local participant's video
        if (room?.localParticipant && localVideoRef.current) {
            const localVideoTrack = room.localParticipant.videoTrackPublications.values().next().value?.track;
            if (localVideoTrack) {
                localVideoTrack.attach(localVideoRef.current);
            }
        }
    };

    console.log('LiveStreamRoom render state:', {
        isConnected,
        connectionError,
        participants: participants.length,
        room: !!room
    });

    if (!isConnected && !isConnecting) {
        if (connectionError) {
            console.log('Showing connection error:', connectionError);
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-900">
                    <div className="text-center max-w-md mx-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                        </div>
                        <h2 className="text-white text-xl font-bold mb-2">Connection Failed</h2>
                        <p className="text-gray-400 text-sm mb-6">{connectionError}</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    setConnectionError(null);
                                    setConnectionAttempts(0);
                                    setIsConnecting(false);
                                    setRoom(null);
                                    window.location.reload();
                                }}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={onLeave}
                                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Go Back
                            </button>
                        </div>
                        {connectionAttempts > 0 && (
                            <p className="text-gray-500 text-xs mt-2">
                                Connection attempts: {connectionAttempts}/{maxConnectionAttempts}
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        console.log('Showing loading state');
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center max-w-md mx-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg mb-2">
                        {isConnecting ? 'Connecting to live stream...' : 'Initializing connection...'}
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                        This may take a few moments. Please ensure your camera and microphone permissions are enabled.
                    </p>
                    <div className="space-y-2">
                        <button
                            onClick={onLeave}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Cancel and Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    console.log('Showing main live stream interface');

    return (
        <div className="min-h-screen bg-black flex relative overflow-hidden"
            style={{ minHeight: '100vh', backgroundColor: 'black' }}>

            {/* Main Video Area */}
            <div className="flex-1 relative">
                {/* Local Video */}
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                />

                {/* Camera Off Overlay */}
                {!isCameraOn && !focusedParticipant && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                        <div className="text-center">
                            <i className="fas fa-video-slash text-6xl text-gray-400 mb-4"></i>
                            <p className="text-gray-400 text-lg">Camera Off</p>
                        </div>
                    </div>
                )}

                {/* Focused Participant Indicator */}
                {focusedParticipant && focusedParticipant !== room?.localParticipant.identity && (
                    <div className="absolute top-4 left-4 z-20 bg-blue-500 text-white px-3 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <i className="fas fa-eye"></i>
                            <span className="text-sm font-medium">
                                Viewing: {participants.find(p => p.identity === focusedParticipant)?.name ||
                                    participants.find(p => p.identity === focusedParticipant)?.identity}
                            </span>
                            <button
                                onClick={returnToMainView}
                                className="ml-2 text-blue-200 hover:text-white"
                                title="Return to your view"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                )}

                {/* Top Header Overlay */}
                <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={onLeave}
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <i className="fas fa-arrow-left"></i>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full live-pulse"></div>
                                <span className="text-white font-semibold">LIVE</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2 bg-black/50 rounded-full px-3 py-1">
                                <i className="fas fa-eye text-white text-sm"></i>
                                <span className="text-white text-sm font-medium">
                                    {participants.length}
                                </span>
                            </div>

                            {/* Grid View Toggle */}
                            <GridToggleButton
                                showGridView={showGridView}
                                participantCount={participants.length}
                                onToggle={toggleGridView}
                                variant="header"
                                showForProvider={false}
                                isProvider={isProvider}
                            />
                        </div>
                    </div>
                </div>



                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <div className="flex items-center justify-center space-x-6">
                        {/* Camera Toggle */}
                        <button
                            onClick={toggleCamera}
                            className={`p-4 rounded-full ${isCameraOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                                } text-white transition-colors`}
                        >
                            <i className={`fas ${isCameraOn ? 'fa-video' : 'fa-video-slash'} text-lg`}></i>
                        </button>

                        {/* Microphone Toggle */}
                        <button
                            onClick={toggleMicrophone}
                            className={`p-4 rounded-full ${isMicOn ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500 hover:bg-red-600'
                                } text-white transition-colors`}
                        >
                            <i className={`fas ${isMicOn ? 'fa-microphone' : 'fa-microphone-slash'} text-lg`}></i>
                        </button>

                        {/* Screen Share Toggle */}
                        <button
                            onClick={toggleScreenShare}
                            className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white/20 hover:bg-white/30'
                                } text-white transition-colors`}
                        >
                            <i className={`fas ${isScreenSharing ? 'fa-stop-circle' : 'fa-desktop'} text-lg`}></i>
                        </button>

                        {/* Recording Controls (Provider Only) */}
                        {isProvider && (
                            <button
                                onClick={isRecording ? handleStopRecording : handleStartRecording}
                                className={`p-4 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-white/20 hover:bg-white/30'
                                    } text-white transition-colors`}
                            >
                                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-record-vinyl'} text-lg`}></i>
                            </button>
                        )}

                        {/* End Stream */}
                        <button
                            onClick={handleLeaveRoom}
                            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                        >
                            <i className="fas fa-phone-slash text-lg"></i>
                        </button>
                    </div>

                    {/* Recording Status */}
                    {isRecording && (
                        <div className="text-center mt-3">
                            <span className="text-red-400 text-sm flex items-center justify-center bg-black/50 rounded-full px-3 py-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                                Recording in progress...
                            </span>
                        </div>
                    )}
                </div>
            </div>









            {/* Live Stream Engagement */}
            {!showGridView && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
                    <LiveStreamEngagement
                        booking={bookingForEngagement}
                        onNavigate={onNavigate}
                        disabled={false}
                        isProvider={isProvider}
                    />
                </div>
            )}

            {/* Live Stream Comments - Bottom Left */}
            {!showGridView && (
                <div className="absolute bottom-20 left-4 z-30 w-80">
                    <LiveStreamComments
                        streamId={bookingId}
                        className="max-w-full"
                    />
                </div>
            )}

            {/* Participant Grid */}
            <ParticipantGrid
                showGridView={showGridView}
                participants={participants}
                room={room}
                participantName={participantName}
                focusedParticipant={focusedParticipant}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                localVideoRef={localVideoRef}
                remoteVideosRef={remoteVideosRef}
                onCloseGrid={() => setShowGridView(false)}
                onParticipantFocus={handleParticipantFocus}
                onReturnToMainView={returnToMainView}
            />



        </div>
    );
}

export default LiveStreamRoom;