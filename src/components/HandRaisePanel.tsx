import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface HandRaisePanelProps {
    handRaisedUsers: Array<{
        userId: Id<"users">;
        bookingId: Id<"bookings">;
        handRaisedAt?: number;
        profile: {
            name?: string;
            username?: string;
            avatar?: string;
        };
    }>;
    onPromote: (userId: Id<"users">) => void;
}

export function HandRaisePanel({ handRaisedUsers, onPromote }: HandRaisePanelProps) {
    const formatTimeSince = (timestamp?: number) => {
        if (!timestamp) return 'Just now';
        
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    return (
        <div className="w-80 bg-black/30 backdrop-blur-sm border-l border-white/10 overflow-y-auto">
            <div className="p-4 border-b border-white/10">
                <h3 className="text-white font-semibold flex items-center">
                    <i className="fas fa-hand-paper text-yellow-400 mr-2"></i>
                    Raised Hands ({handRaisedUsers.length})
                </h3>
                <p className="text-purple-200 text-xs mt-1">
                    Click to promote to speaker
                </p>
            </div>

            <div className="p-4 space-y-3">
                {handRaisedUsers.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="fas fa-hand-paper text-4xl text-white/20 mb-3"></i>
                        <p className="text-white/60 text-sm">No raised hands</p>
                    </div>
                ) : (
                    handRaisedUsers.map((user) => (
                        <HandRaisedUserCard
                            key={user.userId}
                            user={user}
                            timeSince={formatTimeSince(user.handRaisedAt)}
                            onPromote={() => onPromote(user.userId)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

interface HandRaisedUserCardProps {
    user: {
        userId: Id<"users">;
        profile: {
            name?: string;
            username?: string;
            avatar?: string;
        };
    };
    timeSince: string;
    onPromote: () => void;
}

function HandRaisedUserCard({ user, timeSince, onPromote }: HandRaisedUserCardProps) {
    const avatarUrl = useQuery(
        api.files.getFileUrl,
        user.profile?.avatar ? { storageId: user.profile.avatar } : "skip"
    );

    return (
        <div className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors cursor-pointer"
             onClick={onPromote}>
            <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt={user.profile?.name || 'User'}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                                {(user.profile?.name || user.profile?.username || 'U')[0].toUpperCase()}
                            </span>
                        </div>
                    )}
                    
                    {/* Hand Icon */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                        <i className="fas fa-hand-paper text-xs text-yellow-900"></i>
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                        {user.profile?.name || user.profile?.username || 'User'}
                    </p>
                    {user.profile?.username && (
                        <p className="text-purple-200 text-xs truncate">
                            @{user.profile.username}
                        </p>
                    )}
                    <p className="text-purple-300 text-xs mt-1">
                        {timeSince}
                    </p>
                </div>

                {/* Promote Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onPromote();
                    }}
                    className="flex-shrink-0 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <i className="fas fa-arrow-up mr-1"></i>
                    Promote
                </button>
            </div>
        </div>
    );
}
