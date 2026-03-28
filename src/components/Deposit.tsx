import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  getDepositCurrencies, 
  formatCurrencyAmount,
  getCurrencyConfig,
  type CurrencyConfig
} from '../utils/currencyConfig';

interface DepositProps {
  onBack: () => void;
}

export function Deposit({ onBack }: DepositProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [selectedDepositCurrency, setSelectedDepositCurrency] = useState("NGN");
  const [paymentReference, setPaymentReference] = useState("");
  const [paymentMethods, setPaymentMethods] = useState("card,bank-transfer,ussd,qrcode");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState("");
  const [redirectUrl, setRedirectUrl] = useState(`${window.location.origin}/callback`);
  const [description, setDescription] = useState("");
  const [feeBearer, setFeeBearer] = useState("customer");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [ercasPayResponse, setErcasPayResponse] = useState<any>(null);

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

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setMessage("Please enter a valid amount");
      return;
    }

    if (!customerName || !customerEmail || !customerPhoneNumber) {
      setMessage("Please fill in all required customer information");
      return;
    }

    setIsProcessing(true);
    setMessage("");
    setErcasPayResponse(null);

    try {
      // Call backend action to initialize payment
      const ercasPayResult = await initializePayment({
        amount: parseFloat(depositAmount),
        currency: selectedDepositCurrency,
        customerName,
        customerEmail,
        customerPhone: customerPhoneNumber,
        paymentMethods,
        description: description || `Deposit ${formatCurrencyAmount(parseFloat(depositAmount), selectedDepositCurrency)}`,
        feeBearer,
        redirectUrl
      });
      
      // Store the ErcasPay response for display
      setErcasPayResponse(ercasPayResult);

      if (ercasPayResult.requestSuccessful) {
        setMessage(`Payment initiated successfully! Transaction Reference: ${ercasPayResult.responseBody.transactionReference}`);
        
        // Open payment URL in a popup window instead of new tab
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
                setPaymentReference("");
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
              setMessage('Payment window was closed. Please check your wallet balance to confirm payment status.');
            }
          }, 1000);
        }
        
        // Clear form on success
        setDepositAmount("");
        setPaymentReference("");
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
              <div>
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

              <div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Auto-generated if empty"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Methods
                </label>
                <select
                  value={paymentMethods}
                  onChange={(e) => setPaymentMethods(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  disabled={isProcessing}
                >
                  <option value="card,bank-transfer,ussd,qrcode">All Methods</option>
                  <option value="card">Card Only</option>
                  <option value="bank-transfer">Bank Transfer Only</option>
                  <option value="ussd">USSD Only</option>
                  <option value="qrcode">QR Code Only</option>
                  <option value="card,bank-transfer">Card & Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Bearer
                </label>
                <select
                  value={feeBearer}
                  onChange={(e) => setFeeBearer(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  disabled={isProcessing}
                >
                  <option value="customer">Customer</option>
                  <option value="merchant">Merchant</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Settings</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Redirect URL
                </label>
                <input
                  type="url"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder={`${window.location.origin}/callback`}
                  disabled={isProcessing}
                />
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

      {/* ErcasPay Response */}
      {ercasPayResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-3">ErcasPay Response</h3>
          <div className="bg-white p-4 rounded border">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(ercasPayResponse, null, 2)}
            </pre>
          </div>
          
          {/* Checkout URL Button */}
          {ercasPayResponse?.requestSuccessful && ercasPayResponse?.responseBody?.checkoutUrl && (
            <div className="mt-4">
              <a
                href={ercasPayResponse.responseBody.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <i className="fas fa-external-link-alt mr-2"></i>
                Complete Payment
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}