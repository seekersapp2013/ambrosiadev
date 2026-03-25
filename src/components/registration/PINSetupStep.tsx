import { useState, useEffect } from 'react';
import { pinService } from '../../utils/pinSecurity';

interface PINSetupStepProps {
  pin: string;
  confirmPin: string;
  onPinChange: (pin: string) => void;
  onConfirmPinChange: (confirmPin: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PINSetupStep({
  pin,
  confirmPin,
  onPinChange,
  onConfirmPinChange,
  onNext,
  onBack
}: PINSetupStepProps) {
  const [pinError, setPinError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [pinStrength, setPinStrength] = useState({ score: 0, feedback: '' });
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Validate PIN in real-time
  useEffect(() => {
    if (pin) {
      const validation = pinService.validatePINFormat(pin);
      const strength = pinService.getPINStrength(pin);
      
      setPinError(validation.isValid ? null : validation.error || 'Invalid PIN');
      setPinStrength(strength);
    } else {
      setPinError(null);
      setPinStrength({ score: 0, feedback: '' });
    }
  }, [pin]);

  // Validate PIN confirmation
  useEffect(() => {
    if (confirmPin) {
      if (pin !== confirmPin) {
        setConfirmError('PINs do not match');
      } else {
        setConfirmError(null);
      }
    } else {
      setConfirmError(null);
    }
  }, [pin, confirmPin]);

  const handleNext = () => {
    const validation = pinService.validatePINFormat(pin);
    
    if (!validation.isValid) {
      setPinError(validation.error || 'Invalid PIN');
      return;
    }
    
    if (pin !== confirmPin) {
      setConfirmError('PINs do not match');
      return;
    }
    
    onNext();
  };

  const isValid = pin && confirmPin && !pinError && !confirmError;
  const requirements = pinService.getPINRequirements();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Security PIN</h2>
        <p className="text-gray-600">This PIN will be required for all withdrawals</p>
      </div>

      {/* PIN Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-lock glass-input-icon text-lg"></i>
        </div>
        <input
          type={showPin ? "text" : "password"}
          value={pin}
          onChange={(e) => onPinChange(e.target.value)}
          required
          placeholder="Enter 4-6 digit PIN"
          maxLength={6}
          className={`glass-input w-full pl-14 pr-14 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            pinError ? 'border-red-400' : 
            pin && !pinError ? 'border-green-400' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="absolute inset-y-0 right-0 pr-5 flex items-center hover:scale-110 transition-transform z-10"
        >
          <i className={`fas ${showPin ? 'fa-eye-slash' : 'fa-eye'} glass-input-icon text-lg`}></i>
        </button>
      </div>

      {/* PIN Strength Indicator */}
      {pin && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">PIN Strength:</span>
            <span className={`text-sm font-medium ${
              pinStrength.score >= 80 ? 'text-green-600' :
              pinStrength.score >= 60 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {pinStrength.feedback}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                pinStrength.score >= 80 ? 'bg-green-500' :
                pinStrength.score >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${pinStrength.score}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* PIN Error */}
      {pinError && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-red-700 text-sm">{pinError}</p>
        </div>
      )}

      {/* Confirm PIN Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-shield-alt glass-input-icon text-lg"></i>
        </div>
        <input
          type={showConfirmPin ? "text" : "password"}
          value={confirmPin}
          onChange={(e) => onConfirmPinChange(e.target.value)}
          required
          placeholder="Confirm PIN"
          maxLength={6}
          className={`glass-input w-full pl-14 pr-14 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            confirmError ? 'border-red-400' : 
            confirmPin && !confirmError ? 'border-green-400' : ''
          }`}
        />
        <button
          type="button"
          onClick={() => setShowConfirmPin(!showConfirmPin)}
          className="absolute inset-y-0 right-0 pr-5 flex items-center hover:scale-110 transition-transform z-10"
        >
          <i className={`fas ${showConfirmPin ? 'fa-eye-slash' : 'fa-eye'} glass-input-icon text-lg`}></i>
        </button>
      </div>

      {/* Confirm PIN Error */}
      {confirmError && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-red-700 text-sm">{confirmError}</p>
        </div>
      )}

      {/* PIN Match Indicator */}
      {confirmPin && !confirmError && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <p className="text-green-700 text-sm flex items-center">
            <i className="fas fa-check mr-2"></i>
            PINs match
          </p>
        </div>
      )}

      {/* PIN Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-semibold mb-2">PIN Requirements:</h4>
        <ul className="text-blue-700 text-sm space-y-1">
          {requirements.map((requirement, index) => (
            <li key={index} className="flex items-start">
              <i className="fas fa-info-circle mr-2 mt-0.5 text-blue-600"></i>
              {requirement}
            </li>
          ))}
        </ul>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-yellow-800 font-semibold mb-2">🔒 Security Notice:</h4>
        <div className="text-yellow-700 text-sm space-y-1">
          <p>• Your PIN will be securely encrypted and stored</p>
          <p>• You'll need this PIN for all withdrawal operations</p>
          <p>• Keep your PIN private and don't share it with anyone</p>
          <p>• You can change your PIN later in security settings</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 rounded-3xl text-lg font-bold border-2 border-white/40 text-gray-700 hover:bg-white/20 bg-white/10 backdrop-blur-sm transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid}
          className="flex-1 black-button py-4 rounded-3xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <i className="fas fa-arrow-right ml-2"></i>
        </button>
      </div>
    </div>
  );
}