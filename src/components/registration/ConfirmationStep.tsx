import { getCurrencyConfig, getCountryName } from '../../utils/currencyConfig';

interface ConfirmationStepProps {
  formData: {
    email: string;
    name: string;
    username: string;
    phoneNumber: string;
    detectedCountry: string;
    primaryCurrency: string;
    interests: string[];
  };
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ConfirmationStep({
  formData,
  onSubmit,
  onBack,
  isSubmitting
}: ConfirmationStepProps) {
  const currencyConfig = getCurrencyConfig(formData.primaryCurrency);
  const countryName = getCountryName(formData.detectedCountry);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Confirm Your Account</h2>
        <p className="text-gray-600">Review your information before creating your account</p>
      </div>

      {/* Account Summary */}
      <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 border border-white/30">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <i className="fas fa-user-circle mr-2"></i>
          Account Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Email:</span>
            <span className="text-gray-800">{formData.email}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Full Name:</span>
            <span className="text-gray-800">{formData.name}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Username:</span>
            <span className="text-gray-800">@{formData.username}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600 font-medium">Phone:</span>
            <span className="text-gray-800">{formData.phoneNumber}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600 font-medium">Interests:</span>
            <span className="text-gray-800">
              {formData.interests.length > 0 ? `${formData.interests.length} selected` : 'None selected'}
            </span>
          </div>
        </div>
      </div>

      {/* Currency & Location Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
          <i className="fas fa-globe mr-2"></i>
          Location & Currency
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-blue-200">
            <span className="text-blue-600 font-medium">Detected Country:</span>
            <span className="text-blue-800 flex items-center">
              {formData.detectedCountry && (
                <>
                  <span className="mr-2">
                    {formData.detectedCountry === 'US' && '🇺🇸'}
                    {formData.detectedCountry === 'CA' && '🇨🇦'}
                    {formData.detectedCountry === 'GB' && '🇬🇧'}
                    {formData.detectedCountry === 'DE' && '🇩🇪'}
                    {formData.detectedCountry === 'FR' && '🇫🇷'}
                    {formData.detectedCountry === 'NG' && '🇳🇬'}
                    {formData.detectedCountry === 'GH' && '🇬🇭'}
                    {formData.detectedCountry === 'KE' && '🇰🇪'}
                    {formData.detectedCountry === 'GM' && '🇬🇲'}
                    {formData.detectedCountry === 'ZA' && '🇿🇦'}
                  </span>
                  {countryName}
                </>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-blue-600 font-medium">Primary Currency:</span>
            <span className="text-blue-800 flex items-center">
              {currencyConfig && (
                <>
                  <span className="mr-2">{currencyConfig.flag}</span>
                  {currencyConfig.symbol} {currencyConfig.name} ({currencyConfig.code})
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Features */}
      <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
          <i className="fas fa-wallet mr-2"></i>
          Your Wallet Features
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">✅ Multi-Currency Deposits</h4>
            <p className="text-green-600">Support for 9 currencies: USD, NGN, GBP, EUR, CAD, GHS, KES, GMD, ZAR</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">🔒 PIN-Protected Withdrawals</h4>
            <p className="text-green-600">Secure withdrawals in NGN with your PIN</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">💱 Auto Currency Conversion</h4>
            <p className="text-green-600">Real-time exchange rates for cross-currency transactions</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">📊 Balance Tracking</h4>
            <p className="text-green-600">Track balances in all supported currencies</p>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-yellow-800 font-semibold mb-2 flex items-center">
          <i className="fas fa-shield-alt mr-2"></i>
          Security Features
        </h4>
        <div className="text-yellow-700 text-sm space-y-1">
          <p>• Your PIN is encrypted with industry-standard security</p>
          <p>• Phone-based country detection (no location tracking)</p>
          <p>• Secure multi-currency wallet automatically created</p>
          <p>• All transactions are logged and auditable</p>
        </div>
      </div>

      {/* Terms Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-gray-700 text-sm">
          By creating your account, you agree to our Terms of Service and Privacy Policy. 
          Your wallet will be automatically created with zero balances in all supported currencies.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-4 rounded-3xl text-lg font-bold border-2 border-white/40 text-gray-700 hover:bg-white/20 bg-white/10 backdrop-blur-sm transition-all disabled:opacity-50"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back
        </button>
        
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 black-button py-4 rounded-3xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full"></div>
              Creating Account...
            </div>
          ) : (
            <>
              <i className="fas fa-rocket mr-2"></i>
              Create Account
            </>
          )}
        </button>
      </div>
    </div>
  );
}