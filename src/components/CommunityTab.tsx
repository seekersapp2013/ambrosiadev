import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { CircleCreationForm } from './CircleCreationForm';
import { CircleDetailView } from './CircleDetailView';
import { CircleChatInterface } from './CircleChatInterface';
import { CircleMembersView } from './CircleMembersView';
import { ExpertRequestsView } from './ExpertRequestsView';
import { CircleSettingsView } from './CircleSettingsView';
import { CircleEventsView } from './CircleEventsView';

interface CommunityTabProps {
  onNavigate?: (screen: string, data?: any) => void;
}

type CommunityView = 'browse' | 'my-circles' | 'create' | 'circle-detail' | 'circle-chat' | 'circle-members' | 'expert-requests' | 'circle-settings' | 'circle-events';
type ViewData = {
  circleId?: Id<'circles'>;
};

export function CommunityTab({ onNavigate }: CommunityTabProps) {
  const [currentView, setCurrentView] = useState<CommunityView>('browse');
  const [viewData, setViewData] = useState<ViewData>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [accessFilter, setAccessFilter] = useState<'FREE' | 'PAID' | undefined>(undefined);

  const handleNavigate = (view: string, data?: any) => {
    setCurrentView(view as CommunityView);
    setViewData(data || {});
  };

  const publicCircles = useQuery(api.circles?.getPublicCircles, {
    limit: 20,
    offset: 0,
    accessType: accessFilter,
    searchTerm: searchTerm || undefined,
  });

  const myCircles = useQuery(api.circles?.getMyCircles);

  const renderNavigation = () => (
    <div className="bg-white border-b shadow-sm sticky top-0 z-10">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Community Circles</h1>
          <nav className="flex flex-wrap gap-2 sm:gap-4">
            <button
              onClick={() => handleNavigate('browse')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'browse'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-compass mr-2"></i>
              Browse Circles
            </button>
            <button
              onClick={() => handleNavigate('my-circles')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'my-circles'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <i className="fas fa-users mr-2"></i>
              My Circles
            </button>
            <button
              onClick={() => handleNavigate('create')}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Create Circle
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const renderBrowseCircles = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search and Filters */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search circles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <i className="fas fa-search absolute left-3 top-2.5 text-gray-400"></i>
          </div>
          
          <select
            value={accessFilter || ''}
            onChange={(e) => setAccessFilter(e.target.value as 'FREE' | 'PAID' | undefined || undefined)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">All Circles</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Circles Grid */}
      {publicCircles === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : publicCircles.circles.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No circles found</h3>
          <p className="text-gray-600">Try adjusting your search or create a new circle</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicCircles.circles.map((circle: any) => (
            <div
              key={circle._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border p-6 cursor-pointer"
              onClick={() => handleNavigate('circle-detail', { circleId: circle._id })}
            >
              {circle.coverImage && (
                <div className="w-full h-32 bg-gray-200 rounded-lg mb-4"></div>
              )}
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{circle.name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{circle.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <i className="fas fa-users mr-2"></i>
                  <span>{circle.currentMembers} members</span>
                </div>
                
                {circle.accessType === 'PAID' ? (
                  <span className="text-accent font-semibold">
                    ${circle.price} {circle.priceCurrency}
                  </span>
                ) : (
                  <span className="text-green-600 font-semibold">Free</span>
                )}
              </div>

              {circle.tags && circle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {circle.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <button className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors">
                Join Circle
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMyCircles = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">My Circles</h2>
      
      {myCircles === undefined ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
      ) : myCircles.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No circles yet</h3>
          <p className="text-gray-600 mb-6">Join or create a circle to get started</p>
          <button
            onClick={() => handleNavigate('browse')}
            className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors"
          >
            Browse Circles
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myCircles.map((circle: any) => (
            <div
              key={circle._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border p-6 cursor-pointer"
              onClick={() => handleNavigate('circle-chat', { circleId: circle._id })}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{circle.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  circle.membership.role === 'CREATOR' ? 'bg-purple-100 text-purple-800' :
                  circle.membership.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                  circle.membership.role === 'MODERATOR' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {circle.membership.role}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{circle.description}</p>
              
              <div className="flex items-center text-sm text-gray-600">
                <i className="fas fa-users mr-2"></i>
                <span>{circle.currentMembers} members</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateCircle = () => (
    <CircleCreationForm
      onSuccess={(circleId) => handleNavigate('circle-detail', { circleId: circleId as Id<'circles'> })}
      onCancel={() => handleNavigate('browse')}
    />
  );

  // Render different views based on currentView
  if (currentView === 'circle-detail' && viewData.circleId) {
    return (
      <CircleDetailView
        circleId={viewData.circleId}
        onNavigate={handleNavigate}
        onBack={() => handleNavigate('browse')}
      />
    );
  }

  if (currentView === 'circle-chat' && viewData.circleId) {
    return (
      <CircleChatInterface
        circleId={viewData.circleId}
        onNavigate={handleNavigate}
        onBack={() => handleNavigate('my-circles')}
      />
    );
  }

  if (currentView === 'circle-members' && viewData.circleId) {
    return (
      <CircleMembersView
        circleId={viewData.circleId}
        onBack={() => handleNavigate('circle-detail', { circleId: viewData.circleId })}
      />
    );
  }

  if (currentView === 'expert-requests' && viewData.circleId) {
    return (
      <ExpertRequestsView
        circleId={viewData.circleId}
        onBack={() => handleNavigate('circle-detail', { circleId: viewData.circleId })}
      />
    );
  }

  if (currentView === 'circle-settings' && viewData.circleId) {
    return (
      <CircleSettingsView
        circleId={viewData.circleId}
        onBack={() => handleNavigate('circle-detail', { circleId: viewData.circleId })}
        onDeleted={() => handleNavigate('my-circles')}
      />
    );
  }

  if (currentView === 'circle-events' && viewData.circleId) {
    return (
      <CircleEventsView
        circleId={viewData.circleId}
        onBack={() => handleNavigate('circle-detail', { circleId: viewData.circleId })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      {currentView === 'browse' && renderBrowseCircles()}
      {currentView === 'my-circles' && renderMyCircles()}
      {currentView === 'create' && renderCreateCircle()}
    </div>
  );
}
