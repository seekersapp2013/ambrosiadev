import { UnifiedContentCard } from "./UnifiedContentCard";

interface ForYouTabProps {
  content: Array<any> | undefined;
  onNavigate?: (screen: string, data?: any) => void;
}

export function ForYouTab({ content, onNavigate }: ForYouTabProps) {
  return (
    <div>
      {/* Story Highlights - Creation Buttons */}
      <div className="bg-white py-3 px-4 border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-4">
          {/* Write Article */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-article')}
              className="w-16 h-16 rounded-full bg-accent text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-pen text-lg"></i>
            </button>
            <span className="text-xs">Write</span>
          </div>
          {/* Create Reel */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-reel')}
              className="w-16 h-16 rounded-full bg-purple-500 text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-video text-lg"></i>
            </button>
            <span className="text-xs">Reel</span>
          </div>
        </div>
      </div>

      {/* Content Feed */}
      <div className="mb-4">
        {content === undefined ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : content.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <i className="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No content yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Be the first to share your thoughts with the community!
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => onNavigate?.('write-article')}
                className="bg-accent text-white px-6 py-3 rounded-lg font-medium"
              >
                Write an article
              </button>
              <button 
                onClick={() => onNavigate?.('write-reel')}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create a reel
              </button>
            </div>
          </div>
        ) : (
          // Content list
          content.map((item: any) => (
            <UnifiedContentCard 
              key={item._id} 
              content={item} 
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
}
