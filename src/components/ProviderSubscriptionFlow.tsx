import { useState } from 'react';
import { ProviderSubscription } from './ProviderSubscription';

interface ProviderSubscriptionFlowProps {
  onBack: () => void;
  onComplete: () => void;
}

type FlowState = 'form' | 'success';

export function ProviderSubscriptionFlow({ onBack, onComplete }: ProviderSubscriptionFlowProps) {
  const [flowState, setFlowState] = useState<FlowState>('form');

  const handleSuccess = () => {
    setFlowState('success');
  };

  const handleContinue = () => {
    onComplete();
  };

  if (flowState === 'success') {
    return (
      <div className="max-w-md mx-auto p-6 bg-white text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-2xl text-green-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to the Provider Network!
          </h2>
          <p className="text-gray-600">
            Your service has been successfully set up. You can now start receiving bookings from clients.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• Your profile is now visible to potential clients</li>
            <li>• You'll receive notifications for new booking requests</li>
            <li>• You can manage your availability and settings anytime</li>
            <li>• Bookings are automatically confirmed by default</li>
          </ul>
        </div>

        <button
          onClick={handleContinue}
          className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90"
        >
          Continue to Booking Platform
        </button>
      </div>
    );
  }

  return (
    <ProviderSubscription
      onBack={onBack}
      onSuccess={handleSuccess}
    />
  );
}