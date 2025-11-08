import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ArticleEngagement } from "./ArticleEngagement";

interface ArticleCard2Props {
    article: {
        _id: Id<"articles">;
        title: string;
        subtitle?: string;
        slug?: string;
        coverImage?: string;
        contentHtml?: string;
        readTimeMin: number;
        tags: string[];
        isSensitive: boolean;
        isGated: boolean;
        priceToken?: string;
        priceAmount?: number;
        views: number;
        createdAt: number;
        author: {
            id?: Id<"users">;
            name?: string;
            username?: string;
            avatar?: string;
        };
    };
    onNavigate?: (screen: string, data?: any) => void;
}

export function ArticleCard2({ article, onNavigate }: ArticleCard2Props) {
    const [showSensitiveContent, setShowSensitiveContent] = useState(false);

    const hasAccess = useQuery(api.payments.hasAccess, {
        contentType: "article",
        contentId: article._id,
    });

    // Get cover image URL
    const coverImageUrl = useQuery(
        api.files.getFileUrl,
        article.coverImage ? { storageId: article.coverImage } : "skip"
    );

    // Get author avatar URL
    const authorAvatarUrl = useQuery(
        api.files.getFileUrl,
        article.author.avatar ? { storageId: article.author.avatar } : "skip"
    );

    // Get current user profile to check if it's their own article
    const myProfile = useQuery(api.profiles.getMyProfile);

    // Follow functionality
    const isFollowing = useQuery(
        api.follows.isFollowing,
        article.author.id ? { userId: article.author.id } : "skip"
    );

    const followUser = useMutation(api.follows.followUser);

    // Check if this is the current user's article
    const isOwnArticle = myProfile?.userId === article.author.id;

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!article.author.id) return;

        try {
            await followUser({ followingId: article.author.id });
        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    const handleReadArticle = () => {
        console.log('handleReadArticle called:', {
            isGated: article.isGated,
            hasAccess: hasAccess,
            priceAmount: article.priceAmount,
            priceToken: article.priceToken
        });

        // Navigate to private article viewer - let it handle access control
        console.log('Navigating to private article viewer');
        onNavigate?.('private-article-viewer', { articleId: article._id });
    };

    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'Just now';
    };

    const getFirstParagraphPreview = (contentHtml?: string, maxLength: number = 150) => {
        if (!contentHtml) return '';

        // Create a temporary div to parse HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = contentHtml;

        // Get the first paragraph or first text content
        const firstParagraph = tempDiv.querySelector('p');
        const text = firstParagraph?.textContent || tempDiv.textContent || '';

        // Truncate and add ellipsis
        if (text.length > maxLength) {
            return text.substring(0, maxLength).trim() + '...';
        }

        return text;
    };

    return (
        <div className="bg-white border-b border-gray-200 pb-4">
            {/* Article Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                    <img
                        src={authorAvatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
                        alt="Author"
                        className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                        <span className="font-medium">{article.author.username || article.author.name}</span>
                        <div className="text-xs text-gray-500">
                            {formatTimeAgo(article.createdAt)} • {article.readTimeMin} min read
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Follow/Unfollow Button */}
                    {article.author.id && !isOwnArticle && (
                        <button
                            onClick={handleFollowToggle}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${isFollowing
                                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                : 'bg-accent text-white hover:bg-accent-dark'
                                }`}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                    <button onClick={(e) => e.stopPropagation()}>
                        <i className="fas fa-ellipsis-h text-gray-500"></i>
                    </button>
                </div>
            </div>

            {/* Clickable Article Content */}
            <div
                className="px-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={handleReadArticle}
            >
                <h2 className="text-lg font-bold mb-2">{article.title}</h2>
                {article.subtitle && (
                    <p className="text-gray-600 mb-3">{article.subtitle}</p>
                )}

                {/* Article Preview */}
                {article.contentHtml && (
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                        {getFirstParagraphPreview(article.contentHtml)}
                    </p>
                )}

                {/* Tags */}
                {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="bg-ambrosia-100 text-accent px-2 py-1 rounded-full text-xs"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Cover Image */}
                {article.coverImage && (
                    <div className="relative mb-3">
                        {article.isSensitive && !showSensitiveContent ? (
                            <div className="relative square-image">
                                <div className="absolute inset-0 graphic-content-warning flex flex-col items-center justify-center text-white p-4 text-center z-10">
                                    <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
                                    <h3 className="font-bold text-lg mb-2">Sensitive Content</h3>
                                    <p className="mb-4">This article contains content that some may find sensitive.</p>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowSensitiveContent(true);
                                        }}
                                        className="bg-white text-accent px-4 py-2 rounded-lg font-medium"
                                    >
                                        View Content
                                    </button>
                                </div>
                                <img
                                    src={coverImageUrl || ''}
                                    alt="Article cover"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                        ) : (
                            <img
                                src={coverImageUrl || ''}
                                alt="Article cover"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                        )}
                    </div>
                )}

                {/* Gated Content Indicator */}
                {article.isGated && !hasAccess && (
                    <div className="bg-ambrosia-100 border border-ambrosia-300 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <i className="fas fa-lock text-accent mr-2"></i>
                                <span className="text-sm font-medium">Premium Content</span>
                            </div>
                            <span className="text-accent font-bold">
                                {article.priceAmount} {article.priceToken}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Unlock this article to read the full content
                        </p>
                    </div>
                )}

                {/* Read More Button - now just visual indicator */}
                <div className="font-medium text-sm mb-3 text-accent">
                    Learn more
                </div>
            </div>

            {/* Article Actions */}
            <div onClick={(e) => e.stopPropagation()}>
                <ArticleEngagement
                    article={article}
                    onNavigate={onNavigate}
                    variant="card"
                    hasAccess={hasAccess}
                />
            </div>
        </div>
    );
}