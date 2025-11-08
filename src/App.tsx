"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useQuery,
} from "convex/react";

import { useAuthActions } from "@convex-dev/auth/react";
import { useState, useEffect } from "react";
import { parseCurrentRoute, type Route } from "./utils/router";
import { api } from "../convex/_generated/api";

// Import components
import { AuthForm } from "./components/AuthForm";
import { StreamScreen } from "./components/StreamScreen";
import { BookingScreen } from "./components/BookingScreen";
import { ReelsScreen } from "./components/ReelsScreen";
import { LeaderboardScreen } from "./components/LeaderboardScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { WriteArticle } from "./components/WriteArticle";
import { WriteReel } from "./components/WriteReel";
import { Paywall } from "./components/Paywall";
import { CommentSection } from "./components/CommentSection";

import { PrivateArticleViewer } from "./components/PrivateArticleViewer";
import { PrivateReelViewer } from "./components/PrivateReelViewer";
import { PublicReelViewer } from "./components/PublicReelViewer";
import { PublicArticleViewer } from "./components/PublicArticleViewer";

import { WalletBalance } from "./components/WalletBalance";
import { FundWallet } from "./components/FundWallet";

import { TransferFunds } from "./components/TransferFunds";
import { SendEmailForm } from "./components/SendEmailForm";
import { GenerateWallet } from "./components/GenerateWallet";
import { EmailHistory } from "./components/EmailHistory";
import { NotificationManager } from "./components/NotificationManager";
import { ChatScreen } from "./components/ChatScreen";
import { UserProfileView } from "./components/UserProfileView";

// PWA Install Hook
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(true);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true) {
      setShowInstallButton(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallButton(false);
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

      if (isIOS || isSafari) {
        alert(`To install this app on your ${isIOS ? 'iPhone/iPad' : 'device'}:

1. Tap the Share button (□↗) at the bottom of the screen
2. Scroll down and tap "Add to Home Screen"
3. Tap "Add" to confirm

The app will then appear on your home screen!`);
      } else if (isAndroid) {
        alert(`To install this app:

1. Tap the menu button (⋮) in your browser
2. Look for "Add to Home screen" or "Install app"
3. Tap it and follow the prompts`);
      } else {
        alert(`To install this app:

1. Look for an install icon (⬇) in your browser's address bar
2. Or check your browser's menu for "Install" option
3. Click it to install the app`);
      }
    }
  };

  return { showInstallButton, installPWA };
}

// PWA Install Button Component
function PWAInstallButton() {
  const { showInstallButton, installPWA } = usePWAInstall();

  if (!showInstallButton) return null;

  return (
    <button
      onClick={installPWA}
      className="text-gray-700 hover:text-accent transition-colors duration-200"
      title="Install Ambrosia as an app"
    >
      <i className="fas fa-download text-2xl"></i>
    </button>
  );
}

