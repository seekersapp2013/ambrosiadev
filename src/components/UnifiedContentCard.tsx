import { Id } from "../../convex/_generated/dataModel";
import { ArticleCard } from "./ArticleCard";
import { ReelCardFeed } from "./ReelCardFeed";

// Union type for unified content
type UnifiedContent = 
  | ({
      contentType: "article";
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
    })
  | ({
      contentType: "reel";
      _id: Id<"reels">;
      video: string;
      poster?: string;
      caption?: string;
      tags: string[];
      isSensitive: boolean;
      isGated: boolean;
      priceToken?: string;
      priceAmount?: number;
      sellerAddress?: string;
      views: number;
      createdAt: number;
      author: {
        id?: Id<"users">;
        name?: string;
        username?: string;
        avatar?: string;
      };
    });

interface UnifiedContentCardProps {
  content: UnifiedContent;
  onNavigate?: (screen: string, data?: any) => void;
}

export function UnifiedContentCard({ content, onNavigate }: UnifiedContentCardProps) {
  if (content.contentType === "article") {
    return (
      <div className="unified-content-card content-type-article">
        <ArticleCard 
          article={content} 
          onNavigate={onNavigate}
        />
      </div>
    );
  } else {
    return (
      <div className="unified-content-card content-type-reel">
        <ReelCardFeed 
          reel={content} 
          onNavigate={onNavigate}
        />
      </div>
    );
  }
}