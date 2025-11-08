import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { InterestManagement } from "./InterestManagement";

interface ComprehensiveInterestsProps {
  showFullView?: boolean;
}

export function ComprehensiveInterests({ showFullView = false }: ComprehensiveInterestsProps) {
  const [showInterestManagement, setShowInterestManagement] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  

  const comprehensiveInterests = useQuery(api.userInterests.getComprehensiveUserInterests, {});
  const myFollowers = useQuery(api.profiles.getMyFollowers);
  const myFollowing = useQuery(api.profiles.getMyFollowing);

  if (!comprehensiveInterests) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading interests...</p>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const renderCollapsibleSection = (
    title: string,
    icon: string,
    count: number,
    sectionKey: string,
    content: React.ReactNode
  ) => (
    <div className="border border-gray-200 rounded-lg mb-3">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <i className={`fas ${icon} text-accent`}></i>
          <span className="font-medium">{title}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            {count}
          </span>
        </div>
        <i className={`fas fa-chevron-${activeSection === sectionKey ? 'up' : 'down'} text-gray-400`}></i>
      </button>
      {activeSection === sectionKey && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {content}
        </div>
      )}
    </div>
  );

  const renderTagList = (tags: Array<{ tag: string; count: number }>, emptyMessage: string) => (
    <div className="mt-3">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <span
              key={tag}
              className="bg-accent text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1"
            >
              <span>{tag}</span>
              <span className="bg-white bg-opacity-20 px-1 rounded text-xs">{count}</span>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-2">{emptyMessage}</p>
      )}
    </div>
  );

  const renderUserList = (users: any[], emptyMessage: string, type: 'followers' | 'following') => (
    <div className="mt-3">
      {users && users.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {users.slice(0, 10).map((user) => (
            <div key={user._id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white text-sm">
                {(user.profile?.name || user.user?.name || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{user.profile?.name || user.user?.name || 'User'}</p>
                {user.profile?.username && (
                  <p className="text-xs text-gray-500">@{user.profile.username}</p>
                )}
              </div>
            </div>
          ))}
          {users.length > 10 && (
            <p className="text-xs text-gray-500 text-center">
              +{users.length - 10} more {type}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-sm mt-2">{emptyMessage}</p>
      )}
    </div>
  );

  const renderSocialGraph = () => (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-blue-600">
            {comprehensiveInterests.socialGraph.followingCount}
          </div>
          <div className="text-xs text-blue-500">Following</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {comprehensiveInterests.socialGraph.followersCount}
          </div>
          <div className="text-xs text-green-500">Followers</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-600">
            {comprehensiveInterests.socialGraph.mutualConnections}
          </div>
          <div className="text-xs text-purple-500">Mutual</div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Network Strength</span>
          <span className="text-sm text-gray-600">
            {comprehensiveInterests.socialGraph.networkStrength}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${comprehensiveInterests.socialGraph.networkStrength}%` }}
          ></div>
        </div>
      </div>

      {comprehensiveInterests.socialGraph.connectionInteractions.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">Top Interactions</h4>
          <div className="space-y-2">
            {comprehensiveInterests.socialGraph.connectionInteractions
              .filter(conn => conn.interactions.totalInteractions > 0)
              .slice(0, 5)
              .map((conn, index) => (
                <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                  <span>User {String(conn.userId).slice(-4)}</span>
                  <span className="text-gray-600">
                    {conn.interactions.totalInteractions} interactions
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  if (!showFullView) {
    // Compact view for profile header
    return (
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">My Interests</h3>
          <button
            onClick={() => setShowInterestManagement(true)}
            className="text-accent text-sm font-medium hover:text-accent-dark"
          >
            Manage
          </button>
        </div>
        
        {/* Static Interests Preview */}
        {comprehensiveInterests.staticInterests.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Health Topics:</p>
            <div className="flex flex-wrap gap-1">
              {comprehensiveInterests.staticInterests.slice(0, 4).map((interest) => (
                <span
                  key={interest}
                  className="text-xs bg-accent text-white px-2 py-1 rounded-full"
                >
                  {interest}
                </span>
              ))}
              {comprehensiveInterests.staticInterests.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{comprehensiveInterests.staticInterests.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="font-medium text-accent">
              {comprehensiveInterests.dynamicInterests.contentInteractions.topContentInterests.length}
            </div>
            <div className="text-gray-500">Content Tags</div>
          </div>
          <div>
            <div className="font-medium text-accent">
              {comprehensiveInterests.socialGraph.followingCount}
            </div>
            <div className="text-gray-500">Following</div>
          </div>
          <div>
            <div className="font-medium text-accent">
              {comprehensiveInterests.dynamicInterests.bookingInteractions.clientBookingsCount + 
               comprehensiveInterests.dynamicInterests.bookingInteractions.providerBookingsCount}
            </div>
            <div className="text-gray-500">Bookings</div>
          </div>
        </div>

        {/* Interest Management Modal */}
        {showInterestManagement && (
          <InterestManagement
            currentInterests={comprehensiveInterests.staticInterests}
            onClose={() => setShowInterestManagement(false)}
            onUpdate={() => {
              // The profile will automatically refresh due to the query
            }}
          />
        )}
      </div>
    );
  }

  // Full view for interests tab
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">My Comprehensive Interests</h2>
        <button
          onClick={() => setShowInterestManagement(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent-dark"
        >
          Manage Health Topics
        </button>
      </div>

      {/* Static Health Interests */}
      {renderCollapsibleSection(
        "Health Topics",
        "fa-heart",
        comprehensiveInterests.staticInterests.length,
        "health",
        <div className="mt-3">
          {comprehensiveInterests.staticInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {comprehensiveInterests.staticInterests.map((interest) => (
                <span
                  key={interest}
                  className="bg-accent text-white px-3 py-2 rounded-full text-sm font-medium"
                >
                  {interest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No health topics selected yet.</p>
          )}
        </div>
      )}

      {/* My Following */}
      {renderCollapsibleSection(
        "My Following",
        "fa-user-plus",
        myFollowing?.length || 0,
        "following",
        renderUserList(myFollowing || [], "Not following anyone yet.", "following")
      )}

      {/* My Followers */}
      {renderCollapsibleSection(
        "My Followers",
        "fa-users",
        myFollowers?.length || 0,
        "followers",
        renderUserList(myFollowers || [], "No followers yet.", "followers")
      )}

      {/* Content Interactions */}
      {renderCollapsibleSection(
        "Content Interests",
        "fa-thumbs-up",
        comprehensiveInterests.dynamicInterests.contentInteractions.topContentInterests.length,
        "content",
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Most Liked Topics</h4>
            {renderTagList(
              comprehensiveInterests.dynamicInterests.contentInteractions.topContentInterests.slice(0, 10),
              "No content interactions yet."
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Bookmarked Topics</h4>
            {renderTagList(
              comprehensiveInterests.dynamicInterests.contentInteractions.bookmarkedTags,
              "No bookmarked content yet."
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Commented Topics</h4>
            {renderTagList(
              comprehensiveInterests.dynamicInterests.contentInteractions.commentedTags,
              "No comments made yet."
            )}
          </div>
        </div>
      )}

      {/* Booking & Events */}
      {renderCollapsibleSection(
        "Bookings & Events",
        "fa-calendar",
        comprehensiveInterests.dynamicInterests.bookingInteractions.clientBookingsCount +
        comprehensiveInterests.dynamicInterests.bookingInteractions.providerBookingsCount,
        "bookings",
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-600">
                {comprehensiveInterests.dynamicInterests.bookingInteractions.clientBookingsCount}
              </div>
              <div className="text-xs text-blue-500">Sessions Booked</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-600">
                {comprehensiveInterests.dynamicInterests.bookingInteractions.providerBookingsCount}
              </div>
              <div className="text-xs text-green-500">Sessions Provided</div>
            </div>
          </div>
          
          {comprehensiveInterests.dynamicInterests.bookingInteractions.eventTags.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Event Topics</h4>
              {renderTagList(
                comprehensiveInterests.dynamicInterests.bookingInteractions.eventTags,
                "No event participation yet."
              )}
            </div>
          )}
          
          {comprehensiveInterests.dynamicInterests.bookingInteractions.providerSpecialization && (
            <div className="bg-purple-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Provider Specialization</h4>
              <p className="text-sm text-purple-700">
                {comprehensiveInterests.dynamicInterests.bookingInteractions.providerSpecialization}
              </p>
              {comprehensiveInterests.dynamicInterests.bookingInteractions.providerJobTitle && (
                <p className="text-xs text-purple-600">
                  {comprehensiveInterests.dynamicInterests.bookingInteractions.providerJobTitle}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Social Graph */}
      {renderCollapsibleSection(
        "Social Network",
        "fa-project-diagram",
        comprehensiveInterests.socialGraph.mutualConnections,
        "social",
        renderSocialGraph()
      )}

      {/* Notification Engagement */}
      {renderCollapsibleSection(
        "Engagement Patterns",
        "fa-bell",
        comprehensiveInterests.dynamicInterests.notificationInteractions.totalNotificationEvents,
        "notifications",
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-yellow-600">
                {comprehensiveInterests.dynamicInterests.notificationInteractions.clickedCount}
              </div>
              <div className="text-xs text-yellow-500">Notifications Clicked</div>
            </div>
            <div className="bg-indigo-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-indigo-600">
                {Math.round(comprehensiveInterests.dynamicInterests.notificationInteractions.engagementRate)}%
              </div>
              <div className="text-xs text-indigo-500">Engagement Rate</div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <i className="fas fa-info-circle mr-2"></i>
              Your engagement patterns help us understand what content interests you most.
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-blue-700 text-sm">
          <i className="fas fa-lightbulb mr-2"></i>
          Your comprehensive interests are automatically updated based on your platform interactions. 
          This helps us provide better content recommendations and connect you with relevant people and opportunities.
        </p>
      </div>

      {/* Interest Management Modal */}
      {showInterestManagement && (
        <InterestManagement
          currentInterests={comprehensiveInterests.staticInterests}
          onClose={() => setShowInterestManagement(false)}
          onUpdate={() => {
            // The profile will automatically refresh due to the query
          }}
        />
      )}
    </div>
  );
}