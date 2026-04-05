import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface ExpertRequestDetailViewProps {
  requestId: Id<'expertRequests'>;
  circleId: Id<'circles'>;
  onBack?: () => void;
}

export function ExpertRequestDetailView({ requestId, circleId, onBack }: ExpertRequestDetailViewProps) {
  const [showEscrowModal, setShowEscrowModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const circle = useQuery(api.circles.getCircleById, { circleId });
  const requests = useQuery(api.expertRequests.getCircleExpertRequests, { circleId });
  const applications = useQuery(api.expertRequests.getRequestApplications, { requestId });

  const acceptApplication = useMutation(api.expertRequests.acceptExpertApplication);
  const rejectApplication = useMutation(api.expertRequests.rejectExpertApplication);
  const completeRequest = useMutation(api.expertRequests.completeExpertRequest);
  const cancelRequest = useMutation(api.expertRequests.cancelExpertRequest);

  const request = requests?.find(r => r._id === requestId);

  const handleAcceptApplication = async (applicationId: Id<'expertApplications'>) => {
    if (!confirm('Accept this application? This will move funds to escrow and start the contract.')) return;
    
    try {
      await acceptApplication({ applicationId });
      setShowEscrowModal(true);
    } catch (error: any) {
      alert(error.message || 'Failed to accept application');
    }
  };

  const handleRejectApplication = async (applicationId: Id<'expertApplications'>) => {
    if (!confirm('Reject this application?')) return;
    
    try {
      await rejectApplication({ applicationId });
      alert('Application rejected');
    } catch (error: any) {
      alert(error.message || 'Failed to reject application');
    }
  };

  const handleCompleteRequest = async () => {
    if (!confirm('Mark this request as completed? This will release funds from escrow to the expert.')) return;
    
    try {
      const result = await completeRequest({ requestId });
      setShowCompleteModal(false);
      if (result.success) {
        alert(`Request completed! ${result.amountReleased} ${result.currency} released to expert.`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to complete request');
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Cancel this request? If in progress, funds will be returned from escrow.')) return;
    
    try {
      const result = await cancelRequest({ requestId });
      if (result.success) {
        if (result.refunded) {
          alert(`Request cancelled. ${result.refundAmount} ${result.refundCurrency} returned to your wallet.`);
        } else {
          alert('Request cancelled.');
        }
      }
      onBack?.();
    } catch (error: any) {
      alert(error.message || 'Failed to cancel request');
    }
  };

  if (!request || !applications) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isRequester = request.requester.id === circle?.membership?.userId;
  const contractStartDate = request.status === 'IN_PROGRESS' && request.updatedAt 
    ? new Date(request.updatedAt) 
    : null;
  const contractEndDate = contractStartDate && request.duration
    ? new Date(contractStartDate.getTime() + request.duration * 60 * 60 * 1000)
    : null;
  const daysRemaining = contractEndDate
    ? Math.ceil((contractEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
                <i className="fas fa-arrow-left text-xl"></i>
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Expert Request Details</h1>
              <p className="text-sm text-gray-600">{request.title}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Request Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{request.title}</h2>
              <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                request.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                request.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-accent">
                {request.agreedAmount} {request.agreedCurrency}
              </p>
              {request.duration && (
                <p className="text-sm text-gray-600">{request.duration} hours</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
          </div>

          {request.tags && request.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {request.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contract Timeline (if in progress) */}
          {request.status === 'IN_PROGRESS' && contractStartDate && contractEndDate && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-3">Contract Timeline</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-700 mb-1">Started</p>
                  <p className="font-semibold text-blue-900">
                    {contractStartDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 mb-1">Expected End</p>
                  <p className="font-semibold text-blue-900">
                    {contractEndDate.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-blue-700 mb-1">Time Remaining</p>
                  <p className={`font-semibold ${
                    daysRemaining && daysRemaining < 3 ? 'text-red-600' : 'text-blue-900'
                  }`}>
                    {daysRemaining !== null && daysRemaining >= 0 
                      ? `${daysRemaining} days` 
                      : 'Overdue'}
                  </p>
                </div>
              </div>
              {daysRemaining !== null && daysRemaining < 0 && (
                <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  Contract duration has passed. Please review and complete or extend.
                </div>
              )}
            </div>
          )}

          {/* Selected Expert (if in progress) */}
          {request.selectedExpert && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-900 mb-3">Selected Expert</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  {request.selectedExpert.avatar ? (
                    <img
                      src={request.selectedExpert.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <i className="fas fa-user text-gray-400"></i>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    {request.selectedExpert.name || request.selectedExpert.username}
                  </p>
                  <p className="text-sm text-gray-600">@{request.selectedExpert.username}</p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white border border-green-300 rounded">
                <p className="text-sm text-green-800">
                  <i className="fas fa-lock mr-2"></i>
                  Funds in escrow: <strong>{request.agreedAmount} {request.agreedCurrency}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Applications */}
        {isRequester && request.status === 'OPEN' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Applications ({applications.length})
            </h2>

            {applications.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-inbox text-4xl text-gray-300 mb-3"></i>
                <p className="text-gray-600">No applications yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div
                    key={application._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors"
                  >
                    {/* Applicant Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                        {application.expert.avatar ? (
                          <img
                            src={application.expert.avatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <i className="fas fa-user text-gray-400"></i>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-800">
                            {application.expert.name || application.expert.username}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                            application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">@{application.expert.username}</p>
                        {application.expert.bio && (
                          <p className="text-sm text-gray-500 mt-1">{application.expert.bio}</p>
                        )}
                      </div>
                      {application.proposedAmount && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Proposed</p>
                          <p className="text-lg font-bold text-accent">
                            {application.proposedAmount} {request.agreedCurrency}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Cover Letter</h4>
                      <div className="p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                          {application.coverLetter}
                        </p>
                      </div>
                    </div>

                    {/* Application Date */}
                    <p className="text-xs text-gray-400 mb-3">
                      Applied {new Date(application.createdAt).toLocaleDateString()} at{' '}
                      {new Date(application.createdAt).toLocaleTimeString()}
                    </p>

                    {/* Actions */}
                    {application.status === 'PENDING' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptApplication(application._id)}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <i className="fas fa-check mr-2"></i>
                          Accept & Start Contract
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application._id)}
                          className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <i className="fas fa-times mr-2"></i>
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions for Requester */}
        {isRequester && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
            <div className="space-y-3">
              {request.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <i className="fas fa-check-circle mr-2"></i>
                  Complete Request & Release Funds
                </button>
              )}
              {request.status !== 'COMPLETED' && (
                <button
                  onClick={handleCancelRequest}
                  className="w-full border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <i className="fas fa-ban mr-2"></i>
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Escrow Modal */}
      {showEscrowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lock text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Funds Moved to Escrow</h3>
              <p className="text-gray-600">
                {request.agreedAmount} {request.agreedCurrency} has been moved to escrow
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Expert has been notified</li>
                <li>✓ Contract duration: {request.duration} hours</li>
                <li>✓ Funds are held securely in escrow</li>
                <li>✓ Complete the request to release funds</li>
              </ul>
            </div>

            <button
              onClick={() => setShowEscrowModal(false)}
              className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent/90"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-check-circle text-2xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Complete Request?</h3>
              <p className="text-gray-600">
                This will release {request.agreedAmount} {request.agreedCurrency} from escrow to the expert
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Make sure the work is completed to your satisfaction before releasing funds
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteRequest}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
              >
                Release Funds
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
