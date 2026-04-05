import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ExpertRequestDetailView } from './ExpertRequestDetailView';

interface ExpertRequestsViewProps {
  circleId: Id<'circles'>;
  onBack?: () => void;
}

export function ExpertRequestsView({ circleId, onBack }: ExpertRequestsViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<Id<'expertRequests'> | null>(null);

  const circle = useQuery(api.circles.getCircleById, { circleId });
  const requests = useQuery(api.expertRequests.getCircleExpertRequests, { circleId });

  const createRequest = useMutation(api.expertRequests.createExpertRequest);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    agreedAmount: '',
    agreedCurrency: 'USD',
    duration: '',
    tags: '',
  });

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tags = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      await createRequest({
        circleId,
        title: formData.title,
        description: formData.description,
        agreedAmount: parseFloat(formData.agreedAmount),
        agreedCurrency: formData.agreedCurrency,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      setViewMode('list');
    } catch (error: any) {
      alert(error.message || 'Failed to create request');
    }
  };

  if (circle === undefined || requests === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAdmin = circle?.membership && ['CREATOR', 'ADMIN'].includes(circle.membership.role);

  // Show detail view
  if (viewMode === 'detail' && selectedRequestId) {
    return (
      <ExpertRequestDetailView
        requestId={selectedRequestId}
        circleId={circleId}
        onBack={() => {
          setViewMode('list');
          setSelectedRequestId(null);
        }}
      />
    );
  }

  if (viewMode === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button onClick={() => setViewMode('list')} className="text-accent hover:underline">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 mt-2">Create Expert Request</h1>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <form onSubmit={handleCreateRequest} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget *</label>
                <input
                  type="number"
                  value={formData.agreedAmount}
                  onChange={(e) => setFormData({ ...formData, agreedAmount: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Currency</label>
                <select
                  value={formData.agreedCurrency}
                  onChange={(e) => setFormData({ ...formData, agreedCurrency: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent"
                >
                  <option value="USD">USD</option>
                  <option value="NGN">NGN</option>
                  <option value="GBP">GBP</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent/90">
              Create Request
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              {onBack && (
                <button onClick={onBack} className="text-accent hover:underline mb-2">
                  ← Back
                </button>
              )}
              <h1 className="text-2xl font-bold text-gray-800">Expert Requests</h1>
            </div>
            {isAdmin && (
              <button
                onClick={() => setViewMode('create')}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Request
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No expert requests</h3>
            <p className="text-gray-600">
              {isAdmin ? 'Create a request to hire an expert' : 'Check back later'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => (
              <div
                key={request._id}
                onClick={() => {
                  setSelectedRequestId(request._id);
                  setViewMode('detail');
                }}
                className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{request.title}</h3>
                    <span className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${
                      request.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-accent">
                      {request.agreedAmount} {request.agreedCurrency}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{request.description}</p>
                <div className="text-sm text-gray-500">
                  {request.applicationCount} applications
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
