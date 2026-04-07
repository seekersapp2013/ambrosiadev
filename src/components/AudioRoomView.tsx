import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
    Room,
    RoomEvent,
    RemoteParticipant,
    LocalParticipant,
    Track,
    AudioPresets,
} from 'livekit-client';
import { AudioParticipantCard } from './AudioParticipantCard';
import { HandRaisePanel } from './HandRaisePanel';
import { AudioRoomControls } from './AudioRoomControls';

interface AudioRoomViewProps {
    eventId: Id<"events">;
    bookingId: Id<"bookings">;
    token: string;
    wsUrl: string;
    roomName: string;
    participantName: string;
    userRole: "HOST" | "SPEAKER" | "LISTENER";
    onLeave: () => void;
}

export function AudioRoomView({
    eventId,
    bookingId,
    token,
    wsUrl,
    roomName,
    participantName,
    userRole,
    onLeave
}: AudioRoomViewProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const roomRef = useRef<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
    const [isMuted, setIsMuted] = useState(userRole === "LISTENER");
    const [handRaised, setHandRaised] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [audioLevels, setAudioLevels] = useState<Map<string, number>>(new Map());

    // Get audio room state
    const audioRoomState = useQuery(api.events.getAudioRoomState, { eventId });
    const handRaisedUsers = useQuery(api.events.getHandRaisedUsers, { eventId });

    // Mutations
    const raiseHand = useMutation(api.events.raiseHand);
    const lowerHand = useMutation(api.events.lowerHand);
    const promoteToSpeaker = useMutation(api.events.promoteToSpeaker);
    const demoteToListener = useMutation(api.events.demoteToListener);
    const updateMutedStatus = useMutation(api.events.updateMutedStatus);
    const updateSpeakingStatus = useMutation(api.events.updateSpeakingStatus);
    const initializeParticipant = useMutation(api.events.initializeAudioRoomParticipant);

    // Initialize participant on mount
    useEffect(() => {
        const init = async () => {
            try {
                await initializeParticipant({ eventId, bookingId });
            } catch (error) {
                console.error('Failed to initialize participant:', error);
            }
        };
        init();
    }, [eventId, bookingId]);

    // Connect to LiveKit room
    useEffect(() => {
        if (room || isConnecting) {
            return;
        }

        const connectToRoom = async () => {
            try {
                setIsConnecting(true);
                console.log('Connecting to audio room...', { wsUrl, roomName, userRole });

                const newRoom = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    audioCaptureDefaults: {
                        autoGainControl: true,
                        echoCancellation: true,
                        noiseSuppression: true,
                    },
                    publishDefaults: {
                        audioPreset: AudioPresets.music,
                        dtx: true,
                    },
                });

                newRoom.on(RoomEvent.Connected, async () => {
                    console.log('Connected to audio room');
                    setIsConnected(true);
                    setConnectionError(null);
                    setParticipants([newRoom.localParticipant, ...Array.from(newRoom.remoteParticipants.values())]);

                    // Enable microphone only for speakers and hosts
                    if (userRole === "SPEAKER" || userRole === "HOST") {
                        try {
                            await newRoom.localParticipant.setMicrophoneEnabled(true);
                            console.log('Microphone enabled');
                        } catch (error) {
                            console.error('Failed to enable microphone:', error);
                            setIsMuted(true);
                        }
                    }
                });

                newRoom.on(RoomEvent.Disconnected, (reason) => {
                    console.log('Disconnected from audio room:', reason);
                    setIsConnected(false);
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
                });

                newRoom.on(RoomEvent.AudioPlaybackStatusChanged, () => {
                    console.log('Audio playback status changed');
                });

                // Monitor audio levels for speaking indicators
                newRoom.on(RoomEvent.TrackPublished, (publication, participant) => {
                    if (publication.kind === Track.Kind.Audio) {
                        // Audio level monitoring would be handled by LiveKit's built-in events
                        // For now, we'll rely on the TrackSubscribed event
                        console.log('Audio track published:', participant.identity);
                    }
                });

                await newRoom.connect(wsUrl, token);
                setRoom(newRoom);
                roomRef.current = newRoom;
                setIsConnecting(false);
                console.log('Audio room connection established');

            } catch (error: any) {
                console.error('Failed to connect to audio room:', error);
                setIsConnecting(false);
                setConnectionError(error?.message || 'Failed to connect to audio room');
            }
        };

        connectToRoom();

        return () => {
            if (roomRef.current) {
                console.log('Cleaning up audio room connection');
                roomRef.current.disconnect();
                roomRef.current = null;
            }
        };
    }, [token, wsUrl, roomName, userRole]);

    const handleToggleMute = async () => {
        if (!room) return;

        try {
            const newMutedState = !isMuted;
            await room.localParticipant.setMicrophoneEnabled(!newMutedState);
            setIsMuted(newMutedState);
            await updateMutedStatus({ eventId, isMuted: newMutedState });
        } catch (error) {
            console.error('Failed to toggle mute:', error);
        }
    };

    const handleToggleHandRaise = async () => {
        try {
            if (handRaised) {
                await lowerHand({ bookingId });
                setHandRaised(false);
            } else {
                await raiseHand({ bookingId });
                setHandRaised(true);
            }
        } catch (error) {
            console.error('Failed to toggle hand raise:', error);
        }
    };

    const handlePromoteUser = async (targetUserId: Id<"users">) => {
        try {
            await promoteToSpeaker({ eventId, targetUserId });
        } catch (error) {
            console.error('Failed to promote user:', error);
            alert(error instanceof Error ? error.message : 'Failed to promote user');
        }
    };

    const handleDemoteUser = async (targetUserId: Id<"users">) => {
        try {
            await demoteToListener({ eventId, targetUserId });
        } catch (error) {
            console.error('Failed to demote user:', error);
            alert(error instanceof Error ? error.message : 'Failed to demote user');
        }
    };

    const handleLeaveRoom = async () => {
        try {
            if (room) {
                await room.disconnect();
                setRoom(null);
                setIsConnected(false);
            }
            onLeave();
        } catch (error) {
            console.error('Error leaving room:', error);
            onLeave();
        }
    };

    // Loading state
    if (!isConnected && !connectionError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
                <div className="text-center max-w-md mx-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white text-lg mb-2">
                        {isConnecting ? 'Connecting to audio room...' : 'Initializing...'}
                    </p>
                    <p className="text-purple-200 text-sm">
                        Please ensure your microphone permissions are enabled
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (connectionError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
                <div className="text-center max-w-md mx-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-2xl text-red-600"></i>
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">Connection Failed</h2>
                    <p className="text-purple-200 text-sm mb-6">{connectionError}</p>
                    <div className="space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                </div>
            </div>
        );
    }

    // Separate participants by role
    const speakers = audioRoomState?.speakers || [];
    const listeners = audioRoomState?.listeners || [];
    const host = audioRoomState?.host;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex flex-col">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleLeaveRoom}
                            className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                        >
                            <i className="fas fa-arrow-left"></i>
                        </button>
                        <div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                <span className="text-white font-semibold">LIVE AUDIO</span>
                            </div>
                            <p className="text-purple-200 text-sm mt-1">
                                {audioRoomState?.totalParticipants || 0} participants
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                            {userRole}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Main Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Stage - Speakers */}
                        <div>
                            <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                                <i className="fas fa-microphone mr-2"></i>
                                On Stage ({speakers.length + (host ? 1 : 0)})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {/* Host */}
                                {host && (
                                    <AudioParticipantCard
                                        participant={host}
                                        audioLevel={audioLevels.get(host.userId) || 0}
                                        isCurrentUser={host.userId === room?.localParticipant.identity}
                                        canDemote={false}
                                        onDemote={() => {}}
                                    />
                                )}
                                {/* Speakers */}
                                {speakers.map((speaker) => (
                                    <AudioParticipantCard
                                        key={speaker.userId}
                                        participant={speaker}
                                        audioLevel={audioLevels.get(speaker.userId) || 0}
                                        isCurrentUser={speaker.userId === room?.localParticipant.identity}
                                        canDemote={userRole === "HOST"}
                                        onDemote={() => handleDemoteUser(speaker.userId)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Audience - Listeners */}
                        {listeners.length > 0 && (
                            <div>
                                <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                                    <i className="fas fa-users mr-2"></i>
                                    Audience ({listeners.length})
                                </h3>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {listeners.map((listener) => (
                                        <AudioParticipantCard
                                            key={listener.userId}
                                            participant={listener}
                                            audioLevel={0}
                                            isCurrentUser={listener.userId === room?.localParticipant.identity}
                                            compact={true}
                                            canDemote={false}
                                            onDemote={() => {}}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hand Raise Panel (for hosts) */}
                {userRole === "HOST" && handRaisedUsers && handRaisedUsers.length > 0 && (
                    <HandRaisePanel
                        handRaisedUsers={handRaisedUsers}
                        onPromote={handlePromoteUser}
                    />
                )}
            </div>

            {/* Controls */}
            <AudioRoomControls
                userRole={userRole}
                isMuted={isMuted}
                handRaised={handRaised}
                onToggleMute={handleToggleMute}
                onToggleHandRaise={handleToggleHandRaise}
                onLeave={handleLeaveRoom}
            />
        </div>
    );
}
