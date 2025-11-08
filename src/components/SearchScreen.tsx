import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

interface SearchScreenProps {
  onBack: () => void;
}

export function SearchScreen({ onBack: _onBack }: SearchScreenProps) {
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    // No need to reload the page - just let the component handle authentication state
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="p-4">
        <h3 className="font-bold mb-3">Recent Searches</h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <i className="fas fa-clock text-gray-400 mr-3"></i>
            <span>nutritionist</span>
          </div>
          <i className="fas fa-times text-gray-400"></i>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <i className="fas fa-clock text-gray-400 mr-3"></i>
            <span>healthy recipes</span>
          </div>
          <i className="fas fa-times text-gray-400"></i>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <i className="fas fa-clock text-gray-400 mr-3"></i>
            <span>yoga flow</span>
          </div>
          <i className="fas fa-times text-gray-400"></i>
        </div>
        
        <h3 className="font-bold mb-3">Suggested for You</h3>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5">
                <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <span className="text-xs">healthyliving</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 to-blue-400 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5">
                <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <span className="text-xs">fitnessguru</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-0.5 mb-1">
              <div className="bg-white rounded-full p-0.5">
                <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-full h-full rounded-full object-cover" />
              </div>
            </div>
            <span className="text-xs">nutritionist</span>
          </div>
        </div>
        
        <h3 className="font-bold mb-3">Popular Topics</h3>
        <div className="flex flex-wrap gap-2">
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#HealthyEating</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#MentalHealth</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#FitnessJourney</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#SelfCare</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#Wellness</span>
          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">#ChronicIllness</span>
        </div>
      </div>
    </div>
  );
}