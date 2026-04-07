import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { 
  formatCurrencyAmount,
  getCurrencyConfig,
  SUPPORTED_CURRENCIES
} from '../utils/currencyConfig';
import { convertCurrency, checkSufficientBalance } from '../utils/exchangeRates';

interface EventPaymentFlowProps {
  event: any; // Event with provider info
  onSuccess: (bookingId: Id<'bookings'>) => void;
  onCancel: () => void;
}

export function EventPaymentFlow({ event, onSuccess, onCancel }: EventPaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get wallet balance
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance, {});
  
  // Mutations
  const transferFunds = useMutation(api.wallets.transferFunds.transferFunds);
  const createEventBooking = useMutation(api.bookings.createEventBooking);

  // Get event currency and price
  const eventCurrency = event.priceCurrency || 'USD';
  const eventPrice = event.pricePerPerson;
  const currencyInfo = getCurrencyConfig(eventCurrency);

  // Check balance
  const balanceCheck = walletBalance ? checkSufficientBalance(
    walletBalance.balances,
    eventPrice,
    eventCurrency
  ) : { hasSufficient: false, availableCurrencies: [] };

  const userPrimaryCurrency = walletBalance?.primaryCurrency || 'USD';
  
  // Convert price to user's primary currency for display
  let convertedPrice = eventPrice;
  let showConversion = false;
  try {
    if (eventCurrency !== userPrimaryCurrency) {
      convertedPrice = convertCurrency(eventPrice, eventCurrency, userPrimaryCurrency);
      showConversion = true;
    }
  } catch (error) {
    convertedPrice = eventPrice;
    showConversion = false;
  }

  const handlePayment = async () => {
    if (!balanceCheck.hasSufficient) {
      setErrorMessage(`Insufficient balance. Please deposit ${eventCurrency} or other supported currencies.`);
      setPaymentStatus('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Step 1: Transfer funds to provider (70% to provider, 30% platform fee handled in backend)
      const providerUsername = event.provider?.profile?.username;
      if (!providerUsername) {
        throw new Error('Provider information not available');
      }

      await transferFunds({
        recipientUsername: providerUsername,
        amount: eventPrice * 0.7, // 70% to provider
        currency: eventCurrency,
        description: `Payment for event: ${event.title}`
      });

      // Step 2: Create booking
      const bookingId = await createEventBooking({
        eventId: event._id,
        paymentTxHash: 'wallet_transfer'
      });

      setPaymentStatus('success');

      // Auto-redirect after success
      setTimeout(() => {
        onSuccess(bookingId);
      }, 2000);

    } catch (error) {
      console.error('Payment failed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed');
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <i className="fas fa-cog fa-spin text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4">Processing Payment...</h2>
          <div className="space-y-3 text-gray-600">
            <p className="flex items-center justify-center">
              <div className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full mr-2"></div>
              Transferring {formatCurrencyAmount(eventPrice, eventCurrency)} to event provider
            </p>
            <p className="text-gray-400">
              <i className="fas fa-clock mr-2"></i>
              Creating your booking...
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-6">
            This usually takes just a moment...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-check text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-green-600">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            You've successfully joined the event. You'll receive confirmation shortly.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-green-600">
                {formatCurrencyAmount(eventPrice, eventCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Platform Fee (30%):</span>
              <span className="text-gray-600">
                {formatCurrencyAmount(eventPrice * 0.30, eventCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-600">Provider Receives (70%):</span>
              <span className="font-bold">
                {formatCurrencyAmount(eventPrice * 0.70, eventCurrency)}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Redirecting in 2 seconds...
          </p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-times text-white text-3xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-red-600">Payment Failed</h2>
          <p className="text-gray-600 mb-6">
            {errorMessage || 'Something went wrong with your payment.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setErrorMessage('');
              }}
              className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Payment confirmation screen
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-calendar-check text-white text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Event Payment</h2>
        <p className="text-gray-600">
          Review details before joining this event
        </p>
      </div>

      {/* Event Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">{event.title}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{formatDate(event.sessionDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Time:</span>
            <span className="font-medium">{formatTime(event.sessionTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium">{event.duration} minutes</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Provider:</span>
            <span className="font-medium">
              {event.provider?.profile?.name || event.provider?.profile?.username}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Event Price:</span>
          <span className="text-2xl font-bold text-accent">
            {formatCurrencyAmount(eventPrice, eventCurrency)}
          </span>
        </div>
        {showConversion && (
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-500">In your currency:</span>
            <span className="text-gray-700">
              {formatCurrencyAmount(convertedPrice, userPrimaryCurrency)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-blue-200">
          <span className="text-gray-500">Platform Fee (30%):</span>
          <span className="text-gray-500">
            {formatCurrencyAmount(eventPrice * 0.30, eventCurrency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Provider Gets (70%):</span>
          <span className="text-gray-700">
            {formatCurrencyAmount(eventPrice * 0.70, eventCurrency)}
          </span>
        </div>
      </div>

      {/* Balance Check */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Your {eventCurrency} Balance:</span>
          <span className={`font-bold ${balanceCheck.hasSufficient ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrencyAmount((walletBalance?.balances as any)?.[eventCurrency] || 0, eventCurrency)}
          </span>
        </div>
        
        {!balanceCheck.hasSufficient && balanceCheck.availableCurrencies.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Available in other currencies:</p>
            <div className="space-y-1">
              {balanceCheck.availableCurrencies.slice(0, 3).map(({ currency, balance, convertedAmount }) => (
                <div key={currency} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {SUPPORTED_CURRENCIES[currency]?.flag} {currency}:
                  </span>
                  <span className={convertedAmount >= eventPrice ? 'text-green-600' : 'text-gray-600'}>
                    {formatCurrencyAmount(balance, currency)}
                    {convertedAmount >= eventPrice && (
                      <span className="ml-1 text-green-600">✓</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!balanceCheck.hasSufficient && (
          <p className="text-red-600 text-sm mt-2">
            Insufficient balance. Please deposit funds to continue.
          </p>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {balanceCheck.hasSufficient ? (
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : `Pay ${formatCurrencyAmount(eventPrice, eventCurrency)}`}
          </button>
        ) : (
          <button
            onClick={() => {
              // Navigate to deposit - you can implement this
              alert('Please deposit funds to your wallet first');
            }}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700"
          >
            Deposit Funds
          </button>
        )}

        <button
          onClick={onCancel}
          className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Payments are processed instantly using your wallet balance.
          Revenue split: 70% provider, 30% platform. All transactions are secure.
        </p>
      </div>
    </div>
  );
}