// Main App Component
function MainApp() {
  const [currentScreen, setCurrentScreen] = useState('ArticleScreen');
  const [currentScreenData, setCurrentScreenData] = useState<any>(null);
  const { signOut } = useAuthActions();

  // Get user profile for avatar
  const myProfile = useQuery(api.profiles.getMyProfile);
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    myProfile?.avatar ? { storageId: myProfile.avatar } : "skip"
  );
  
  // Get unread notification count
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  const showScreen = (screenId: string, data?: any) => {
    console.log('showScreen called:', { screenId, data });
    setCurrentScreen(screenId);
    setCurrentScreenData(data);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'ArticleScreen':
        return <StreamScreen onNavigate={showScreen} />;
      case 'search-screen':
        return <BookingScreen onBack={() => showScreen('ArticleScreen')} />;
      case 'reels-screen':
        return <ReelsScreen onNavigate={showScreen} />;
      case 'leaderboard-screen':
        return <LeaderboardScreen />;
      case 'profile-screen':
        return <ProfileScreen />;
      case 'chat-screen':
        return <ChatScreen />;
      case 'user-profile-view':
        return <UserProfileView
          username={currentScreenData?.username}
          onStartChat={(conversationId) => {
            showScreen('chat-screen');
          }}
        />;
      case 'write-article':
        return <WriteArticle onBack={() => showScreen('ArticleScreen')} onNavigate={showScreen} />;
      case 'write-reel':
        return <WriteReel onBack={() => showScreen('reels-screen')} onNavigate={showScreen} />;
      case 'paywall':
        return <Paywall
          contentType={currentScreenData?.contentType || 'article'}
          contentId={currentScreenData?.contentId || ''}
          title={currentScreenData?.title || ''}
          price={currentScreenData?.price || 0}
          token={currentScreenData?.token || 'USD'}
          sellerAddress={currentScreenData?.sellerAddress}
          onBack={() => showScreen('ArticleScreen')}
          onSuccess={() => showScreen('ArticleScreen')}
          onFundWallet={() => showScreen('fund-wallet')}
        />;
      case 'article-comments':
        return <CommentSection
          contentType="article"
          contentId={currentScreenData?.articleId}
          onBack={() => showScreen('ArticleScreen')}
        />;
      case 'reel-comments':
        return <CommentSection
          contentType="reel"
          contentId={currentScreenData?.reelId}
          onBack={() => showScreen('reels-screen')}
        />;
      case 'notifications-screen':
        return <NotificationManager onBack={() => showScreen('ArticleScreen')} />;
      case 'private-article-viewer':
        return <PrivateArticleViewer
          articleId={currentScreenData?.articleId}
          onBack={() => showScreen('ArticleScreen')}
          onNavigate={showScreen}
        />;
      case 'private-reel-viewer':
        return <PrivateReelViewer
          reelId={currentScreenData?.reelId}
          onBack={() => showScreen('reels-screen')}
          onNavigate={showScreen}
        />;
      case 'wallet-balance':
        return <WalletBalance onNavigate={showScreen} />;
      case 'fund-wallet':
        return <FundWallet onBack={() => showScreen('wallet-balance')} />;
      case 'transfer-funds':
        return <TransferFunds />;
      case 'send-email':
        return <SendEmailForm />;
      case 'generate-wallet':
        return <GenerateWallet />;
      case 'email-history':
        return <EmailHistory />;

      default:
        return <StreamScreen onNavigate={showScreen} />;
    }
  };

  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'ArticleScreen':
        return 'Ambrosia';
      case 'search-screen':
        return 'Booking';
      case 'reels-screen':
        return 'Reels';
      case 'leaderboard-screen':
        return 'Leaderboard';
      case 'profile-screen':
        return 'Profile';
      case 'chat-screen':
        return 'Messages';
      case 'user-profile-view':
        return 'Profile';
      case 'write-article':
        return 'New Article';
      case 'write-reel':
        return 'New Reel';
      case 'notifications-screen':
        return 'Notifications';
      case 'private-article-viewer':
        return 'Article';
      case 'private-reel-viewer':
        return 'Reel';
      case 'wallet-balance':
        return 'Wallet';
      case 'fund-wallet':
        return 'Fund Wallet';
      case 'transfer-funds':
        return 'Transfer Funds';
      case 'send-email':
        return 'Send Email';
      case 'generate-wallet':
        return 'Generate Wallet';
      case 'email-history':
        return 'Email History';
      case 'paywall':
        return 'Premium Content';
      case 'article-comments':
        return 'Comments';
      case 'reel-comments':
        return 'Comments';
      default:
        return 'Ambrosia';
    }
  };

  const showBackButton = ['write-article', 'write-reel', 'paywall', 'article-comments', 'reel-comments', 'private-article-viewer', 'private-reel-viewer', 'fund-wallet', 'transfer-funds', 'send-email', 'generate-wallet', 'email-history', 'chat-screen', 'user-profile-view'].includes(currentScreen);

  return (
    <div className="bg-ambrosia-100 text-gray-800 max-w-md mx-auto relative min-h-screen">
      {/* Header */}
      <header className="bg-white py-3 px-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center">
          {showBackButton && (
            <button onClick={() => showScreen('ArticleScreen')} className="mr-3">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
          )}
          <h1 className="text-xl font-bold text-accent">{getHeaderTitle()}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {currentScreen === 'search-screen' && (
            <div className="flex-1 mx-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-gray-100 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-gray-500"></i>
              </div>
            </div>
          )}
          {currentScreen === 'ArticleScreen' && (
            <>
              <button onClick={() => showScreen('notifications-screen')} className="relative text-gray-700 hover:text-accent transition-colors duration-200">
                <i className="fas fa-bell text-2xl"></i>
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

            </>
          )}
          <PWAInstallButton />
          <button
            onClick={() => void signOut()}
            className="text-gray-700 hover:text-accent transition-colors duration-200"
            title="Sign out"
          >
            <i className="fas fa-sign-out-alt text-2xl"></i>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-16">
        {renderCurrentScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 max-w-md mx-auto">
        <button
          onClick={() => showScreen('ArticleScreen')}
          className={`flex flex-col items-center ${currentScreen === 'ArticleScreen' ? 'text-accent' : 'text-gray-600'}`}
        >
          <i className="fas fa-home text-xl"></i>
        </button>
        <button
          onClick={() => showScreen('search-screen')}
          className={`flex flex-col items-center ${currentScreen === 'search-screen' ? 'text-accent' : 'text-gray-600'}`}
        >
          <i className="fas fa-calendar-alt text-xl"></i>
        </button>
        <button
          onClick={() => showScreen('chat-screen')}
          className={`flex flex-col items-center ${currentScreen === 'chat-screen' ? 'text-accent' : 'text-gray-600'}`}
        >
          <i className="fas fa-comment text-xl"></i>
        </button>
        <button
          onClick={() => showScreen('reels-screen')}
          className={`flex flex-col items-center ${currentScreen === 'reels-screen' ? 'text-accent' : 'text-gray-600'}`}
        >
          <i className="fas fa-play-circle text-xl"></i>
        </button>
        <button
          onClick={() => showScreen('wallet-balance')}
          className={`flex flex-col items-center ${currentScreen === 'wallet-balance' ? 'text-accent' : 'text-gray-600'}`}
        >
          <i className="fas fa-wallet text-xl"></i>
        </button>
        <button
          onClick={() => showScreen('profile-screen')}
          className={`flex flex-col items-center ${currentScreen === 'profile-screen' ? 'text-accent' : 'text-gray-600'}`}
        >
          <img
            src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
          />
        </button>
      </nav>


    </div>
  );
}

