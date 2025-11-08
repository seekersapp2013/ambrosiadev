import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { InterestSelector } from "./InterestSelector";

interface InterestManagementProps {
  currentInterests: string[];
  onClose: () => void;
  onUpdate: () => void;
}

export function InterestManagement({ currentInterests, onClose, onUpdate }: InterestManagementProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentInterests || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateInterests = useMutation(api.profiles.updateInterests);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await updateInterests({ interests: selectedInterests });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating interests:", error);
      alert("Failed to update interests. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const hasChanges = JSON.stringify(selectedInterests.sort()) !== JSON.stringify((currentInterests || []).sort());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Manage Interests</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto">
          <InterestSelector
            selectedInterests={selectedInterests}
            onInterestsChange={setSelectedInterests}
            showTitle={false}
          />
        </div>

        <div className="p-4 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isUpdating}
            className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Saving...
              </div>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}