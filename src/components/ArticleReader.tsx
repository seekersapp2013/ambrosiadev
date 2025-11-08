import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useState } from "react";
import { GatedContentPaywall } from "./GatedContentPaywall";

interface ArticleReaderProps {
  articleId?: Id<"articles">;
  articleSlug?: string;
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function ArticleReader({ articleId, articleSlug, onBack, onNavigate }: ArticleReaderProps) {
  const [error, setError] = useState<string | null>(null);
  const articleById = articleId ? useQuery(api.articles.getArticleById, { articleId }) : undefined;
  const articleBySlug = articleSlug ? useQuery(api.articles.getArticleBySlug, { slug: articleSlug }) : undefined;
  const article = (articleId ? articleById : articleBySlug) as any;
  const incrementViews = useMutation(api.articles.incrementViews);
  const recordRead = useMutation(api.engagement.recordArticleRead);

  // Access and engagement state
  const effectiveArticleId = article?._id as Id<"articles"> | undefined;
  const hasAccess = effectiveArticleId ? useQuery(api.payments.hasAccess, { contentType: "article", contentId: effectiveArticleId }) : true;
  const myClaps = effectiveArticleId ? useQuery(api.engagement.myClapsForArticle, { articleId: effectiveArticleId }) : undefined;
  const totalClaps = effectiveArticleId ? useQuery(api.engagement.totalClapsForArticle, { articleId: effectiveArticleId }) : undefined;
  const hasRead = effectiveArticleId ? useQuery(api.engagement.hasReadArticle, { articleId: effectiveArticleId }) : undefined;
  const isBookmarked = effectiveArticleId ? useQuery(api.engagement.isBookmarked, { contentType: "article", contentId: effectiveArticleId as any }) : false;
  const bookmarkArticle = useMutation(api.engagement.bookmarkArticle);
  const clapArticle = useMutation(api.engagement.clapArticle);

  // Get cover image URL
  const coverImageUrl = useQuery(
    api.files.getFileUrl,
    article?.coverImage ? { storageId: article.coverImage } : undefined as any
  );

  // Increment view count when article is opened
  useEffect(() => {
    if (article && effectiveArticleId) {
      try {
        incrementViews({ articleId: effectiveArticleId });
        // Record that this user has read the article (for clapping eligibility)
        recordRead({ articleId: effectiveArticleId });
      } catch (err) {
        console.error("Error incrementing views:", err);
      }
    }
  }, [article, effectiveArticleId, incrementViews]);

  // Enhanced debugging with detailed error information
  useEffect(() => {
    console.log("ArticleReader - Debug Info:");
    console.log("  - article:", article);
    console.log("  - articleId:", articleId);
    console.log("  - articleSlug:", articleSlug);
    console.log("  - hasAccess:", hasAccess);
    console.log("  - isGated:", article?.isGated);
    
    if (article) {
      console.log("  - Article Details:");
      console.log("    - ID:", article._id);
      console.log("    - Title:", article.title);
      console.log("    - Author:", article.author?.name || article.author?.username);
      console.log("    - contentHtml exists:", !!article.contentHtml);
      console.log("    - contentHtml type:", typeof article.contentHtml);
      console.log("    - contentHtml length:", article.contentHtml?.length || 0);
      console.log("    - contentHtml preview:", article.contentHtml ? article.contentHtml.substring(0, 200) + '...' : 'None');
      console.log("    - Status:", article.status);
      console.log("    - Created:", new Date(article.createdAt).toISOString());
      
      // Validate contentHtml format
      if (article.contentHtml) {
        const hasValidHTML = article.contentHtml.includes('<p>') || article.contentHtml.includes('<br>');
        console.log("    - Contains HTML tags:", hasValidHTML);
        
        if (!hasValidHTML) {
          console.warn("    - WARNING: contentHtml appears to be plain text, not HTML");
        }
      }
    } else if (article === null) {
      console.log("  - Article not found in database");
    } else {
      console.log("  - Article still loading...");
    }
  }, [article, articleId, articleSlug, hasAccess]);

  // Enhanced error handling with detailed validation
  useEffect(() => {
    if (article) {
      // Validate contentHtml exists and is valid
      if (!article.contentHtml) {
        setError("Article content is missing - contentHtml field is empty");
        console.error("ArticleReader Error: contentHtml is missing for article", article._id);
      } else if (typeof article.contentHtml !== 'string') {
        setError(`Article content has invalid type - expected string, got ${typeof article.contentHtml}`);
        console.error("ArticleReader Error: contentHtml has invalid type", typeof article.contentHtml);
      } else if (article.contentHtml.trim().length === 0) {
        setError("Article content is empty - contentHtml field contains only whitespace");
        console.error("ArticleReader Error: contentHtml is empty for article", article._id);
      } else {
        // Content exists and is valid
        setError(null);
        console.log("ArticleReader: Content validation passed");
      }
    } else {
      setError(null);
    }
  }, [article]);

  if (article === undefined) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onBack} className="text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">Article</h1>
          <div></div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
          <p className="text-gray-500">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onBack} className="text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">Article</h1>
          <div></div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-exclamation-triangle text-4xl mb-4 opacity-50"></i>
          <p>Article not found</p>
        </div>
      </div>
    );
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  // Check if contentHtml exists and is valid
  const hasValidContent = article.contentHtml && typeof article.contentHtml === 'string' && article.contentHtml.trim().length > 0;
  
  // Check if user should have access to content
  const shouldHaveAccess = !article?.isGated || hasAccess === true;

  const handleClap = async (delta: number) => {
    try {
      if (hasAccess === undefined || hasRead === undefined) return;
      if (article.isGated && !hasAccess) {
        alert('Unlock this article to clap.');
        return;
      }
      if (hasRead === false) {
        alert('Read the article before clapping.');
        return;
      }
      if (!effectiveArticleId) return;
      await clapArticle({ articleId: effectiveArticleId, delta });
    } catch (e) {
      console.error('Failed to clap:', e);
    }
  };

  const handleBookmark = async () => {
    try {
      if (!effectiveArticleId) return;
      await bookmarkArticle({ articleId: effectiveArticleId });
    } catch (e) {
      console.error('Failed to toggle bookmark:', e);
    }
  };

  // Check if content is gated and user doesn't have access
  if (article?.isGated && hasAccess === false) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onBack} className="text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">Premium Content</h1>
          <div></div>
        </div>
        <GatedContentPaywall
          contentType="article"
          title={article.title}
          price={article.priceAmount || 0}
          token={article.priceToken || "USD"}
          sellerAddress={article.sellerAddress}
          onUnlock={() => onNavigate?.('paywall', { 
            contentType: 'article', 
            contentId: article._id,
            title: article.title,
            price: article.priceAmount,
            token: article.priceToken,
            sellerAddress: article.sellerAddress
          })}
          onFundWallet={() => onNavigate?.('fund-wallet')}
        />
      </div>
    );
  }

  // If there's an error or no valid content, show error state
  if (error || !hasValidContent) {
    return (
      <div className="bg-white min-h-screen">
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onBack} className="text-gray-600">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <h1 className="text-lg font-semibold">Article</h1>
          <div></div>
        </div>

        <div className="p-4">
          {/* Article Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
            {article.subtitle && (
              <p className="text-lg text-gray-600 mb-3">{article.subtitle}</p>
            )}
            
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src={article.author.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
                alt="Author" 
                className="w-10 h-10 rounded-full" 
              />
              <div>
                <span className="font-medium">{article.author.username || article.author.name}</span>
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(article.createdAt)} • {article.readTimeMin} min read
                </div>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-ambrosia-100 text-accent px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          {article.coverImage && (
            <div className="mb-6">
              <img 
                src={coverImageUrl || ''} 
                alt="Article cover" 
                className="w-full h-64 object-cover rounded-lg" 
              />
            </div>
          )}

          {/* Enhanced Error State with Detailed Debugging */}
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-exclamation-triangle text-4xl mb-4 opacity-50"></i>
            <p className="text-lg font-medium mb-2">Article content not available</p>
            <p className="text-sm mb-4">
              {error || "The article content could not be loaded."}
            </p>
            
            {/* Detailed Debug Information */}
            <div className="bg-gray-100 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-3">
                <strong>Debug Information:</strong>
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div><strong>Article ID:</strong> {article._id}</div>
                <div><strong>Title:</strong> {article.title}</div>
                <div><strong>Author:</strong> {article.author?.name || article.author?.username || 'Unknown'}</div>
                <div><strong>Status:</strong> {article.status}</div>
                <div><strong>Created:</strong> {new Date(article.createdAt).toLocaleString()}</div>
                <div><strong>Content HTML exists:</strong> {article.contentHtml ? 'Yes' : 'No'}</div>
                <div><strong>Content HTML type:</strong> {typeof article.contentHtml}</div>
                <div><strong>Content HTML length:</strong> {article.contentHtml?.length || 0}</div>
                <div><strong>Is Gated:</strong> {article.isGated ? 'Yes' : 'No'}</div>
                <div><strong>Has Access:</strong> {hasAccess === undefined ? 'Loading...' : hasAccess ? 'Yes' : 'No'}</div>
                
                {article.contentHtml && (
                  <div className="mt-3">
                    <strong>Content Preview (first 200 chars):</strong>
                    <div className="bg-white p-2 rounded border mt-1 break-all">
                      {article.contentHtml.substring(0, 200)}
                      {article.contentHtml.length > 200 && '...'}
                    </div>
                  </div>
                )}
                
                {!article.contentHtml && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <strong className="text-red-700">Issue:</strong> The contentHtml field is missing or empty. 
                    This suggests the article was not properly saved during creation.
                  </div>
                )}
              </div>
            </div>
            
            {/* Troubleshooting Steps */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4 text-left max-w-2xl mx-auto">
              <p className="text-sm text-blue-800 font-medium mb-2">Troubleshooting Steps:</p>
              <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                <li>Check if the article was properly created with content</li>
                <li>Verify the database schema includes the contentHtml field</li>
                <li>Ensure the article creation process converts text to HTML</li>
                <li>Check browser console for additional error messages</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">Article</h1>
        <div></div>
      </div>

      {/* Article Content */}
      <div className="p-4">
        {/* Article Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
          {article.subtitle && (
            <p className="text-lg text-gray-600 mb-3">{article.subtitle}</p>
          )}
          
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <img 
              src={article.author.avatar || "https://randomuser.me/api/portraits/women/44.jpg"} 
              alt="Author" 
              className="w-10 h-10 rounded-full" 
            />
            <div>
              <span className="font-medium">{article.author.username || article.author.name}</span>
              <div className="text-sm text-gray-500">
                {formatTimeAgo(article.createdAt)} • {article.readTimeMin} min read
              </div>
            </div>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag: string, index: number) => (
                <span 
                  key={index}
                  className="bg-ambrosia-100 text-accent px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="mb-6">
            <img 
              src={coverImageUrl || ''} 
              alt="Article cover" 
              className="w-full h-64 object-cover rounded-lg" 
            />
          </div>
        )}

        {/* Article Body */}
        <div 
          className="prose max-w-none text-gray-800 leading-relaxed"
          style={{
            fontSize: '16px',
            lineHeight: '1.7'
          }}
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
        {/* Action Bar */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleClap(1)}
                  disabled={(hasAccess === undefined) || (article.isGated && !hasAccess) || (myClaps !== undefined && myClaps >= 100) || hasRead === false}
                  title="Clap"
                  className={`text-2xl ${
                    (hasAccess === undefined)
                      ? 'text-gray-400'
                      : (article.isGated && !hasAccess)
                        ? 'text-gray-400 cursor-not-allowed'
                        : (hasRead === false)
                          ? 'text-gray-400 cursor-not-allowed'
                          : ((myClaps ?? 0) > 0)
                            ? 'text-accent hover:text-accent'
                            : 'text-gray-700 hover:text-accent'
                  }`}
                >
                  <i className="fa-solid fa-hands-clapping"></i>
                </button>
                <button 
                  onClick={() => handleClap(-1)}
                  disabled={(hasAccess === undefined) || (article.isGated && !hasAccess) || (myClaps ?? 0) <= 0 || hasRead === false}
                  title="Remove a clap"
                  className={`text-xl ${
                    (hasAccess === undefined) ? 'text-gray-400' : (article.isGated && !hasAccess) ? 'text-gray-400 cursor-not-allowed' : (hasRead === false) ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-accent'
                  }`}
                >
                  <i className="fas fa-minus"></i>
                </button>
                <span className="text-sm text-gray-600">{myClaps ?? 0}/100</span>
                <span className="text-sm text-gray-500">• {totalClaps ?? 0} claps</span>
              </div>

              <button 
                onClick={() => onNavigate?.('article-comments', { articleId })}
                disabled={hasAccess === undefined || (article.isGated && !hasAccess)}
                className={`text-2xl ${
                  hasAccess === undefined
                    ? 'text-gray-400'
                    : article.isGated && !hasAccess
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700'
                }`}
              >
                <i className="far fa-comment"></i>
              </button>

              <ShareWidget 
                authorName={article.author.username || article.author.name || 'author'}
                title={article.title}
              />
            </div>

            <button 
              onClick={handleBookmark}
              className={`text-2xl ${isBookmarked ? 'text-accent' : 'text-gray-700'}`}
              title="Bookmark"
            >
              <i className={isBookmarked ? 'fas fa-bookmark' : 'far fa-bookmark'}></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShareWidget({ authorName, title }: { authorName: string; title: string }) {
  const [open, setOpen] = useState(false);
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const buildShareUrl = () => {
    const base = window.location.origin;
    const authorPart = slugify(authorName || 'author');
    const titlePart = slugify(title || 'article');
    return `${base}/${authorPart}/${titlePart}`;
  };
  const shareMessage = `Check out "${title}" by ${authorName} on Ambrosia`;

  return (
    <div className="relative">
      <button 
        className="text-2xl text-gray-700"
        onClick={() => setOpen((s) => !s)}
        title="Share"
      >
        <i className="far fa-paper-plane"></i>
      </button>
      {open && (
        <div className="absolute z-20 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64">
          <p className="text-sm font-medium mb-2">Share this article</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button onClick={() => window.open(buildShareUrl(), '_blank', 'noopener,noreferrer')} className="text-xs bg-gray-100 px-2 py-1 rounded">Open Link</button>
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
  );
}
