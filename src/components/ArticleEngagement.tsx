import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getFullArticleUrl } from "../utils/router";

interface ArticleEngagementProps {
  article: {
    _id: Id<"articles">;
    title: string;
    slug?: string;
    author: {
      id?: Id<"users">;
      name?: string;
      username?: string;
      avatar?: string;
    };
    isGated?: boolean;
  };
  onNavigate?: (screen: string, data?: any) => void;
  disabled?: boolean; // For public viewer when not authenticated
  variant?: 'card' | 'viewer'; // Different layouts for different contexts
  hasAccess?: boolean; // Pass hasAccess from parent to avoid duplicate queries
}

export function ArticleEngagement({ article, onNavigate, disabled = false, variant = 'viewer', hasAccess }: ArticleEngagementProps) {
  const [showShare, setShowShare] = useState(false);
  const { isAuthenticated } = useConvexAuth();
  
  const clapArticle = useMutation(api.engagement.clapArticle);
  const bookmarkArticle = useMutation(api.engagement.bookmarkArticle);
  const startChat = useMutation(api.chat.startChatWithAuthor);
  
  // Get like and bookmark status from database
  const myClaps = useQuery(api.engagement.myClapsForArticle, { articleId: article._id });
  const isBookmarked = useQuery(api.engagement.isBookmarked, { 
    contentType: "article", 
    contentId: article._id 
  });

  const handleClap = async (delta: number) => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to clap for this article.');
        return;
      }
      if (hasAccess === undefined) return;
      if (article.isGated && !hasAccess) {
        alert('Unlock this article to clap.');
        return;
      }
      await clapArticle({ articleId: article._id, delta });
    } catch (error) {
      console.error("Error clapping article:", error);
    }
  };

  const buildShareUrl = () => {
    // Use the proper username and slug if available
    const username = article.author.username || article.author.name || 'author';
    const slug = article.slug || (article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now());
    
    const url = getFullArticleUrl(username, slug);
    console.log('Generated share URL:', { username, slug, url, article: article.title });
    return url;
  };

  const openShareLink = () => {
    const url = buildShareUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareMessage = `Check out "${article.title}" by ${article.author.username || article.author.name || 'this author'} on Ambrosia`;

  const handleBookmark = async () => {
    try {
      if (!isAuthenticated || disabled) {
        alert('Please sign in to bookmark this article.');
        return;
      }
      console.log('Bookmarking article:', article._id);
      const result = await bookmarkArticle({ articleId: article._id });
      console.log('Bookmark result:', result);
    } catch (error) {
      console.error("Error bookmarking article:", error);
    }
  };

  const handleComments = () => {
    if (!isAuthenticated || disabled) {
      alert('Please sign in to view and participate in comments.');
      return;
    }
    if (hasAccess === undefined) return;
    if (article.isGated && !hasAccess) {
      alert('Unlock this article to view and participate in comments.');
      return;
    }
    onNavigate?.('article-comments', { articleId: article._id });
  };

  const handleChatWithAuthor = async () => {
    if (!isAuthenticated || disabled) {
      alert('Please sign in to message the author.');
      return;
    }
    
    if (!article.author.id) {
      alert('Unable to message this author.');
      return;
    }

    try {
      const result = await startChat({
        authorId: article.author.id,
        contentType: "article",
        contentId: article._id,
        initialMessage: `Hi! I saw your article "${article.title}" and wanted to chat.`,
      });
      
      if (result.success) {
        onNavigate?.('chat', { conversationId: result.conversationId });
      }
    } catch (error: any) {
      alert(error.message || 'Failed to start chat with author');
    }
  };

  const isEngagementDisabled = disabled || !isAuthenticated;
  const isGatedAndNoAccess = article.isGated && !hasAccess;

  const containerClass = variant === 'card' 
    ? "px-4 pt-3" 
    : "mt-8 pt-6 border-t border-gray-200";

  return (
    <div className={containerClass}>
      <div className="flex justify-between mb-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClap(1); }}
              disabled={isEngagementDisabled || (hasAccess === undefined) || isGatedAndNoAccess || (myClaps !== undefined && myClaps >= 100)}
              title="Clap"
              className={`text-2xl ${
                isEngagementDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : (hasAccess === undefined)
                    ? 'text-gray-400'
                    : isGatedAndNoAccess
                      ? 'text-gray-400 cursor-not-allowed'
                      : ((myClaps ?? 0) > 0)
                        ? 'text-accent hover:text-accent'
                        : 'text-gray-700 hover:text-accent'
              }`}
            >
              <i className="fa-solid fa-hands-clapping"></i>
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleClap(-1); }}
              disabled={isEngagementDisabled || (hasAccess === undefined) || isGatedAndNoAccess || (myClaps ?? 0) <= 0}
              title="Remove a clap"
              className={`text-xl ${
                isEngagementDisabled ? 'text-gray-400 cursor-not-allowed' : (hasAccess === undefined) ? 'text-gray-400' : isGatedAndNoAccess ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-accent'
              }`}
            >
              <i className="fas fa-minus"></i>
            </button>
            <span className="text-sm text-gray-600">{myClaps ?? 0}/100</span>
          </div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleComments();
            }}
            disabled={isEngagementDisabled || hasAccess === undefined || isGatedAndNoAccess}
            className={`text-2xl ${
              isEngagementDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : hasAccess === undefined
                  ? 'text-gray-400'
                  : isGatedAndNoAccess
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700'
            }`}
          >
            <i className="far fa-comment"></i>
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleChatWithAuthor();
            }}
            disabled={isEngagementDisabled}
            title="Message author"
            className={`text-2xl ${
              isEngagementDisabled
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <i className="far fa-envelope"></i>
          </button>
          <div className="relative">
            <button 
              className="text-2xl text-gray-700"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowShare((s) => !s); }}
              title="Share"
            >
              <i className="far fa-paper-plane"></i>
            </button>
            {showShare && (
              <div className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
                <p className="text-sm font-medium mb-2">Share this article</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={openShareLink} className="text-xs bg-gray-100 px-2 py-1 rounded">Open Link</button>
                  <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}&url=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">X</button>
                  <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">Facebook</button>
                  <button onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">LinkedIn</button>
                  <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage + ' ' + buildShareUrl())}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">WhatsApp</button>
                  <button onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(buildShareUrl())}&text=${encodeURIComponent(shareMessage)}`, '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">Telegram</button>
                  <button onClick={() => { navigator.clipboard.writeText(buildShareUrl()); }} className="text-xs bg-gray-100 px-2 py-1 rounded">Copy Link</button>
                </div>
                <textarea readOnly className="w-full text-xs border border-gray-200 rounded p-2 bg-gray-50" rows={2} value={`${shareMessage}\n${buildShareUrl()}`} />
              </div>
            )}
          </div>
        </div>
        <button 
          onClick={handleBookmark}
          disabled={isEngagementDisabled}
          className={`text-2xl ${
            isEngagementDisabled 
              ? 'text-gray-400 cursor-not-allowed'
              : isBookmarked 
                ? 'text-accent' 
                : 'text-gray-700'
          }`}
        >
          <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
        </button>
      </div>

      {/* Stats */}
      <ClapTotals articleId={article._id} />
    </div>
  );
}

function ClapTotals({ articleId }: { articleId: Id<"articles"> }) {
  const totalClaps = useQuery(api.engagement.totalClapsForArticle, { articleId });
  if (totalClaps === undefined) {
    return (
      <div className="text-sm text-gray-500">Claps: ...</div>
    );
  }
  return (
    <div className="text-sm text-gray-500">{totalClaps} claps</div>
  );
}