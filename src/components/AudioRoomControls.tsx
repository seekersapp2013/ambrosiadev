interface AudioRoomControlsProps {
    userRole: "HOST" | "SPEAKER" | "LISTENER";
    isMuted: boolean;
    handRaised: boolean;
    onToggleMute: () => void;
    onToggleHandRaise: () => void;
    onLeave: () => void;
}

export function AudioRoomControls({
    userRole,
    isMuted,
    handRaised,
    onToggleMute,
    onToggleHandRaise,
    onLeave
}: AudioRoomControlsProps) {
    const canSpeak = userRole === "HOST" || userRole === "SPEAKER";

    return (
        <div className="bg-black/30 backdrop-blur-sm border-t border-white/10 p-4">
            <div className="max-w-4xl mx-auto flex items-center justify-center space-x-4">
                {/* Mute/Unmute Button (for speakers and hosts) */}
                {canSpeak && (
                    <button
                        onClick={onToggleMute}
                        className={`p-4 rounded-full transition-all ${
                            isMuted 
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50' 
                                : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        <i className={`fas ${isMuted ? 'fa-microphone-slash' : 'fa-microphone'} text-white text-xl`}></i>
                    </button>
                )}

                {/* Raise Hand Button (for listeners) */}
                {userRole === "LISTENER" && (
                    <button
                        onClick={onToggleHandRaise}
                        className={`p-4 rounded-full transition-all ${
                            handRaised 
                                ? 'bg-yellow-400 hover:bg-yellow-500 shadow-lg shadow-yellow-400/50 animate-bounce' 
                                : 'bg-white/20 hover:bg-white/30'
                        }`}
                        title={handRaised ? 'Lower Hand' : 'Raise Hand'}
                    >
                        <i className={`fas fa-hand-paper ${handRaised ? 'text-yellow-900' : 'text-white'} text-xl`}></i>
                    </button>
                )}

                {/* Leave Button */}
                <button
                    onClick={onLeave}
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 transition-all"
                    title="Leave Room"
                >
                    <i className="fas fa-sign-out-alt text-white text-xl"></i>
                </button>

                {/* Role Indicator */}
                <div className="ml-4 px-4 py-2 bg-white/10 rounded-full">
                    <div className="flex items-center space-x-2">
                        <i className={`fas ${
                            userRole === 'HOST' ? 'fa-crown text-yellow-400' :
                            userRole === 'SPEAKER' ? 'fa-microphone text-green-400' :
                            'fa-headphones text-gray-400'
                        }`}></i>
                        <span className="text-white text-sm font-medium">{userRole}</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="max-w-4xl mx-auto mt-3 text-center">
                <p className="text-purple-200 text-xs">
                    {canSpeak && (
                        <>Click the microphone to {isMuted ? 'unmute' : 'mute'} yourself</>
                    )}
                    {userRole === "LISTENER" && (
                        <>Raise your hand to request to speak</>
                    )}
                </p>
            </div>
        </div>
    );
}
