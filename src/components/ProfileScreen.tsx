import { useState, useEffect, useRef } from "react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { InterestManagement } from "./InterestManagement";
import { ComprehensiveInterests } from "./ComprehensiveInterests";

export function ProfileScreen() {
  const { isAuthenticated } = useConvexAuth();
  const bookmarks = useQuery(api.engagement.getUserBookmarks);
  const myProfile = useQuery(api.profiles.getMyProfile);
  const myArticles = useQuery(api.profiles.getMyArticles);
  const myFollowers = useQuery(api.profiles.getMyFollowers);
  const myFollowing = useQuery(api.profiles.getMyFollowing);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'followers' | 'following' | 'interests'>('posts');
  const [isUploading, setIsUploading] = useState(false);
  const [showInterestManagement, setShowInterestManagement] = useState(false);
  const [showInterestsExpanded, setShowInterestsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateProfile = useMutation(api.profiles.createOrUpdateProfile);
  const deleteProfilePicture = useMutation(api.profiles.deleteProfilePicture);
  const deleteArticle = useMutation(api.articles.deleteArticle);

  // Get avatar URL if exists
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    myProfile?.avatar ? { storageId: myProfile.avatar } : "skip"
  );

  useEffect(() => {
    // No need to reload the page - just let the component handle authentication state
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  const showProfileTab = (tab: 'posts' | 'saved' | 'followers' | 'following' | 'interests') => {
    setActiveTab(tab);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting avatar upload:', file.name, file.type, file.size);
    setIsUploading(true);

    try {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Generate upload URL
      console.log('Generating upload URL...');
      const uploadUrl = await generateUploadUrl();
      console.log('Generated upload URL:', uploadUrl);

      // Upload file
      console.log('Uploading file...');
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      console.log('Upload response status:', result.status);

      if (!result.ok) {
        const errorText = await result.text();
        console.error('Upload failed:', result.status, result.statusText, errorText);
        throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
      }

      const responseData = await result.json();
      console.log('Upload response data:', responseData);
      const { storageId } = responseData;

      if (!storageId) {
        throw new Error('No storageId returned from upload');
      }

      console.log('File uploaded successfully, storageId:', storageId);

      // Update profile with new avatar - create profile if it doesn't exist
      const userName = myProfile?.user?.name || myProfile?.name || 'User';
      let username = myProfile?.username;

      // If no username exists, generate one from the user's name
      if (!username) {
        username = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
        // If the cleaned name is empty, use a fallback
        if (!username) {
          username = `user_${Date.now()}`;
        }
      }

      const profileData = {
        username: username,
        name: userName,
        bio: myProfile?.bio || undefined,
        avatar: storageId,
      };

      console.log('Updating profile with:', profileData);
      const profileId = await updateProfile(profileData);
      console.log('Profile updated successfully, profileId:', profileId);

      alert('Avatar uploaded successfully!');

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(`Failed to upload avatar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteProfilePicture = async () => {
    if (!myProfile?.avatar) {
      alert('No profile picture to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    try {
      await deleteProfilePicture();
      alert('Profile picture deleted successfully!');
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete profile picture. Please try again.');
    }
  };

  const handleDeleteArticle = async (articleId: Id<"articles">) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteArticle({ articleId });
      console.log(`Article deleted successfully. Removed ${result.deletedComments} comments, ${result.deletedLikes} likes, ${result.deletedBookmarks} bookmarks.`);
    } catch (error) {
      console.error('Error deleting article:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete article. Please try again.');
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        <div className="flex items-center mb-6">
          <div className="relative mr-6">
            <img
              src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 flex space-x-1">
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-accent-dark transition-colors"
                title="Change profile picture"
              >
                {isUploading ? (
                  <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                ) : (
                  <i className="fas fa-plus text-xs"></i>
                )}
              </button>
              {myProfile?.avatar && (
                <button
                  onClick={handleDeleteProfilePicture}
                  className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors"
                  title="Delete profile picture"
                >
                  <i className="fas fa-trash text-xs"></i>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 flex justify-between">
            <div className="text-center">
              <div className="font-bold">{myProfile?.stats?.articles || 0}</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{myProfile?.stats?.followers || 0}</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold">{myProfile?.stats?.following || 0}</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold">{myProfile?.name || myProfile?.username || 'My Profile'}</h2>
          {myProfile?.username && (
            <p className="text-sm text-gray-600 mb-2">@{myProfile.username}</p>
          )}
          {myProfile?.bio && <p className="text-sm mb-2">{myProfile.bio}</p>}

          {/* Interests Preview */}
          {(myProfile as any)?.interests && (myProfile as any).interests.length > 0 && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Interests:</p>
              <div className="flex flex-wrap gap-1">
                {showInterestsExpanded ? (
                  <>
                    {(myProfile as any).interests.map((interest: string) => (
                      <span
                        key={interest}
                        className="text-xs bg-accent text-white px-2 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    <button
                      onClick={() => setShowInterestsExpanded(false)}
                      className="text-xs text-accent hover:text-accent-dark underline cursor-pointer"
                    >
                      show less
                    </button>
                  </>
                ) : (
                  <>
                    {(myProfile as any).interests.slice(0, 3).map((interest: string) => (
                      <span
                        key={interest}
                        className="text-xs bg-accent text-white px-2 py-1 rounded-full"
                      >
                        {interest}
                      </span>
                    ))}
                    {(myProfile as any).interests.length > 3 && (
                      <button
                        onClick={() => setShowInterestsExpanded(true)}
                        className="text-xs text-accent hover:text-accent-dark underline cursor-pointer"
                      >
                        +{(myProfile as any).interests.length - 3} more
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex mb-6">
          <button className="flex-1 bg-gray-100 py-1.5 rounded-lg text-sm font-medium mr-2">Edit Profile</button>
          <button
            onClick={() => setShowInterestManagement(true)}
            className="flex-1 bg-gray-100 py-1.5 rounded-lg text-sm font-medium"
          >
            Manage Interests
          </button>
        </div>

        {/* My Interests Section - Moved here for better UX */}
        <ComprehensiveInterests />

        <div className="flex justify-around border-t border-gray-200 pt-3 mb-4">
          <button
            onClick={() => showProfileTab('posts')}
            className={`profile-tab ${activeTab === 'posts' ? 'tab-active text-accent' : 'text-gray-600'}`}
          >
            <i className="fas fa-th-large"></i>
          </button>
          <button
            onClick={() => showProfileTab('saved')}
            className={`profile-tab ${activeTab === 'saved' ? 'tab-active text-accent' : 'text-gray-600'}`}
          >
            <i className="fas fa-bookmark"></i>
          </button>
          <button
            onClick={() => showProfileTab('interests')}
            className={`profile-tab ${activeTab === 'interests' ? 'tab-active text-accent' : 'text-gray-600'}`}
          >
            <i className="fas fa-heart"></i>
          </button>
          <button
            onClick={() => showProfileTab('followers')}
            className={`profile-tab ${activeTab === 'followers' ? 'tab-active text-accent' : 'text-gray-600'}`}
          >
            <i className="fas fa-users"></i>
          </button>
          <button
            onClick={() => showProfileTab('following')}
            className={`profile-tab ${activeTab === 'following' ? 'tab-active text-accent' : 'text-gray-600'}`}
          >
            <i className="fas fa-user-plus"></i>
          </button>
        </div>

        {/* My Posts */}
        {activeTab === 'posts' && (
          <div className="py-4">
            {myArticles === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : myArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full border-2 border-black mb-3 flex items-center justify-center">
                  <i className="fas fa-newspaper text-2xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-2">No Posts Yet</h3>
                <p className="text-gray-500 text-center max-w-xs">Start sharing your thoughts and stories with the world.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myArticles.map((article) => (
                  <div key={article._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white">
                        <i className="fas fa-newspaper"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                              Article
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(article.createdAt)}
                            </span>
                            {article.isGated && (
                              <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                                Premium
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteArticle(article._id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete article"
                          >
                            <i className="fas fa-trash text-sm"></i>
                          </button>
                        </div>
                        <h4 className="font-medium">{article.title}</h4>
                        {article.subtitle && (
                          <p className="text-sm text-gray-600">{article.subtitle}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{article.views} views</span>
                          <span>{article.readTimeMin} min read</span>
                          {article.tags.length > 0 && (
                            <span>{article.tags.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved Posts */}
        {activeTab === 'saved' && (
          <div className="py-4">
            {bookmarks === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full border-2 border-black mb-3 flex items-center justify-center">
                  <i className="fas fa-bookmark text-2xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-2">Saved Posts</h3>
                <p className="text-gray-500 text-center max-w-xs">Save photos and videos that you want to see again. Only you can see what you've saved.</p>
              </div>
            ) : (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">My Bookmarks</h3>
                <div className="space-y-4">
                  {bookmarks.map((bookmark) => (
                    <div key={bookmark._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-white">
                          <i className={`fas ${bookmark.type === 'article' ? 'fa-newspaper' : 'fa-video'}`}></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                              {bookmark.type === 'article' ? 'Article' : 'Reel'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(bookmark.createdAt)}
                            </span>
                          </div>
                          <h4 className="font-medium">
                            {bookmark.type === 'article'
                              ? bookmark.content.title
                              : bookmark.content.caption || 'Untitled Reel'
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            by {bookmark.content.author.username || bookmark.content.author.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Followers */}
        {activeTab === 'followers' && (
          <div className="py-4">
            {myFollowers === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : myFollowers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full border-2 border-black mb-3 flex items-center justify-center">
                  <i className="fas fa-users text-2xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-2">No Followers Yet</h3>
                <p className="text-gray-500 text-center max-w-xs">Share great content to attract followers.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Followers ({myFollowers.length})</h3>
                {myFollowers.map((follower) => (
                  <FollowerCard key={follower._id} follower={follower} formatTimeAgo={formatTimeAgo} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comprehensive Interests Tab */}
        {activeTab === 'interests' && (
          <div className="py-4">
            <ComprehensiveInterests showFullView={true} />
          </div>
        )}

        {/* Following */}
        {activeTab === 'following' && (
          <div className="py-4">
            {myFollowing === undefined ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : myFollowing.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <div className="w-16 h-16 rounded-full border-2 border-black mb-3 flex items-center justify-center">
                  <i className="fas fa-user-plus text-2xl"></i>
                </div>
                <h3 className="font-bold text-xl mb-2">Not Following Anyone</h3>
                <p className="text-gray-500 text-center max-w-xs">Discover and follow interesting people to see their content.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold mb-4">Following ({myFollowing.length})</h3>
                {myFollowing.map((following) => (
                  <FollowingCard key={following._id} following={following} formatTimeAgo={formatTimeAgo} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Interest Management Modal */}
      {showInterestManagement && (
        <InterestManagement
          currentInterests={(myProfile as any)?.interests || []}
          onClose={() => setShowInterestManagement(false)}
          onUpdate={() => {
            // The profile will automatically refresh due to the query
          }}
        />
      )}
    </div>
  );
}

// Helper component for follower cards
function FollowerCard({ follower, formatTimeAgo }: { follower: any, formatTimeAgo: (timestamp: number) => string }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    follower.profile?.avatar ? { storageId: follower.profile.avatar } : "skip"
  );

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <img
        src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
        alt="Follower"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-medium">{follower.profile?.name || follower.user?.name || 'User'}</h4>
        {follower.profile?.username && (
          <p className="text-sm text-gray-600">@{follower.profile.username}</p>
        )}
        <p className="text-xs text-gray-500">
          Followed {formatTimeAgo(follower.createdAt)}
        </p>
      </div>
    </div>
  );
}

// Helper component for following cards
function FollowingCard({ following, formatTimeAgo }: { following: any, formatTimeAgo: (timestamp: number) => string }) {
  const avatarUrl = useQuery(
    api.files.getFileUrl,
    following.profile?.avatar ? { storageId: following.profile.avatar } : "skip"
  );

  return (
    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
      <img
        src={avatarUrl || "https://randomuser.me/api/portraits/women/44.jpg"}
        alt="Following"
        className="w-12 h-12 rounded-full object-cover"
      />
      <div className="flex-1">
        <h4 className="font-medium">{following.profile?.name || following.user?.name || 'User'}</h4>
        {following.profile?.username && (
          <p className="text-sm text-gray-600">@{following.profile.username}</p>
        )}
        <p className="text-xs text-gray-500">
          Following since {formatTimeAgo(following.createdAt)}
        </p>
      </div>
    </div>
  );
}