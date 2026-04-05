import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConfig";

interface EnhancedPaywallProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  title: string;
  onUnlock?: () => void;
  onFundWallet?: () => void;
  onClose?: () => void;
}

export function EnhancedPaywall({ 
  contentType, 
  contentId, 
  title, 
  onUnlock, 
  onFundWallet,
  onClose 
}: EnhancedPaywallProps) {
  const [selectedOption, setSelectedOption] = useState<'individual' | 'course' | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const purchaseOptions = useQuery(api.courses.getContentPurchaseOptions, {
    contentType,
    contentId,
  });

  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance);
  const purchaseContent = useMutation(api.payments.purchaseContent);

  if (!purchaseOptions) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">Loading purchase options...</p>
      </div>
    );
  }

  const handlePurchase = async (option: 'individual' | 'course') => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (option === 'individual') {
        await purchaseContent({
          contentType,
          contentId,
          priceToken: purchaseOptions.individualCurrency,
          priceAmount: purchaseOptions.individualPrice,
        });
      } else if (option === 'course' && selectedCourseId) {
        const courseOption = purchaseOptions.courseOptions.find(c => c.courseId === selectedCourseId);
        if (courseOption) {
          await purchaseContent({
            contentType: 'course',
            contentId: selectedCourseId,
            priceToken: courseOption.courseCurrency,
            priceAmount: courseOption.coursePrice,
          });
        }
      }
      
      onUnlock?.();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(error instanceof Error ? error.message : 'Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrencyInfo = (currencyCode: string) => {
    return SUPPORTED_CURRENCIES[currencyCode] || { symbol: currencyCode, flag: '' };
  };

  const getBalance = (currency: string) => {
    if (!walletBalance?.balances) return 0;
    return walletBalance.balances[currency as keyof typeof walletBalance.balances] || 0;
  };

  const canAfford = (price: number, currency: string) => {
    return getBalance(currency) >= price;
  };

  return (
    <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Unlock Content</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Content Info */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 capitalize">
          <i className={`fas ${contentType === 'article' ? 'fa-file-alt' : 'fa-video'} mr-1`}></i>
          {contentType}
        </p>
      </div>

      {/* Purchase Options */}
      <div className="p-4 space-y-4">
        {/* Individual Purchase Option */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            selectedOption === 'individual' 
              ? 'border-accent bg-accent/5' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedOption('individual')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedOption === 'individual' 
                  ? 'border-accent bg-accent' 
                  : 'border-gray-300'
              }`}>
                {selectedOption === 'individual' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <span className="font-medium text-gray-800">Buy Individual {contentType}</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-accent">
                {getCurrencyInfo(purchaseOptions.individualCurrency).flag} {getCurrencyInfo(purchaseOptions.individualCurrency).symbol}{purchaseOptions.individualPrice}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 ml-6">
            Get immediate access to this {contentType} only
          </p>
          {!canAfford(purchaseOptions.individualPrice, purchaseOptions.individualCurrency) && (
            <p className="text-sm text-red-600 ml-6 mt-1">
              Insufficient balance. You have {getCurrencyInfo(purchaseOptions.individualCurrency).symbol}{getBalance(purchaseOptions.individualCurrency)}
            </p>
          )}
        </div>

        {/* Course Purchase Options */}
        {purchaseOptions.courseOptions.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-gray-700 text-sm">Or get more value with a course:</h5>
            
            {purchaseOptions.courseOptions.map((courseOption) => (
              <div
                key={courseOption.courseId}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedOption === 'course' && selectedCourseId === courseOption.courseId
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedOption('course');
                  setSelectedCourseId(courseOption.courseId);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedOption === 'course' && selectedCourseId === courseOption.courseId
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedOption === 'course' && selectedCourseId === courseOption.courseId && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-800">Buy Full Course</span>
                    {courseOption.savings > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Save {getCurrencyInfo(courseOption.courseCurrency).symbol}{courseOption.savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {getCurrencyInfo(courseOption.courseCurrency).flag} {getCurrencyInfo(courseOption.courseCurrency).symbol}{courseOption.coursePrice}
                    </div>
                    {courseOption.savings > 0 && (
                      <div className="text-xs text-gray-500 line-through">
                        {getCurrencyInfo(courseOption.courseCurrency).symbol}{courseOption.totalIndividualPrice}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-6">
                  <p className="text-sm text-gray-800 font-medium mb-1">{courseOption.courseTitle}</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Access to all {courseOption.totalContent} lessons + course features
                  </p>
                  
                  {courseOption.hasAccess ? (
                    <p className="text-sm text-green-600">
                      <i className="fas fa-check-circle mr-1"></i>
                      You already have access to this course
                    </p>
                  ) : !canAfford(courseOption.coursePrice, courseOption.courseCurrency) ? (
                    <p className="text-sm text-red-600">
                      Insufficient balance. You have {getCurrencyInfo(courseOption.courseCurrency).symbol}{getBalance(courseOption.courseCurrency)}
                    </p>
                  ) : (
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>
                        <i className="fas fa-graduation-cap mr-1"></i>
                        Structured learning
                      </span>
                      <span>
                        <i className="fas fa-chart-line mr-1"></i>
                        Progress tracking
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {selectedOption && (
          <button
            onClick={() => handlePurchase(selectedOption)}
            disabled={
              isProcessing || 
              (selectedOption === 'individual' && !canAfford(purchaseOptions.individualPrice, purchaseOptions.individualCurrency)) ||
              (selectedOption === 'course' && selectedCourseId && !canAfford(
                purchaseOptions.courseOptions.find(c => c.courseId === selectedCourseId)?.coursePrice || 0,
                purchaseOptions.courseOptions.find(c => c.courseId === selectedCourseId)?.courseCurrency || ''
              ))
            }
            className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            <span>
              {isProcessing ? 'Processing...' : `Purchase ${selectedOption === 'individual' ? contentType : 'Course'}`}
            </span>
          </button>
        )}
        
        <button
          onClick={onFundWallet}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          <i className="fas fa-wallet mr-2"></i>
          Add Funds to Wallet
        </button>
      </div>
    </div>
  );
}