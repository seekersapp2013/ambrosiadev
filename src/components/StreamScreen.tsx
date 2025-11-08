import { useConvexAuth, useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { ArticleCard } from "./ArticleCard";

interface StreamScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function StreamScreen({ onNavigate }: StreamScreenProps = {}) {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const articles = useQuery(api.articles.listFeed, { limit: 20 });

  console.log("StreamScreen render - isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "articles:", articles);
  console.log("StreamScreen - onNavigate function:", onNavigate);

  useEffect(() => {
    // No need to reload the page - just let the component handle authentication state
  }, [isAuthenticated]);

  // Show loading state while authentication is being determined
  if (isLoading) {
    console.log("StreamScreen showing loading state");
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show loading state while not authenticated
  if (!isAuthenticated) {
    console.log("StreamScreen showing not authenticated state");
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-gray-500">Please sign in to view articles</p>
      </div>
    );
  }

  console.log("StreamScreen rendering main content");
  const toggleLike = (button: HTMLButtonElement) => {
    const icon = button.querySelector('i');
    if (icon?.classList.contains('far')) {
      icon.classList.remove('far');
      icon.classList.add('fas', 'text-red-500');
    } else if (icon) {
      icon.classList.remove('fas', 'text-red-500');
      icon.classList.add('far');
    }
  };

  const showContent = (button: HTMLButtonElement) => {
    const parent = button.parentElement;
    if (parent) {
      parent.classList.add('hidden');
    }
  };

  return (
    <div>
      {/* Story Highlights - Tags */}
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
          {/* Popular Tags */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5 flex items-center justify-center h-full">
                <span className="text-xs font-bold">#Health</span>
              </div>
            </div>
            <span className="text-xs">Health</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-400 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5 flex items-center justify-center h-full">
                <span className="text-xs font-bold">#Tech</span>
              </div>
            </div>
            <span className="text-xs">Tech</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5 flex items-center justify-center h-full">
                <span className="text-xs font-bold">#Life</span>
              </div>
            </div>
            <span className="text-xs">Lifestyle</span>
          </div>
        </div>
      </div>

      {/* Articles Feed */}
      <div className="mb-4">
        
        {articles === undefined ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <i className="fas fa-newspaper text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-bold text-gray-600 mb-2">No articles yet</h3>
            <p className="text-gray-500 text-center mb-4">
              Be the first to share your thoughts with the community!
            </p>
            <button 
              onClick={() => onNavigate?.('write-article')}
              className="bg-accent text-white px-6 py-3 rounded-lg font-medium"
            >
              Write your first article
            </button>
          </div>
        ) : (
          // Articles list
          articles.map((article) => (
            <ArticleCard 
              key={article._id} 
              article={article} 
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>


    </div>
  );
}