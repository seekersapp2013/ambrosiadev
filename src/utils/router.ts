// Simple URL router for handling article and reel URLs
export interface ArticleRoute {
    type: 'article';
    authorUsername: string;
    slug: string;
}

export interface ReelRoute {
    type: 'reel';
    authorUsername: string;
    reelId: string;
}

export interface HomeRoute {
    type: 'home';
}

export type Route = ArticleRoute | ReelRoute | HomeRoute;

export function parseCurrentRoute(): Route {
    const path = window.location.pathname;
    
    // Remove leading slash
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // If empty path, it's home
    if (!cleanPath) {
        return { type: 'home' };
    }
    
    // Split path into segments
    const segments = cleanPath.split('/').filter(Boolean);
    
    // Check if it matches reel pattern: author/reel/reelId
    if (segments.length === 3 && segments[1] === 'reel') {
        const [authorUsername, , reelId] = segments;
        return {
            type: 'reel',
            authorUsername,
            reelId
        };
    }
    
    // Check if it matches article pattern: author/slug
    if (segments.length === 2) {
        const [authorUsername, slug] = segments;
        return {
            type: 'article',
            authorUsername,
            slug
        };
    }
    
    // Default to home for unrecognized patterns
    return { type: 'home' };
}

export function navigateToArticle(authorUsername: string, slug: string) {
    const url = `/${authorUsername}/${slug}`;
    window.history.pushState({}, '', url);
    // Trigger a custom event to notify the app of route change
    window.dispatchEvent(new CustomEvent('routechange'));
}

export function navigateToHome() {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new CustomEvent('routechange'));
}

export function generateArticleUrl(authorUsername: string, slug: string): string {
    return `/${authorUsername}/${slug}`;
}

export function getFullArticleUrl(authorUsername: string, slug: string): string {
    return `${window.location.origin}${generateArticleUrl(authorUsername, slug)}`;
}

export function navigateToReel(authorUsername: string, reelId: string) {
    const url = `/${authorUsername}/reel/${reelId}`;
    window.history.pushState({}, '', url);
    window.dispatchEvent(new CustomEvent('routechange'));
}

export function generateReelUrl(authorUsername: string, reelId: string): string {
    return `/${authorUsername}/reel/${reelId}`;
}

export function getFullReelUrl(authorUsername: string, reelId: string): string {
    return `${window.location.origin}${generateReelUrl(authorUsername, reelId)}`;
}