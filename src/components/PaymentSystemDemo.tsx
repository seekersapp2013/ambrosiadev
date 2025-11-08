import { useState } from "react";
import { 
  PaymentConfig, 
  PaywallDisplay, 
  PaymentFlow, 
  WalletAddressDisplay 
} from './UnifiedPayment';
import { WalletBalanceDisplay, WalletAddressInline } from './UnifiedWallet';

/**
 * Demo component showing all unified payment system features
 * This demonstrates how to use the consolidated payment components
 */
export function PaymentSystemDemo() {
  const [activeDemo, setActiveDemo] = useState<string>('config');
  const [isGated, setIsGated] = useState(false);
  const [priceAmount, setPriceAmount] = useState(1);

  const demoProps = {
    contentType: "article" as const,
    title: "Sample Premium Article",
    price: 5,
    token: "USD",
    sellerAddress: "0x1234567890abcdef1234567890abcdef12345678"
  };

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Unified Payment System Demo</h1>
        
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {[
            { key: 'config', label: 'Payment Config' },
            { key: 'paywall-simple', label: 'Simple Paywall' },
            { key: 'paywall-full', label: 'Full Paywall' },
            { key: 'payment-flow', label: 'Payment Flow' },
            { key: 'wallet-display', label: 'Wallet Display' },
            { key: 'address-components', label: 'Address Components' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveDemo(key)}
              className={`px-4 py-2 rounded-lg font-medium ${
                activeDemo === key
                  ? 'bg-accent text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="bg-gray-50 rounded-lg p-6">
          {activeDemo === 'config' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Payment Configuration Component</h2>
              <p className="text-gray-600 mb-4">
                Used in content creation forms (WriteArticle, WriteReel) to configure payment settings.
              </p>
              <div className="bg-white rounded-lg p-4 border">
                <PaymentConfig
                  isGated={isGated}
                  setIsGated={setIsGated}
                  priceAmount={priceAmount}
                  setPriceAmount={setPriceAmount}
                  contentType="article"
                />
              </div>
            </div>
          )}

          {activeDemo === 'paywall-simple' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Simple Paywall Display</h2>
              <p className="text-gray-600 mb-4">
                Used to show locked content with basic payment info and unlock button.
              </p>
              <div className="bg-white rounded-lg border">
                <PaywallDisplay
                  {...demoProps}
                  onUnlock={() => alert('Unlock clicked!')}
                />
              </div>
            </div>
          )}

          {activeDemo === 'paywall-full' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Full Paywall Display</h2>
              <p className="text-gray-600 mb-4">
                Enhanced paywall with detailed content preview and payment instructions.
              </p>
              <div className="bg-white rounded-lg border">
                <PaywallDisplay
                  {...demoProps}
                  onUnlock={() => alert('Proceed to payment clicked!')}
                  showFullPaywall={true}
                />
              </div>
            </div>
          )}

          {activeDemo === 'payment-flow' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Complete Payment Flow</h2>
              <p className="text-gray-600 mb-4">
                Full payment interface with transaction hash input and verification.
              </p>
              <div className="bg-white rounded-lg border max-h-96 overflow-y-auto">
                <PaymentFlow
                  {...demoProps}
                  contentId="demo-id" as any
                  onBack={() => alert('Back clicked!')}
                  onSuccess={() => alert('Payment successful!')}
                />
              </div>
            </div>
          )}

          {activeDemo === 'wallet-display' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Wallet Balance Display</h2>
              <p className="text-gray-600 mb-4">
                Complete wallet interface with balance and action buttons.
              </p>
              <div className="bg-white rounded-lg">
                <WalletBalanceDisplay
                  onNavigate={(screen) => alert(`Navigate to: ${screen}`)}
                />
              </div>
            </div>
          )}

          {activeDemo === 'address-components' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Address Display Components</h2>
              <p className="text-gray-600 mb-4">
                Various ways to display wallet addresses with different levels of detail.
              </p>
              <div className="space-y-6">
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Full Address Display with Instructions</h3>
                  <WalletAddressDisplay 
                    address={demoProps.sellerAddress} 
                    showInstructions={true}
                  />
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Simple Address Display</h3>
                  <WalletAddressDisplay address={demoProps.sellerAddress} />
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Inline Address Display</h3>
                  <WalletAddressInline address={demoProps.sellerAddress} />
                </div>
                
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3">Missing Address Handling</h3>
                  <WalletAddressDisplay address={undefined} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Usage Examples */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Usage Examples</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold text-blue-700">Content Creation:</h3>
              <code className="block bg-white p-2 rounded mt-1 text-blue-600">
                {`<PaymentConfig isGated={isGated} setIsGated={setIsGated} ... />`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Content Viewing (Locked):</h3>
              <code className="block bg-white p-2 rounded mt-1 text-blue-600">
                {`<PaywallDisplay contentType="article" title="..." onUnlock={handleUnlock} />`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Payment Processing:</h3>
              <code className="block bg-white p-2 rounded mt-1 text-blue-600">
                {`<PaymentFlow contentId={id} onSuccess={handleSuccess} ... />`}
              </code>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Wallet Management:</h3>
              <code className="block bg-white p-2 rounded mt-1 text-blue-600">
                {`<WalletBalanceDisplay onNavigate={handleNavigation} />`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}