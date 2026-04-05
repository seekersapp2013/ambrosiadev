interface CommunityTabProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function CommunityTab({ onNavigate }: CommunityTabProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
      <h3 className="text-lg font-bold text-gray-600 mb-2">Community Is Coming Soon</h3>
      <p className="text-gray-500 text-center">
        Connect with other learners and creators in our community space.
      </p>
    </div>
  );
}
