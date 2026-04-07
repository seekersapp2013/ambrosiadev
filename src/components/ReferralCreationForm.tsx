import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { UserSearchDropdown } from './UserSearchDropdown';

interface ReferralCreationFormProps {
  patientId: Id<"users">;
  onBack: () => void;
  onSuccess: () => void;
}

export function ReferralCreationForm({ patientId, onBack, onSuccess }: ReferralCreationFormProps) {
  const [title, setTitle] = useState('');
  const [healthNote, setHealthNote] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<any[]>([]);
  const [searchKey, setSearchKey] = useState(0); // Force re-render of search dropdown

  const createReferral = useMutation(api.referrals.createReferral);

  // Get patient profile
  const patientProfile = useQuery(api.profiles.searchProfiles, { query: "" });
  const patient = patientProfile?.find(p => p.userId === patientId);

  const handleAddExpert = (expert: any) => {
    // Check if expert already added
    if (selectedExperts.find(e => e._id === expert._id)) {
      alert('This expert has already been added');
      return;
    }

    setSelectedExperts([...selectedExperts, expert]);
    setSearchKey(prev => prev + 1); // Reset search dropdown
  };

  const handleRemoveExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(e => e._id !== expertId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedExperts.length < 3) {
      alert('Please select at least 3 experts for the patient to choose from');
      return;
    }

    try {
      await createReferral({
        patientId,
        title: title.trim(),
        healthNote: healthNote.trim(),
        suggestedExperts: selectedExperts.map(e => e._id as Id<"users">),
      });

      alert('Referral created successfully!');
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Failed to create referral');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button onClick={onBack} className="text-accent hover:underline mb-2">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Referral</h1>
          <p className="text-gray-600 mt-1">Refer patient to other specialists</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Patient Info */}
        {patient && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Referring Patient:</h3>
            <div className="flex items-center space-x-3">
              {patient.avatarUrl ? (
                <img
                  src={patient.avatarUrl}
                  alt={patient.name || patient.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {(patient.name || patient.username)?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {patient.name || patient.username}
                </p>
                <p className="text-sm text-gray-600">@{patient.username}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referral Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gynecology Consultation Needed"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Health Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Health Note *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Provide a brief overview of the patient's health challenges. This will only be visible to the expert the patient selects.
            </p>
            <textarea
              value={healthNote}
              onChange={(e) => setHealthNote(e.target.value)}
              placeholder="Brief description of patient's condition and why they need specialist care..."
              rows={6}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Expert Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggest Experts (Minimum 3) *
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Search and add at least 3 experts for the patient to choose from
            </p>
            
            <UserSearchDropdown
              key={searchKey}
              onUserSelect={handleAddExpert}
              placeholder="Search by name, username, or profession..."
              label=""
            />
          </div>

          {/* Selected Experts */}
          {selectedExperts.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Selected Experts ({selectedExperts.length})
              </h3>
              <div className="space-y-2">
                {selectedExperts.map((expert, index) => (
                  <div
                    key={expert._id}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}.
                      </span>
                      {expert.avatarUrl ? (
                        <img
                          src={expert.avatarUrl}
                          alt={expert.name || expert.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {(expert.name || expert.username)?.charAt(0)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {expert.name || expert.username}
                        </p>
                        <p className="text-sm text-gray-600">@{expert.username}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExpert(expert._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>

              {selectedExperts.length < 3 && (
                <p className="text-sm text-orange-600 mt-2">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Please add at least {3 - selectedExperts.length} more expert(s)
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedExperts.length < 3}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Create Referral
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
