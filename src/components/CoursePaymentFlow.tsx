import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConfig";

interface CoursePaymentFlowProps {
  courseId: Id<"courses">;
  onSuccess?: () => void;
  onFundWallet?: () => void;
  onClose?: () => void;
}

export function CoursePaymentFlow({ 
  courseId, 
  onSuccess, 
  onFundWallet,
  onClose 
}: CoursePaymentFlowProps) {
  const [selectedOption, setSelectedOption] = useState<'course' | 'individual' | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const course = useQuery(api.courses.getCourse, { courseId });
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance);
  const purchaseContent = useMutation(api.payments.purchaseContent);

  if (!course) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-gray-500">Loading course details...</p>
      </div>
    );
  }

  const currencyInfo = SUPPORTED_CURRENCIES[course.priceCurrency];
  const formattedCoursePrice = `${currencyInfo?.flag || ''} ${currencyInfo?.symbol || course.priceCurrency} ${course.totalPrice}`;

  // Calculate individual items total
  const calculateIndividualTotal = () => {
    let total = 0;
    course.content.forEach((item) => {
      const itemKey = `${item.contentType}-${item.contentId}`;
      if (selectedItems.has(itemKey) && item.content?.isGated && item.content?.priceAmount) {
        if (item.content.priceToken === course.priceCurrency) {
          total += item.content.priceAmount;
        }
      }
    });
    return total;
  };

  const individualTotal = calculateIndividualTotal();
  const formattedIndividualTotal = `${currencyInfo?.flag || ''} ${currencyInfo?.symbol || course.priceCurrency} ${individualTotal}`;

  const getBalance = (currency: string) => {
    if (!walletBalance?.balances) return 0;
    return walletBalance.balances[currency as keyof typeof walletBalance.balances] || 0;
  };

  const canAfford = (price: number, currency: string) => {
    return getBalance(currency) >= price;
  };

  const handlePurchase = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      if (selectedOption === 'course') {
        await purchaseContent({
          contentType: 'course',
          contentId: courseId,
          priceToken: course.priceCurrency,
          priceAmount: course.totalPrice,
        });
      } else if (selectedOption === 'individual' && selectedItems.size > 0) {
        for (const itemKey of selectedItems) {
          const [contentType, contentId] = itemKey.split('-');
          const item = course.content.find(c => 
            c.contentType === contentType && c.contentId === contentId
          );
          
          if (item?.content?.isGated && item.content?.priceAmount) {
            await purchaseContent({
              contentType: contentType as 'article' | 'reel',
              contentId: contentId as Id<"articles"> | Id<"reels">,
              priceToken: item.content.priceToken,
              priceAmount: item.content.priceAmount,
            });
          }
        }
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(error instanceof Error ? error.message : 'Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItemSelection = (contentType: string, contentId: string) => {
    const itemKey = `${contentType}-${contentId}`;
    const newSelection = new Set(selectedItems);
    
    if (newSelection.has(itemKey)) {
      newSelection.delete(itemKey);
    } else {
      newSelection.add(itemKey);
    }
    
    setSelectedItems(newSelection);
  };

  const selectAllItems = () => {
    const allGatedItems = new Set<string>();
    course.content.forEach((item) => {
      if (item.content?.isGated && item.content?.priceAmount) {
        allGatedItems.add(`${item.contentType}-${item.contentId}`);
      }
    });
    setSelectedItems(allGatedItems);
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
  };

  // Filter gated content
  const gatedContent = course.content.filter(item => 
    item.content?.isGated && item.content?.priceAmount
  );

  const savings = course.totalPrice < individualTotal ? individualTotal - course.totalPrice : 0;

  return (
    <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Purchase Course Content</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Course Info */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="font-medium text-gray-800 mb-1">{course.title}</h4>
        <p className="text-sm text-gray-600 mb-2">{course.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">{course.content.length} total lessons</span>
          <span className="text-gray-500">{gatedContent.length} paid lessons</span>
        </div>
      </div>

      {/* Purchase Options */}
      <div className="p-4 space-y-4">
        {/* Full Course Option */}
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
            selectedOption === 'course' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedOption('course')}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full border-2 ${
                selectedOption === 'course' 
                  ? 'border-green-500 bg-green-500' 
                  : 'border-gray-300'
              }`}>
                {selectedOption === 'course' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <span className="font-medium text-gray-800">Buy Full Course</span>
              {savings > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                  Save {currencyInfo?.symbol}{savings.toFixed(2)}
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">
                {course.totalPrice === 0 ? 'Free' : formattedCoursePrice}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 ml-6">
            Get access to all {course.content.length} lessons + course features
          </p>
          {course.totalPrice > 0 && !canAfford(course.totalPrice, course.priceCurrency) && (
            <p className="text-sm text-red-600 ml-6 mt-1">
              Insufficient balance. You have {currencyInfo?.symbol}{getBalance(course.priceCurrency)}
            </p>
          )}
        </div>

        {/* Individual Items Option */}
        {gatedContent.length > 0 && (
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
                <span className="font-medium text-gray-800">Buy Individual Lessons</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent">
                  {selectedItems.size > 0 ? formattedIndividualTotal : 'Select items'}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 ml-6 mb-3">
              Choose specific lessons you want to purchase
            </p>

            {/* Individual Items Selection */}
            {selectedOption === 'individual' && (
              <div className="ml-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Select lessons ({selectedItems.size} of {gatedContent.length} selected)
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectAllItems();
                      }}
                      className="text-xs text-accent hover:text-accent/80"
                    >
                      Select All
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearSelection();
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2">
                  {gatedContent.map((item, index) => {
                    const itemKey = `${item.contentType}-${item.contentId}`;
                    const isSelected = selectedItems.has(itemKey);
                    const itemCurrency = SUPPORTED_CURRENCIES[item.content?.priceToken || ''];
                    
                    return (
                      <div
                        key={itemKey}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemSelection(item.contentType, item.contentId);
                        }}
                        className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-accent bg-accent/10' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isSelected 
                              ? 'border-accent bg-accent' 
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <i className="fas fa-check text-white text-xs"></i>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <i className={`fas ${
                                item.contentType === 'article' ? 'fa-file-alt' : 'fa-video'
                              } text-gray-400 text-sm`}></i>
                              <span className="text-sm font-medium text-gray-800">
                                {item.content?.title || item.content?.caption || 'Untitled'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 capitalize">
                              Lesson {item.order} • {item.contentType}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800">
                            {itemCurrency?.symbol}{item.content?.priceAmount}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedItems.size > 0 && !canAfford(individualTotal, course.priceCurrency) && (
                  <p className="text-sm text-red-600">
                    Insufficient balance. You have {currencyInfo?.symbol}{getBalance(course.priceCurrency)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {selectedOption && (
          <button
            onClick={handlePurchase}
            disabled={
              isProcessing || 
              (selectedOption === 'course' && course.totalPrice > 0 && !canAfford(course.totalPrice, course.priceCurrency)) ||
              (selectedOption === 'individual' && (selectedItems.size === 0 || !canAfford(individualTotal, course.priceCurrency)))
            }
            className="w-full bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isProcessing && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            <span>
              {isProcessing 
                ? 'Processing...' 
                : selectedOption === 'course' 
                  ? `Purchase Course - ${formattedCoursePrice}`
                  : `Purchase Selected (${selectedItems.size}) - ${formattedIndividualTotal}`
              }
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

      {/* Balance Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Your {course.priceCurrency} Balance:</span>
          <span className={`font-medium ${
            getBalance(course.priceCurrency) > 0 ? 'text-green-600' : 'text-gray-600'
          }`}>
            {currencyInfo?.symbol}{getBalance(course.priceCurrency).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}