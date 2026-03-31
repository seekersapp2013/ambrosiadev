import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getDepositCurrencies, 
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface DepositProps {
  onBack: () => void;
}

export function Deposit({ onBack }: DepositProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedDepositCurrency, setSelectedDepositCurrency] = useState("NGN");
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");

  // Hidden fields that will be auto-populated from profile
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const redirectUrl = `${window.location.origin}/callback`;
  const paymentMethods = "card,bank-transfer,ussd,qrcode";
  const feeBearer = "customer";

  // Fetch current user profile
  const userProfile = useQuery(api.profiles.getMyProfile);
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, { currency: "USD" });
  const initializePayment = useAction(api.ercasPayActions.initializeDepositPayment);

  // Get currency configurations
  const depositCurrencies = getDepositCurrencies();

  // Set primary currency as default when wallet loads
  useEffect(() => {
    if (walletBalance?.primaryCurrency) {
      setSelectedDepositCurrency(walletBalance.primaryCurrency);
    }
  }, [walletBalance?.primaryCurrency]);

  // Auto-populate hidden fields from user profile
  useEffect(() => {
    if (userProfile) {
      // Set customer name from profile
      setCustomerName(userProfile.name || userProfile.user?.name || "");
      
      // Set customer email from user data
      setCustomerEmail(userProfile.user?.email || "");
      
      // Set customer phone number from profile or user data
      setCustomerPhoneNumber((userProfile as any).phoneNumber || userProfile.user?.phone || "");
    }
  }, [userProfile]);

  // Generate payment reference when amount changes
  useEffect(() => {
    if (depositAmount && parseFloat(depositAmount) > 0) {
      const now = new Date();
      const dateTime = now.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/[^\w]/g, '');
      
      setPaymentReference(`Payment of ${depositAmount} ${selectedDepositCurrency} ${dateTime}`);
    }
  }, [depositAmount, selectedDepositCurrency]);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!customerName || !customerEmail || !customerPhoneNumber) {
      setMessage("Profile information is incomplete. Please update your profile first.");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      // Call backend action to initialize payment
      const ercasPayResult = await initializePayment({
        amount: parseFloat(depositAmount),
        currency: selectedDepositCurrency,
        customerName,
        customerEmail,
        customerPhone: customerPhoneNumber,
        paymentMethods,
        description: description || paymentReference,
        feeBearer,
        redirectUrl
      });

      if (ercasPayResult.requestSuccessful) {
        setMessage(`Payment initiated successfully! Transaction Reference: ${ercasPayResult.responseBody.transactionReference}`);
        
        // Open payment URL in a popup window
        if (ercasPayResult.responseBody.checkoutUrl) {
          const popup = window.open(
            ercasPayResult.responseBody.checkoutUrl,
            'ercaspay-payment',
            'width=600,height=700,scrollbars=yes,resizable=yes'
          );

          // Listen for messages from the popup
          const handleMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'PAYMENT_CALLBACK') {
              console.log('Payment callback received:', event.data);
              
              if (event.data.status === 'success') {
                setMessage('Payment completed successfully! Your wallet has been updated.');
                // Clear form on success
                setDepositAmount("");
                setDescription("");
              } else {
                setMessage(`Payment ${event.data.status}. Please check your wallet balance.`);
              }
              
              // Clean up
              window.removeEventListener('message', handleMessage);
              if (popup && !popup.closed) {
                popup.close();
              }
            }
          };

          window.addEventListener('message', handleMessage);

          // Check if popup was closed manually
          const checkClosed = setInterval(() => {
            if (popup && popup.closed) {
              clearInterval(checkClosed);
              window.removeEventListener('message', handleMessage);
            }
          }, 1000);
        }
        
        // Clear form on success
        setDepositAmount("");
        setDescription("");
      } else {
        setMessage(`Payment initiation failed: ${ercasPayResult.responseMessage}`);
      }

    } catch (error: any) {
      console.error("Payment error:", error);
      setMessage(`Error: ${error.message || "Payment initiation failed"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 mr-4"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 className="text-2xl font-bold text-accent flex items-center">
          <i className="fas fa-plus-circle mr-2"></i>
          Deposit Funds
        </h1>
      </div>

      {/* Deposit Form */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="space-y-4">
          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter your email"
                  disabled={isProcessing}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerPhoneNumber}
                  onChange={(e) => setCustomerPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="08121303854"
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Auto-generated based on amount and date"
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={selectedDepositCurrency}
                  onChange={(e) => setSelectedDepositCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  disabled={isProcessing}
                >
                  {depositCurrencies.map((currency: CurrencyConfig) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ({getCurrencyConfig(selectedDepositCurrency)?.symbol}) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="100.00"
                  disabled={isProcessing}
                  required
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Methods
                </label>
                <select
                  value={paymentMethods}
                  onChange={() => {}} // Read-only but displayed
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled={true}
                >
                  <option value="card,bank-transfer,ussd,qrcode">All Methods</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Default: All available payment methods</p>
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Bearer
                </label>
                <select
                  value={feeBearer}
                  onChange={() => {}} // Read-only but displayed
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled={true}
                >
                  <option value="customer">Customer</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Default: Customer pays fees</p>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Payment description (optional)"
                  rows={2}
                  disabled={isProcessing}
                />
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL
                </label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={() => {}} // Read-only but displayed
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  disabled={true}
                />
                <p className="text-xs text-gray-500 mt-1">Default callback URL for payment completion</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDeposit}
            disabled={isProcessing || !depositAmount || !customerName || !customerEmail || !customerPhoneNumber}
            className="w-full py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            {isProcessing ? "Processing..." : `Initiate Deposit - ${selectedDepositCurrency} ${depositAmount || '0.00'}`}
          </button>
        </div>
      </section>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes("Error") || message.includes("failed")
            ? "bg-red-100 border border-red-300 text-red-700" 
            : "bg-green-100 border border-green-300 text-green-700"
        }`}>
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}
    </div>
  );
}