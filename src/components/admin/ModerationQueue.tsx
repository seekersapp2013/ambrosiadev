import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCanApprove } from "../../hooks/usePermissions";

type ContentType = "all" | "articles" | "reels" | "circles" | "expertRequests" | "bookingSubscribers";

export function ModerationQueue() {
  const [selectedType, setSelectedType] = useState<ContentType>("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const queue = useQuery(
    api.moderationActions.getModerationQueue,
    selectedType === "all" ? {} : { contentType: selectedType }
  );

  const approveContent = useMutation(api.moderationActions.approveContent);
  const rejectContent = useMutation(api.moderationActions.rejectContent);

  const canApproveArticles = useCanApprove("articles");
  const canApproveReels = useCanApprove("reels");
  const canApproveCircles = useCanApprove("circles");
  const canApproveExpertRequests = useCanApprove("expertRequests");
  const canApproveBookingSubscribers = useCanApprove("bookingSubscribers");

  const handleApprove = async (item: any) => {
    try {
      await approveContent({
        contentType: item.contentType,
        contentId: item.contentId,
      });
      alert("Content approved successfully!");
    } catch (error) {
      console.error("Error approving content:", error);
      alert(error instanceof Error ? error.message : "Failed to approve content");
    }
  };

  const handleReject = async () => {
    if (!selectedItem || !rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectContent({
        contentType: selectedItem.contentType,
        contentId: selectedItem.contentId,
        reason: rejectReason.trim(),
      });
      alert("Content rejected successfully!");
      setShowRejectModal(false);
      setSelectedItem(null);
      setRejectReason("");
    } catch (error) {
      console.error("Error rejecting content:", error);
      alert(error instanceof Error ? error.message : "Failed to reject content");
    }
  };

  const openRejectModal = (item: any) => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };

  const canApproveType = (type: string) => {
    switch (type) {
      case "articles":
        return canApproveArticles;
      case "reels":
        return canApproveReels;
      case "circles":
        return canApproveCircles;
      case "expertRequests":
        return canApproveExpertRequests;
      case "bookingSubscribers":
        return canApproveBookingSubscribers;
      default:
        return false;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      articles: "Article",
      reels: "Reel",
      circles: "Circle",
      expertRequests: "Expert Request",
      bookingSubscribers: "Booking Subscriber",
    };
    return labels[type] || type;
  };

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      articles: "fa-newspaper",
      reels: "fa-video",
      circles: "fa-users",
      expertRequests: "fa-user-md",
      bookingSubscribers: "fa-calendar-check",
    };
    return icons[type] || "fa-file";
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Moderation Queue</h2>

        {/* Filter Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <FilterButton
            active={selectedType === "all"}
            onClick={() => setSelectedType("all")}
            label="All"
          />
          {canApproveArticles && (
            <FilterButton
              active={selectedType === "articles"}
              onClick={() => setSelectedType("articles")}
              label="Articles"
            />
          )}
          {canApproveReels && (
            <FilterButton
              active={selectedType === "reels"}
              onClick={() => setSelectedType("reels")}
              label="Reels"
            />
          )}
          {canApproveCircles && (
            <FilterButton
              active={selectedType === "circles"}
              onClick={() => setSelectedType("circles")}
              label="Circles"
            />
          )}
          {canApproveExpertRequests && (
            <FilterButton
              active={selectedType === "expertRequests"}
              onClick={() => setSelectedType("expertRequests")}
              label="Expert Requests"
            />
          )}
          {canApproveBookingSubscribers && (
            <FilterButton
              active={selectedType === "bookingSubscribers"}
              onClick={() => setSelectedType("bookingSubscribers")}
              label="Booking Subscribers"
            />
          )}
        </div>

        {/* Queue Items */}
        {queue === undefined ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Queue is Empty</h3>
            <p className="text-gray-500">No pending content to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map((item: any) => (
              <div
                key={`${item.contentType}-${item.contentId}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        <i className={`fas ${getContentTypeIcon(item.contentType)} mr-1`}></i>
                        {getContentTypeLabel(item.contentType)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Submitted by: <span className="font-medium">{item.submitter.username || item.submitter.name}</span>
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      Content ID: {item.contentId}
                    </p>
                  </div>

                  {canApproveType(item.contentType) && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleApprove(item)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <i className="fas fa-check mr-1"></i>
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(item)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <i className="fas fa-times mr-1"></i>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Reject Content</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this content. The creator will be notified.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
            />
            <div className="flex space-x-3">
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedItem(null);
                  setRejectReason("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-purple-600 text-white"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );
}