// Main App Entry
export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>(parseCurrentRoute());

  // Listen for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(parseCurrentRoute());
    };

    const handlePopState = () => {
      setCurrentRoute(parseCurrentRoute());
    };

    window.addEventListener('routechange', handleRouteChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('routechange', handleRouteChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  console.log("App render - isAuthenticated:", isAuthenticated, "isLoading:", isLoading, "route:", currentRoute);

  if (isLoading) {
    console.log("Showing loading state");
    return (
      <div className="fixed inset-0 bg-ambrosia-50 z-50 flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-accent mb-2">Ambrosia</h1>
          <p className="text-gray-600">Loading...</p>
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }



  console.log("Rendering main app - isAuthenticated:", isAuthenticated);

  // Handle public routes (articles and reels)
  if (currentRoute.type === 'article') {
    return (
      <PublicArticleViewer
        slug={currentRoute.slug}
        authorUsername={currentRoute.authorUsername}
      />
    );
  }

  if (currentRoute.type === 'reel') {
    return (
      <PublicReelViewer
        reelId={currentRoute.reelId}
        authorUsername={currentRoute.authorUsername}
      />
    );
  }

  return (
    <>
      <Authenticated>
        <MainApp />
      </Authenticated>

      <Unauthenticated>
        <AuthForm />
      </Unauthenticated>
    </>
  );
}