import { useState, useEffect } from 'react';
import { phoneDetectionService } from '../../utils/phoneDetection';
import type { PhoneDetectionResult } from '../../utils/phoneDetection';

interface PhoneNumberStepProps {
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  onCountryDetected: (result: PhoneDetectionResult) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhoneNumberStep({
  phoneNumber,
  onPhoneChange,
  onCountryDetected,
  onNext,
  onBack
}: PhoneNumberStepProps) {
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<PhoneDetectionResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate phone number in real-time
  useEffect(() => {
    if (phoneNumber.length > 3) {
      setIsValidating(true);
      
      // Debounce validation
      const timer = setTimeout(() => {
        const result = phoneDetectionService.detectCountryFromPhone(phoneNumber);
        setDetectionResult(result);
        
        if (result.isValid) {
          setPhoneError(null);
          onCountryDetected(result);
        } else {
          setPhoneError(result.error || 'Invalid phone number');
        }
        
        setIsValidating(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setDetectionResult(null);
      setPhoneError(null);
      setIsValidating(false);
    }
  }, [phoneNumber, onCountryDetected]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onPhoneChange(value);
  };

  const handleNext = () => {
    if (detectionResult?.isValid) {
      onNext();
    } else {
      setPhoneError('Please enter a valid phone number');
    }
  };

  const isValid = detectionResult?.isValid || false;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Phone Number</h2>
        <p className="text-gray-600">We'll use this to detect your country and suggest your primary currency</p>
      </div>

      {/* Phone Number Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none z-10">
          <i className="fas fa-phone glass-input-icon text-lg"></i>
        </div>
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          required
          placeholder="+1234567890"
          className={`glass-input w-full pl-14 pr-12 py-4 rounded-3xl text-gray-900 placeholder-gray-600 text-base font-medium relative z-0 ${
            phoneError ? 'border-red-400' : 
            isValid ? 'border-green-400' : ''
          }`}
        />
        
        {/* Validation Icon */}
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center z-10">
          {isValidating ? (
            <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
          ) : isValid ? (
            <i className="fas fa-check text-green-600"></i>
          ) : phoneNumber.length > 3 ? (
            <i className="fas fa-times text-red-600"></i>
          ) : null}
        </div>
      </div>

      {/* Error Message */}
      {phoneError && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
          <p className="text-red-700 text-sm">{phoneError}</p>
        </div>
      )}

      {/* Country Detection Result */}
      {detectionResult?.isValid && (
        <div className="bg-green-100 border border-green-300 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {detectionResult.country === 'US' && '🇺🇸'}
              {detectionResult.country === 'CA' && '🇨🇦'}
              {detectionResult.country === 'GB' && '🇬🇧'}
              {detectionResult.country === 'DE' && '🇩🇪'}
              {detectionResult.country === 'FR' && '🇫🇷'}
              {detectionResult.country === 'NG' && '🇳🇬'}
              {detectionResult.country === 'GH' && '🇬🇭'}
              {detectionResult.country === 'KE' && '🇰🇪'}
              {detectionResult.country === 'GM' && '🇬🇲'}
              {detectionResult.country === 'ZA' && '🇿🇦'}
            </div>
            <div>
              <p className="text-green-800 font-semibold">
                Country Detected: {detectionResult.country}
              </p>
              <p className="text-green-700 text-sm">
                Suggested Currency: {detectionResult.currency}
              </p>
              <p className="text-green-600 text-xs">
                Formatted: {detectionResult.formattedNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Examples */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-800 font-semibold mb-2">Example formats:</h4>
        <div className="text-blue-700 text-sm space-y-1">
          <p>🇺🇸 US: +1 201 555 0123</p>
          <p>🇳🇬 Nigeria: +234 802 123 4567</p>
          <p>🇬🇧 UK: +44 20 7946 0958</p>
          <p>🇨🇦 Canada: +1 204 555 0123</p>
          <p>🇿🇦 South Africa: +27 21 123 4567</p>
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