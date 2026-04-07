import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface PatientReferralsListProps {
  onBack: () => void;
  onSelectExpert: (referralId: Id<"referrals">, expertId: Id<"users">) => void;
}

export function PatientReferralsList({ onBack, onSelectExpert }: PatientReferralsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReferral, setSelectedReferral] = useState<any>(null);

  const referrals = useQuery(
    api.referrals.getPatientReferrals,
    statusFilter === 'all' ? {} : { status: statusFilter }
  );

  const declineReferral = useMutation(api.referrals.declineReferral);

  const handleDecline = async (referralId: Id<"referrals">) => {
    if (!confirm('Are you sure you want to decline this referral?')) {
      return;
    }

    const reason = prompt('Optional: Please provide a reason for declining');

    try {
      await declineReferral({
        referralId,
        reason: reason || undefined,
      });
      alert('Referral declined');
    } catch (error: any) {
      alert(error.message || 'Failed to decline referral');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'DECLINED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!referrals) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-accent hover:underline mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">My Referrals</h1>
          <p className="text-gray-600 mt-1">Expert referrals from your healthcare providers</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Status Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user-md text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No referrals found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "You haven't received any referrals yet"
                : `No ${statusFilter.toLowerCase()} referrals`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div
                key={referral._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {referral.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>Referred by:</span>
                      <span className="font-medium">
                        {referral.referringExpert.profile?.name ||
                          referral.referringExpert.profile?.username}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>
                        {referral.referringExpert.subscription?.jobTitle}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      referral.status
                    )}`}
                  >
                    {referral.status}
                  </span>
                </div>

                {/* Selected Expert (if accepted) */}
                {referral.selectedExpert && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      Selected Expert:
                    </h4>
                    <div className="flex items-center space-x-3">
                      {referral.selectedExpert.profile?.avatar ? (
                        <img
                          src={referral.selectedExpert.profile.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-white"></i>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {referral.selectedExpert.profile?.name ||
                            referral.selectedExpert.profile?.username}
                        </p>
                        <p className="text-sm text-gray-600">
                          {referral.selectedExpert.subscription?.jobTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Experts (if pending) */}
                {referral.status === 'PENDING' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Choose an Expert ({referral.suggestedExpertsDetails.length} options):
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {referral.suggestedExpertsDetails.map((expert: any) => (
                        <div
                          key={expert.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-accent transition-colors"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            {expert.profile?.avatar ? (
                              <img
                                src={expert.profile.avatar}
                                alt=""
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-white"></i>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {expert.profile?.name || expert.profile?.username}
                              </p>
                              <p className="text-sm text-gray-600 truncate">
                                {expert.subscription?.jobTitle}
                              </p>
                            </div>
                          </div>

                          {expert.subscription?.specialization && (
                            <p className="text-xs text-gray-500 mb-2">
                              {expert.subscription.specialization}
                            </p>
                          )}

                          <div className="text-sm text-gray-700 mb-3">
                            <span className="font-semibold">
                              ${expert.subscription?.oneOnOnePrice || expert.subscription?.sessionPrice}
                            </span>
                            <span className="text-gray-500"> /hour</span>
                          </div>

                          <button
                            onClick={() => onSelectExpert(referral._id, expert.id)}
                            className="w-full bg-accent text-white py-2 rounded-lg hover:bg-accent/90 transition-colors text-sm"
                          >
                            Select & Book
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleDecline(referral._id)}
                      className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      Decline All Suggestions
                    </button>
                  </div>
                )}

                {/* Date */}
                <div className="mt-4 text-xs text-gray-400">
                  Received {new Date(referral.createdAt).toLocaleDateString()} at{' '}
                  {new Date(referral.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
