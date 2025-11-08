interface GridToggleButtonProps {
    showGridView: boolean;
    participantCount: number;
    onToggle: () => void;
    variant?: 'header' | 'sidebar';
    showForProvider?: boolean;
    isProvider?: boolean;
}

export function GridToggleButton({
    showGridView,
    participantCount,
    onToggle,
    variant = 'sidebar',
    showForProvider = false,
    isProvider = false
}: GridToggleButtonProps) {
    // Don't show if conditions aren't met
    if (showForProvider && (!isProvider || participantCount <= 1)) {
        return null;
    }

    if (variant === 'header') {
        return (
            <button
                onClick={onToggle}
                className={`p-2 rounded-full ${
                    showGridView ? 'bg-blue-500 hover:bg-blue-600' : 'bg-black/50 hover:bg-black/70'
                } text-white transition-colors`}
                title="Grid View"
            >
                <i className="fas fa-th text-sm"></i>
            </button>
        );
    }

    // Sidebar variant
    return (
        <div className="flex flex-col items-center">
            <button
                onClick={onToggle}
                className="p-3 rounded-full bg-black/50 text-white engagement-button"
                title="Grid View"
            >
                <i className="fas fa-th text-2xl"></i>
            </button>
            <span className="text-white text-xs mt-1">Grid</span>
        </div>
    );
}