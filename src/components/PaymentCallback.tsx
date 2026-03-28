import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatCurrencyAmount } from '../utils/currencyConfig';

export function PaymentCallback() {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'failed' | 'error'>('loading');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [message, setMessage] = useState("");
  
  const verifyPayment = useAction(api.ercasPayActions.verifyDepositPayment);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const transRef = urlParams.get('transRef');
        const status = urlParams.get('status');
        const reference = urlParams.get('reference');

        console.log('Callback URL params:', { transRef, status, reference });

        if (!transRef) {
          setVerificationStatus('error');
          setMessage('No transaction reference found in callback URL');
          return;
        }

        setMessage('Verifying payment...');

        // Call backend verification action
        const verificationResult = await verifyPayment({
          transactionReference: transRef
        });

        console.log('Verification result:', verificationResult);
        setVerificationData(verificationResult);

        // Handle different response structures
        if (verificationResult && typeof verificationResult === 'object') {
          const resultStatus = verificationResult.status;
          
          if (resultStatus === 'success') {
            setVerificationStatus('success');
            const amount = verificationResult.amount || 0;
            const currency = verificationResult.currency || 'USD';
            const newBalance = verificationResult.newBalance || 0;
            
            setMessage(`Payment verified and wallet updated successfully! 
                       Amount: ${formatCurrencyAmount(amount, currency)}
                       New Balance: ${formatCurrencyAmount(newBalance, currency)}
                       Transaction Reference: ${transRef}`);
          } else if (resultStatus === 'failed') {
            setVerificationStatus('failed');
            setMessage(`Payment verification failed. 
                       Transaction Reference: ${transRef}
                       Reason: ${verificationResult.message || 'Unknown error'}`);
          } else if (resultStatus === 'pending') {
            setVerificationStatus('error');
            setMessage(`Payment is still pending. Please check back later.
                       Transaction Reference: ${transRef}`);
          } else {
            setVerificationStatus('error');
            setMessage(`Unknown verification status: ${resultStatus}
                       Transaction Reference: ${transRef}`);
          }
        } else {
          setVerificationStatus('error');
          setMessage(`Invalid verification response received.
                     Transaction Reference: ${transRef}`);
        }

      } catch (error: any) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setMessage(`Verification error: ${error.message || 'Unknown error occurred'}`);
      }
    };

    handleVerification();
  }, [verifyPayment]);

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <i className="fas fa-spinner fa-spin text-blue-500 text-4xl"></i>;
      case 'success':
        return <i className="fas fa-check-circle text-green-500 text-4xl"></i>;
      case 'failed':
        return <i className="fas fa-times-circle text-red-500 text-4xl"></i>;
      case 'error':
        return <i className="fas fa-exclamation-triangle text-yellow-500 text-4xl"></i>;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'error':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const handleReturnToApp = () => {
    // Try to communicate with parent window first (if opened in popup)
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({
          type: 'PAYMENT_CALLBACK',
          status: verificationStatus,
          data: verificationData
        }, window.location.origin);
        window.close();
        return;
      } catch (error) {
        console.log('Could not communicate with parent window:', error);
      }
    }
    
    // Fallback to redirect
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          {getStatusIcon()}
          <h1 className="text-2xl font-bold mt-4 mb-2">
            {verificationStatus === 'loading' && 'Verifying Payment'}
            {verificationStatus === 'success' && 'Payment Successful'}
            {verificationStatus === 'failed' && 'Payment Failed'}
            {verificationStatus === 'error' && 'Verification Error'}
          </h1>
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>

        {verificationData && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Verification Details</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(verificationData, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={handleReturnToApp}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to App
          </button>
          
          {verificationStatus === 'success' && (
            <p className="text-sm text-gray-600">
              You can safely close this window. Your wallet has been updated.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}