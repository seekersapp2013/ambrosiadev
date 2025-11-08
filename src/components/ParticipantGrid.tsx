
import { Room, RemoteParticipant, LocalParticipant } from 'livekit-client';

interface ParticipantGridProps {
    showGridView: boolean;
    participants: (RemoteParticipant | LocalParticipant)[];
    room: Room | null;
    participantName: string;
    focusedParticipant: string | null;
    isCameraOn: boolean;
    isMicOn: boolean;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
    remoteVideosRef: React.MutableRefObject<{ [key: string]: HTMLVideoElement }>;
    onCloseGrid: () => void;
    onParticipantFocus: (participantIdentity: string) => void;
    onReturnToMainView: () => void;
}

export function ParticipantGrid({
    showGridView,
    participants,
    room,
    participantName,
    focusedParticipant,
    isCameraOn,
    isMicOn,
    localVideoRef,
    remoteVideosRef,
    onCloseGrid,
    onParticipantFocus,
    onReturnToMainView
}: ParticipantGridProps) {
    if (!showGridView) return null;

    return (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col grid-modal-enter">
            {/* Grid Header */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <h3 className="text-white font-semibold">All Participants ({participants.length})</h3>
                        {focusedParticipant && (
                            <button
                                onClick={onReturnToMainView}
                                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors grid-header-button"
                            >
                                <i className="fas fa-user-circle mr-1"></i>
                                Return to Your View
                            </button>
                        )}
                    </div>
                    <button
                        onClick={onCloseGrid}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {participants.map((participant) => (
                        <div
                            key={participant.identity}
                            className={`relative bg-gray-800 rounded-lg overflow-hidden aspect-video cursor-pointer transition-all hover:scale-105 ${
                                focusedParticipant === participant.identity
                                    ? 'ring-4 ring-blue-500 scale-105'
                                    : 'hover:ring-2 hover:ring-white/30'
                            }`}
                            onClick={() => onParticipantFocus(participant.identity)}
                        >
                            {participant.identity === room?.localParticipant.identity ? (
                                // Local participant - show their own video
                                <video
                                    ref={(el) => {
                                        if (el && localVideoRef.current) {
                                            // Clone the video stream for grid view
                                            const stream = localVideoRef.current.srcObject as MediaStream;
                                            if (stream) {
                                                el.srcObject = stream;
                                            }
                                        }
                                    }}
                                    autoPlay
                                    muted
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                // Remote participant
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            remoteVideosRef.current[participant.identity] = el;
                                            // Attach existing track if available
                                            const videoTrack = participant.videoTrackPublications.values().next().value?.track;
                                            if (videoTrack) {
                                                videoTrack.attach(el);
                                            }
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Camera Off Overlay for Grid */}
                            {((participant.identity === room?.localParticipant.identity && !isCameraOn) ||
                              (participant.identity !== room?.localParticipant.identity && !participant.isCameraEnabled)) && (
                                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                                    <div className="text-center">
                                        <i className="fas fa-video-slash text-3xl text-gray-400 mb-2"></i>
                                        <p className="text-gray-400 text-xs">Camera Off</p>
                                    </div>
                                </div>
                            )}

                            {/* Participant Info */}
                            <div className="absolute bottom-2 left-2 right-2">
                                <div className="bg-black/80 text-white px-2 py-1 rounded text-sm truncate">
                                    {participant.identity === room?.localParticipant.identity
                                        ? `You (${participantName})`
                                        : (participant.name || participant.identity)
                                    }
                                </div>
                            </div>

                            {/* Speaking Indicator */}
                            {participant.isSpeaking && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
                                        <i className="fas fa-microphone text-white text-xs"></i>
                                    </div>
                                </div>
                            )}

                            {/* Camera/Mic Status Icons */}
                            <div className="absolute top-2 left-2 flex space-x-1">
                                {((participant.identity === room?.localParticipant.identity && !isCameraOn) ||
                                  (participant.identity !== room?.localParticipant.identity && !participant.isCameraEnabled)) && (
                                    <div className="bg-red-500 rounded-full p-1">
                                        <i className="fas fa-video-slash text-white text-xs"></i>
                                    </div>
                                )}
                                {((participant.identity === room?.localParticipant.identity && !isMicOn) ||
                                  (participant.identity !== room?.localParticipant.identity && !participant.isMicrophoneEnabled)) && (
                                    <div className="bg-red-500 rounded-full p-1">
                                        <i className="fas fa-microphone-slash text-white text-xs"></i>
                                    </div>
                                )}
                            </div>

                            {/* Focus Indicator */}
                            {focusedParticipant === participant.identity && (
                                <div className="absolute inset-0 bg-blue-500/20 rounded-lg pointer-events-none">
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                        <i className="fas fa-eye mr-1"></i>
                                        Main View
                                    </div>
                                </div>
                            )}

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors rounded-lg pointer-events-none"></div>
                        </div>
                    ))}
                </div>

                {/* Grid Instructions */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-gray-300 text-sm font-medium">
                        Click on any participant to bring them to the main screen
                    </p>
                    <p className="text-gray-500 text-xs">
                        Use "Return to Your View" to switch back to your own camera
                    </p>
                </div>
            </div>
        </div>
    );
}