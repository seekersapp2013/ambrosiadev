import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface AudioParticipantCardProps {
    participant: any;
    audioLevel: number;
    isCurrentUser: boolean;
    compact?: boolean;
    canDemote?: boolean;
    onDemote: () => void;
}

export function AudioParticipantCard({
    participant,
    audioLevel,
    isCurrentUser,
    compact = false,
    canDemote = false,
    onDemote
}: AudioParticipantCardProps) {
    // Get avatar URL if available
    const avatarUrl = useQuery(
        api.files.getFileUrl,
        participant.profile?.avatar ? { storageId: participant.profile.avatar } : "skip"
    );

    const isSpeaking = audioLevel > 0.01;
    const role = participant.role;

    // Get role color
    const getRoleColor = () => {
        switch (role) {
            case 'HOST':
                return 'bg-yellow-500';
            case 'SPEAKER':
                return 'bg-green-500';
            case 'LISTENER':
                return 'bg-gray-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Get role icon
    const getRoleIcon = () => {
        switch (role) {
            case 'HOST':
                return 'fa-crown';
            case 'SPEAKER':
                return 'fa-microphone';
            case 'LISTENER':
                return 'fa-headphones';
            default:
                return 'fa-user';
        }
    };

    if (compact) {
        // Compact view for listeners
        return (
            <div className="relative">
                <div className={`aspect-square rounded-lg bg-white/10 backdrop-blur-sm border-2 transition-all ${
                    isCurrentUser ? 'border-purple-400' : 'border-white/20'
                } ${participant.handRaised ? 'ring-2 ring-yellow-400' : ''}`}>
                    <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        {/* Avatar */}
                        <div className="relative mb-1">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={participant.profile?.name || 'User'}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                                    <span className="text-white text-lg font-bold">
                                        {(participant.profile?.name || participant.profile?.username || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                            
                            {/* Hand Raised Indicator */}
                            {participant.handRaised && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                    <i className="fas fa-hand-paper text-xs text-yellow-900"></i>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <p className="text-white text-xs text-center truncate w-full">
                            {isCurrentUser ? 'You' : (participant.profile?.name || participant.profile?.username || 'User')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Full view for speakers
    return (
        <div className="relative">
            <div className={`rounded-xl bg-white/10 backdrop-blur-sm border-2 transition-all ${
                isSpeaking ? 'border-green-400 shadow-lg shadow-green-400/50' : 
                isCurrentUser ? 'border-purple-400' : 'border-white/20'
            } ${participant.handRaised ? 'ring-2 ring-yellow-400' : ''}`}>
                <div className="p-4">
                    {/* Avatar and Speaking Indicator */}
                    <div className="relative mb-3 flex justify-center">
                        <div className={`relative ${isSpeaking ? 'animate-pulse' : ''}`}>
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={participant.profile?.name || 'User'}
                                    className="w-20 h-20 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
                                    <span className="text-white text-2xl font-bold">
                                        {(participant.profile?.name || participant.profile?.username || 'U')[0].toUpperCase()}
                                    </span>
                                </div>
                            )}
                            
                            {/* Speaking Ring */}
                            {isSpeaking && (
                                <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-ping"></div>
                            )}

                            {/* Role Badge */}
                            <div className={`absolute -bottom-1 -right-1 w-8 h-8 ${getRoleColor()} rounded-full flex items-center justify-center border-2 border-white`}>
                                <i className={`fas ${getRoleIcon()} text-white text-xs`}></i>
                            </div>

                            {/* Hand Raised Indicator */}
                            {participant.handRaised && (
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                                    <i className="fas fa-hand-paper text-sm text-yellow-900"></i>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="text-center mb-2">
                        <p className="text-white font-medium truncate">
                            {isCurrentUser ? 'You' : (participant.profile?.name || participant.profile?.username || 'User')}
                        </p>
                        {participant.profile?.username && !isCurrentUser && (
                            <p className="text-purple-200 text-xs truncate">
                                @{participant.profile.username}
                            </p>
                        )}
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-center space-x-2">
                        {/* Muted Status */}
                        {participant.isMuted && (
                            <div className="px-2 py-1 bg-red-500/20 rounded-full">
                                <i className="fas fa-microphone-slash text-red-400 text-xs"></i>
                            </div>
                        )}

                        {/* Speaking Indicator */}
                        {isSpeaking && !participant.isMuted && (
                            <div className="px-2 py-1 bg-green-500/20 rounded-full">
                                <i className="fas fa-volume-up text-green-400 text-xs"></i>
                            </div>
                        )}
                    </div>

                    {/* Demote Button (for hosts) */}
                    {canDemote && !isCurrentUser && (
                        <button
                            onClick={onDemote}
                            className="mt-3 w-full px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs transition-colors"
                        >
                            <i className="fas fa-arrow-down mr-1"></i>
                            Move to Audience
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
