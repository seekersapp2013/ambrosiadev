import { useState, useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import {
    Room,
    RoomEvent,
    RemoteParticipant,
    LocalParticipant,
    VideoPresets,
} from 'livekit-client';

interface LiveStreamRoomProps {
    bookingId: Id<"bookings">;
    token: string;
    wsUrl: string;
    roomName: string;
    participantName: string;
    isProvider: boolean;
    onLeave: () => void;
}

export function LiveStreamRoom({
    bookingId,
    token,
    wsUrl,
    roomName,
    participantName,
    isProvider,
    onLeave
}: LiveStreamRoomProps) {
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
    
    const localVideoRef = useRef<HTMLVideoElement>(null);

    const updateStreamStatus = useMutation(api.livekit.updateStreamStatus);

    console.log('LiveStreamRoom props:', { bookingId, token: !!token, wsUrl, roomName, participantName, isProvider });

    useEffect(() => {
        const connectToRoom = async () => {
            try {
                console.log('Connecting to room...');
                
                if (!wsUrl || !token || !roomName) {
                    throw new Error('Missing connection parameters');
                }

                const newRoom = new Room({
                    adaptiveStream: true,
                    dynacast: true,
                    videoCaptureDefaults: {
                        resolution: VideoPresets.h720.resolution,
                    },
                });

                newRoom.on(RoomEvent.Connected, async () => {
                    console.log('Connected to room');
                    setIsConnected(true);
                    setConnectionError(null);
                    setParticipants([newRoom.localParticipant, ...Array.from(newRoom.remoteParticipants.values())]);

                    try {
                        await newRoom.localParticipant.enableCameraAndMicrophone();
                        setTimeout(() => {
                            const videoTrack = newRoom.localParticipant.videoTrackPublications.values().next().value?.track;
                            if (videoTrack && localVideoRef.current) {
                                videoTrack.attach(localVideoRef.current);
                            }
                        }, 1000);
                    } catch (mediaError) {
                        console.error('Media error:', mediaError);
                    }
                });

                newRoom.on(RoomEvent.Disconnected, () => {
                    setIsConnected(false);
                    setRoom(null);
                });

                await newRoom.connect(wsUrl, token);
                setRoom(newRoom);

            } catch (error: any) {
                console.error('Connection error:', error);
                setConnectionError(error.message || 'Failed to connect');
            }
        };

        connectToRoom();

        return () => {
            if (room) {
                room.disconnect();
            }
        };
    }, [token, wsUrl, roomName]);

    const handleLeave = async () => {
        if (room) {
            await room.disconnect();
        }
        if (isProvider) {
            await updateStreamStatus({ bookingId, status: "ENDED" });
        }
        onLeave();
    };

    if (!isConnected) {
        if (connectionError) {
            return (
                <div style={{ 
                    minHeight: '100vh', 
                    backgroundColor: '#1f2937', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                    <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
                        <h2>Connection Failed</h2>
                        <p>{connectionError}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            style={{ 
                                backgroundColor: '#3b82f6', 
                                color: 'white', 
                                padding: '10px 20px', 
                                border: 'none', 
                                borderRadius: '5px',
                                margin: '10px'
                            }}
                        >
                            Try Again
                        </button>
                        <button 
                            onClick={onLeave}
                            style={{ 
                                backgroundColor: '#6b7280', 
                                color: 'white', 
                                padding: '10px 20px', 
                                border: 'none', 
                                borderRadius: '5px',
                                margin: '10px'
                            }}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div style={{ 
                minHeight: '100vh', 
                backgroundColor: '#1f2937', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '4px solid #374151', 
                        borderTop: '4px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 20px'
                    }}></div>
                    <p>Connecting to live stream...</p>
                    <button 
                        onClick={onLeave}
                        style={{ 
                            backgroundColor: '#ef4444', 
                            color: 'white', 
                            padding: '10px 20px', 
                            border: 'none', 
                            borderRadius: '5px',
                            marginTop: '20px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'black', position: 'relative' }}>
            {/* Debug indicator */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                backgroundColor: 'green',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                zIndex: 1000
            }}>
                LiveStream Connected - {participants.length} participants
            </div>

            {/* Header */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                padding: '20px',
                zIndex: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                            onClick={handleLeave}
                            style={{
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                cursor: 'pointer'
                            }}
                        >
                            ←
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                backgroundColor: '#ef4444',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite'
                            }}></div>
                            <span style={{ color: 'white', fontWeight: 'bold' }}>LIVE</span>
                        </div>
                    </div>
                    <div style={{
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '14px'
                    }}>
                        👁 {participants.length}
                    </div>
                </div>
            </div>

            {/* Main Video */}
            <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                    width: '100%',
                    height: '100vh',
                    objectFit: 'cover'
                }}
            />

            {/* Simple Controls */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                zIndex: 20
            }}>
                <button
                    onClick={handleLeave}
                    style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}
                >
                    📞
                </button>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}