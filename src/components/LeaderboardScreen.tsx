import { useConvexAuth } from "convex/react";
import { useEffect } from "react";
import { WalletBalance } from "./WalletBalance";
import { GenerateWallet } from "./GenerateWallet";
import { SendEmailForm } from "./SendEmailForm";
import { TransferFunds } from "./TransferFunds";
import { EmailHistory } from "./EmailHistory";

export function LeaderboardScreen() {
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
      <div className="bg-ambrosia-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="leaderboard-position mr-3">1</div>
            <div>
              <p className="font-medium">healthyliving</p>
              <p className="text-xs text-gray-600">Nutrition Expert</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-accent">1,245 pts</p>
            <p className="text-xs text-gray-600">+120 this week</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
          <div className="bg-accent h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
        <p className="text-xs text-gray-600">85% to next level</p>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">Top Community Members</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="leaderboard-position mr-3">2</div>
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">fitnessguru</p>
                <p className="text-xs text-gray-600">Personal Trainer</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">987 pts</p>
              <p className="text-xs text-gray-600">+85 this week</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="leaderboard-position mr-3">3</div>
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">nutritionist</p>
                <p className="text-xs text-gray-600">Dietician</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">876 pts</p>
              <p className="text-xs text-gray-600">+72 this week</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="leaderboard-position mr-3">4</div>
              <img src="https://randomuser.me/api/portraits/women/12.jpg" alt="User" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">yogamaster</p>
                <p className="text-xs text-gray-600">Yoga Instructor</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">765 pts</p>
              <p className="text-xs text-gray-600">+68 this week</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="leaderboard-position mr-3">5</div>
              <img src="https://randomuser.me/api/portraits/men/45.jpg" alt="User" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <p className="font-medium">mentalhealthadvocate</p>
                <p className="text-xs text-gray-600">Therapist</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">654 pts</p>
              <p className="text-xs text-gray-600">+60 this week</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-bold mb-3">How Points Work</h3>
        <div className="bg-ambrosia-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mr-3">
                <i className="fas fa-heart"></i>
              </div>
              <span>Likes Received</span>
            </div>
            <span className="font-medium">+1 pt per like</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mr-3">
                <i className="fas fa-comment"></i>
              </div>
              <span>Comments Received</span>
            </div>
            <span className="font-medium">+2 pts per comment</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mr-3">
                <i className="fas fa-user-plus"></i>
              </div>
              <span>New Followers</span>
            </div>
            <span className="font-medium">+5 pts per follower</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center mr-3">
                <i className="fas fa-medal"></i>
              </div>
              <span>Daily Login</span>
            </div>
            <span className="font-medium">+10 pts per day</span>
          </div>
        </div>
      </div>

      {/* Wallet Features Section */}
      <div className="space-y-6 border-t border-gray-200 pt-6">
        <h3 className="font-bold text-lg text-accent">💰 Wallet Features</h3>
        <WalletBalance />
        <GenerateWallet />
        <SendEmailForm />
        <TransferFunds />
        <EmailHistory />
      </div>
      </div>
    </div>
  );
}