import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface ExpertReferralsListProps {
  onBack: () => void;
}

type ViewMode = 'sent' | 'received';

export function ExpertReferralsList({ onBack }: ExpertReferralsListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('sent');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const sentReferrals = useQuery(
    api.referrals.getReferringExpertReferrals,
    statusFilter === 'all' ? {} : { status: statusFilter }
  );

  const receivedReferrals = useQuery(
    api.referrals.getSelectedExpertReferrals,
    statusFilter === 'all' ? {} : { status: statusFilter }
  );

  const currentReferrals = viewMode === 'sent' ? sentReferrals : receivedReferrals;

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

  // Calculate total commission earned
  const totalCommissionEarned = sentReferrals
    ?.filter((r) => r.commissionPaid)
    .reduce((sum, r) => sum + (r.commissionAmount || 0), 0) || 0;

  if (!currentReferrals) {
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
          <h1 className="text-2xl font-bold text-gray-800">Referral Management</h1>
          <p className="text-gray-600 mt-1">Track your sent and received referrals</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Commission Summary (for sent referrals) */}
        {viewMode === 'sent' && totalCommissionEarned > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-green-900">Total Commission Earned</h3>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  ${totalCommissionEarned.toFixed(2)}
                </p>
              </div>
              <div className="text-green-600">
                <i className="fas fa-hand-holding-usd text-4xl"></i>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('sent')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'sent'
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-paper-plane mr-2"></i>
            Sent Referrals
          </button>
          <button
            onClick={() => setViewMode('received')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'received'
                ? 'bg-white text-accent shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-inbox mr-2"></i>
            Received Referrals
          </button>
        </div>

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
        {currentReferrals.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user-md text-2xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No referrals found</h3>
            <p className="text-gray-600">
              {viewMode === 'sent'
                ? "You haven't sent any referrals yet"
                : "You haven't received any referrals yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentReferrals.map((referral) => (
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
                      {viewMode === 'sent' ? (
                        <>
                          <span>Patient:</span>
                          <span className="font-medium">
                            {referral.patient.profile?.name ||
                              referral.patient.profile?.username}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>Referred by:</span>
                          <span className="font-medium">
                            {(referral as any).referringExpert?.profile?.name ||
                              (referral as any).referringExpert?.profile?.username}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{(referral as any).referringExpert?.subscription?.jobTitle}</span>
                        </>
                      )}
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

                {/* Health Note (only for received referrals) */}
                {viewMode === 'received' && referral.healthNote && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      <i className="fas fa-notes-medical mr-2"></i>
                      Health Note:
                    </h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {referral.healthNote}
                    </p>
                  </div>
                )}

                {/* Selected Expert Info */}
                {(referral as any).selectedExpert && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">
                      {viewMode === 'sent' ? 'Patient Selected:' : 'Patient Info:'}
                    </h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {viewMode === 'sent' ? (
                          <>
                            {(referral as any).selectedExpert?.profile?.avatar ? (
                              <img
                                src={(referral as any).selectedExpert.profile.avatar}
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
                                {(referral as any).selectedExpert?.profile?.name ||
                                  (referral as any).selectedExpert?.profile?.username}
                              </p>
                              <p className="text-sm text-gray-600">
                                {(referral as any).selectedExpert?.subscription?.jobTitle}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            {referral.patient.profile?.avatar ? (
                              <img
                                src={referral.patient.profile.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                <i className="fas fa-user text-white"></i>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {referral.patient.profile?.name ||
                                  referral.patient.profile?.username}
                              </p>
                              <p className="text-sm text-gray-600">
                                @{referral.patient.profile?.username}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Commission Info (for sent referrals) */}
                      {viewMode === 'sent' && referral.commissionAmount && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Commission</p>
                          <p className="text-lg font-bold text-green-600">
                            ${referral.commissionAmount.toFixed(2)}
                          </p>
                          {referral.commissionPaid ? (
                            <span className="text-xs text-green-600">
                              <i className="fas fa-check-circle mr-1"></i>
                              Paid
                            </span>
                          ) : (
                            <span className="text-xs text-yellow-600">
                              <i className="fas fa-clock mr-1"></i>
                              Pending
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Date */}
                <div className="text-xs text-gray-400">
                  Created {new Date(referral.createdAt).toLocaleDateString()} at{' '}
                  {new Date(referral.createdAt).toLocaleTimeString()}
                  {referral.completedAt && (
                    <>
                      {' • '}
                      Completed {new Date(referral.completedAt).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
