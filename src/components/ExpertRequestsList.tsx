import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { useState } from 'react';

interface ExpertRequestsListProps {
  onRequestSelect?: (requestId: Id<'expertRequests'>) => void;
}

export function ExpertRequestsList({ onRequestSelect }: ExpertRequestsListProps) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedAmount, setProposedAmount] = useState('');

  const requests = useQuery(api.expertRequests.getAllOpenExpertRequests, { limit: 20 });
  const applyToRequest = useMutation(api.expertRequests.applyToExpertRequest);

  const handleApply = async () => {
    if (!selectedRequest || !coverLetter.trim()) {
      alert('Please write a cover letter');
      return;
    }

    try {
      await applyToRequest({
        requestId: selectedRequest._id,
        coverLetter: coverLetter.trim(),
        proposedAmount: proposedAmount ? parseFloat(proposedAmount) : undefined,
      });

      alert('Application submitted successfully!');
      setShowApplyModal(false);
      setSelectedRequest(null);
      setCoverLetter('');
      setProposedAmount('');
    } catch (error: any) {
      alert(error.message || 'Failed to submit application');
    }
  };

  if (requests === undefined) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (requests.requests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <i className="fas fa-briefcase text-6xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Expert Requests</h3>
        <p className="text-gray-600">Check back later for new opportunities</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.requests.map((request) => (
          <div
            key={request._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                  {request.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <i className="fas fa-users"></i>
                  <span className="truncate">{request.circle.name}</span>
                </div>
              </div>
              <div className="text-right ml-2">
                <p className="text-xl font-bold text-accent">
                  {request.agreedAmount}
                </p>
                <p className="text-xs text-gray-600">{request.agreedCurrency}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {request.description}
            </p>

            {/* Tags */}
            {request.tags && request.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {request.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {request.duration && (
                  <span>
                    <i className="far fa-clock mr-1"></i>
                    {request.duration}h
                  </span>
                )}
                <span>
                  <i className="fas fa-user-friends mr-1"></i>
                  {request.applicationCount} {request.applicationCount === 1 ? 'applicant' : 'applicants'}
                </span>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-4">
              {request.userHasApplied ? (
                <div className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg text-center text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  Applied ({request.userApplicationStatus})
                </div>
              ) : (
                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowApplyModal(true);
                  }}
                  className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {showApplyModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Apply to Expert Request
                  </h2>
                  <h3 className="text-lg text-gray-700">{selectedRequest.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <i className="fas fa-users mr-1"></i>
                    {selectedRequest.circle.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedRequest(null);
                    setCoverLetter('');
                    setProposedAmount('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Request Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-lg font-bold text-accent">
                      {selectedRequest.agreedAmount} {selectedRequest.agreedCurrency}
                    </p>
                  </div>
                  {selectedRequest.duration && (
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {selectedRequest.duration} hours
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700 text-sm">{selectedRequest.description}</p>
                </div>
              </div>

              {/* Application Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Explain why you're a good fit for this request..."
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Highlight your relevant experience and skills
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Amount (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={proposedAmount}
                      onChange={(e) => setProposedAmount(e.target.value)}
                      placeholder={`Leave empty to accept ${selectedRequest.agreedAmount}`}
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                      {selectedRequest.agreedCurrency}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    You can propose a different amount if you'd like to negotiate
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedRequest(null);
                    setCoverLetter('');
                    setProposedAmount('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  disabled={!coverLetter.trim()}
                  className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
