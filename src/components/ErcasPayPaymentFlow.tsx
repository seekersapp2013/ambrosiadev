import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ErcasPayPaymentFlowProps {
  amount: number;
  currency: string;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  onError: (error: string) => void;
}

interface CustomerDetails {
  name: string;
  email: string;
  phoneNumber: string;
}

interface PaymentResponse {
  requestSuccessful: boolean;
  responseCode: string;
  responseMessage: string;
  responseBody: {
    paymentReference: string;
    transactionReference: string;
    checkoutUrl: string;
  };
}

export function ErcasPayPaymentFlow({ 
  amount, 
  currency, 
  onSuccess, 
  onCancel, 
  onError 
}: ErcasPayPaymentFlowProps) {
  const [isInitiating, setIsInitiating] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState<string | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showDetailsForm, setShowDetailsForm] = useState(true);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phoneNumber: ""
  });

  // Get current user profile
  const myProfile = useQuery(api.profiles.getMyProfile);

  // Pre-fill form with profile data when available
  useEffect(() => {
    if (myProfile && showDetailsForm) {
      setCustomerDetails({
        name: myProfile.user?.name || myProfile.username || "",
        email: myProfile.user?.email || "",
        phoneNumber: myProfile.user?.phone || ""
      });
    }
  }, [myProfile, showDetailsForm]);

  // Check for completed transaction
  const transaction = useQuery(
    api.ercasPayMutations.getTransactionByPaymentReference,
    paymentReference ? { paymentReference } : "skip"
  );

  // Monitor transaction status
  useEffect(() => {
    if (transaction) {
      if (transaction.status === "completed") {
        onSuccess(transaction.id);
      } else if (transaction.status === "failed") {
        onError("Payment failed. Please try again.");
      }
    }
  }, [transaction, onSuccess, onError]);

  const initiatePayment = async () => {
    if (!myProfile) {
      onError("Please log in to continue");
      return;
    }

    // Validate customer details - all fields are required per your API spec
    if (!customerDetails.name.trim()) {
      onError("Please enter your full name");
      return;
    }
    if (!customerDetails.email.trim()) {
      onError("Please enter your email address");
      return;
    }
    if (!customerDetails.phoneNumber.trim()) {
      onError("Please enter your phone number");
      return;
    }

    setIsInitiating(true);
    
    try {
      const paymentRef = `AMB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setPaymentReference(paymentRef);

      console.log("Initiating payment with exact API format:", {
        userId: myProfile.userId,
        amount,
        currency,
        paymentReference: paymentRef,
        customerDetails
      });

      const apiUrl = `${import.meta.env.VITE_CONVEX_URL}/ercaspay/initiate`;
      console.log("Calling API:", apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: myProfile.userId,
          amount,
          currency,
          paymentReference: paymentRef,
          customerName: customerDetails.name,
          customerEmail: customerDetails.email,
          customerPhoneNumber: customerDetails.phoneNumber,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.success && result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
        setTransactionReference(result.transactionReference);
        console.log("Payment initiated successfully:", {
          checkoutUrl: result.checkoutUrl,
          transactionReference: result.transactionReference,
          paymentReference: result.paymentReference
        });
      } else {
        console.error("Payment initiation failed:", result.error);
        onError(result.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      onError(error instanceof Error ? error.message : 'Payment initiation failed');
    } finally {
      setIsInitiating(false);
    }
  };

  const handleVisitCheckout = () => {
    if (checkoutUrl) {
      // Open ErcasPay checkout in new window
      const paymentWindow = window.open(
        checkoutUrl,
        'ercaspay-checkout',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!paymentWindow) {
        onError("Failed to open payment window. Please allow popups and try again.");
        return;
      }

      // Start checking payment status
      setCheckingStatus(true);
      
      // Monitor the payment window
      const checkClosed = setInterval(() => {
        if (paymentWindow?.closed) {
          clearInterval(checkClosed);
          setCheckingStatus(false);
          // The transaction status will be updated via webhook
          // We'll rely on the useQuery to detect completion
        }
      }, 1000);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      {showDetailsForm ? (
        // Customer Details Form
        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-user text-blue-600 text-2xl"></i>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Payment Details</h3>
          <p className="text-gray-600 mb-6">
            Please provide your details to complete the payment securely.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{amount} {currency}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-semibold">ErcasPay Gateway</span>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerDetails.phoneNumber}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter your phone number (e.g., +234...)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <button
              onClick={() => {
                // Validate before proceeding
                if (!customerDetails.name.trim() || !customerDetails.email.trim() || !customerDetails.phoneNumber.trim()) {
                  onError("Please fill in all required fields");
                  return;
                }
                setShowDetailsForm(false);
              }}
              disabled={!myProfile}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!myProfile ? (
                "Please log in to continue"
              ) : (
                <>
                  <i className="fas fa-arrow-right mr-2"></i>
                  Continue to Payment
                </>
              )}
            </button>
            
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>* Required fields</p>
          </div>
        </div>
      ) : checkoutUrl ? (
        // Payment URL Ready - Show checkout button
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Payment Ready</h3>
          <p className="text-gray-600 mb-6">
            Your payment has been prepared. Click the button below to complete your payment securely with ErcasPay.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{amount} {currency}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Payment Reference:</span>
              <span className="font-semibold text-sm">{paymentReference}</span>
            </div>
            {transactionReference && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Transaction Reference:</span>
                <span className="font-semibold text-sm">{transactionReference}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Checkout URL:</span>
              <span className="font-semibold text-sm text-blue-600 truncate ml-2" title={checkoutUrl}>
                {checkoutUrl.length > 30 ? `${checkoutUrl.substring(0, 30)}...` : checkoutUrl}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleVisitCheckout}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              Visit Checkout URL - Complete Payment
            </button>
            
            <button
              onClick={() => window.open(checkoutUrl, '_blank')}
              className="w-full bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
            >
              <i className="fas fa-link mr-2"></i>
              Open in New Tab
            </button>

            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300"
            >
              Cancel Payment
            </button>
          </div>

          {checkingStatus && (
            <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <i className="fas fa-clock text-yellow-600 mr-2"></i>
              <span className="text-yellow-800 text-sm">
                Monitoring payment status...
              </span>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-500">
            <p>
              <i className="fas fa-shield-alt mr-1"></i>
              Secured by ErcasPay. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      ) : (
        // Payment Initiation Screen
        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-credit-card text-blue-600 text-2xl"></i>
          </div>
          
          <h3 className="text-xl font-bold mb-2">Initialize Payment</h3>
          <p className="text-gray-600 mb-6">
            Click below to prepare your payment with ErcasPay.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{amount} {currency}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{customerDetails.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{customerDetails.email}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={initiatePayment}
              disabled={isInitiating || !myProfile}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInitiating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Preparing Payment...
                </>
              ) : !myProfile ? (
                "Please log in to continue"
              ) : (
                <>
                  <i className="fas fa-play mr-2"></i>
                  Initialize ErcasPay Payment
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowDetailsForm(true)}
              className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-medium hover:bg-gray-300"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Details
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>
              <i className="fas fa-shield-alt mr-1"></i>
              Secured by ErcasPay. Your payment information is encrypted and secure.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}