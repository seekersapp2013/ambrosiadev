import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConfig";
import { CoursePaymentFlow } from "./CoursePaymentFlow";

interface CourseViewerProps {
  courseId: Id<"courses">;
  onBack?: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function CourseViewer({ courseId, onBack, onNavigate }: CourseViewerProps) {
  const [selectedContentIndex, setSelectedContentIndex] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  
  const course = useQuery(api.courses.getCourse, { courseId });
  const courseProgress = useQuery(api.courseProgress.getCourseProgress, { courseId });
  const hasAccess = useQuery(api.courseProgress.hasContentAccess, 
    course?.content[selectedContentIndex] ? {
      contentType: course.content[selectedContentIndex].contentType,
      contentId: course.content[selectedContentIndex].contentId,
    } : "skip"
  );
  
  const enrollInCourse = useMutation(api.courseProgress.enrollInCourse);
  const markContentCompleted = useMutation(api.courseProgress.markContentCompleted);

  // Get cover image URL
  const coverImageUrl = useQuery(
    api.files.getFileUrl,
    course?.coverImage ? { storageId: course.coverImage } : "skip"
  );

  // Get author avatar URL
  const authorAvatarUrl = useQuery(
    api.files.getFileUrl,
    course?.author.avatar ? { storageId: course.author.avatar } : "skip"
  );

  if (!course) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  const selectedContent = course.content[selectedContentIndex];
  const currencyInfo = SUPPORTED_CURRENCIES[course.priceCurrency];
  const formattedPrice = `${currencyInfo?.flag || ''} ${currencyInfo?.symbol || course.priceCurrency} ${course.totalPrice}`;

  const handleEnroll = async () => {
    try {
      await enrollInCourse({ courseId });
      // Refresh the page or show success message
    } catch (error) {
      console.error("Failed to enroll:", error);
      alert("Failed to enroll in course. Please try again.");
    }
  };

  const handleContentComplete = async () => {
    if (!selectedContent || !courseProgress?.enrollment) return;
    
    try {
      await markContentCompleted({
        courseId,
        contentId: selectedContent.contentId,
        timeSpent: 300, // 5 minutes default
      });
    } catch (error) {
      console.error("Failed to mark content as completed:", error);
    }
  };

  const handleContentClick = (contentType: string, contentId: Id<"articles"> | Id<"reels">) => {
    // Navigate to private viewers - let them handle access control like ArticleCard does
    if (contentType === 'article') {
      onNavigate?.('private-article-viewer', { articleId: contentId });
    } else if (contentType === 'reel') {
      onNavigate?.('private-reel-viewer', { reelId: contentId });
    }
  };

  const isContentCompleted = (contentId: Id<"articles"> | Id<"reels">) => {
    return courseProgress?.completedContent.some(
      completed => completed.contentId === contentId
    ) || false;
  };

  // Check if user needs to enroll or purchase
  const needsEnrollment = !courseProgress?.enrollment;
  const needsPurchase = course.totalPrice > 0 && needsEnrollment;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
              <p className="text-sm text-gray-600">by {course.author.name || course.author.username}</p>
            </div>
          </div>
          
          {courseProgress?.enrollment && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-lg font-bold text-accent">
                  {courseProgress.progressPercentage}%
                </p>
              </div>
              <div className="w-20 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress.progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex">
        {/* Course Content Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto">
          {/* Course Info */}
          <div className="p-4 border-b border-gray-200">
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt={course.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {authorAvatarUrl ? (
                  <img
                    src={authorAvatarUrl}
                    alt={course.author.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-400"></i>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {course.author.name || course.author.username}
                </p>
                <p className="text-sm text-gray-500">{course.category}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3">{course.description}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{course.content.length} lessons</span>
              <span className="font-bold text-green-600">
                {course.totalPrice === 0 ? 'Free' : formattedPrice}
              </span>
            </div>

            {/* Enrollment/Purchase Button */}
            {needsEnrollment && (
              <div className="mt-4">
                {needsPurchase ? (
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="w-full bg-accent text-white py-2 px-4 rounded-lg font-medium hover:bg-accent/90"
                  >
                    Purchase Course - {formattedPrice}
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-accent text-white py-2 px-4 rounded-lg font-medium hover:bg-accent/90"
                  >
                    Enroll for Free
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Course Curriculum */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Course Content</h3>
            <div className="space-y-2">
              {course.content
                .sort((a, b) => a.order - b.order)
                .map((item, index) => {
                  const isCompleted = isContentCompleted(item.contentId);
                  const isSelected = selectedContentIndex === index;
                  
                  return (
                    <div
                      key={`${item.contentType}-${item.contentId}`}
                      className={`p-3 rounded-lg border transition-colors ${
                        isSelected 
                          ? 'bg-accent/10 border-accent' 
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex items-center space-x-3 flex-1 cursor-pointer"
                          onClick={() => setSelectedContentIndex(index)}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isCompleted ? (
                              <i className="fas fa-check"></i>
                            ) : (
                              index + 1
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <i className={`fas ${
                                item.contentType === 'article' ? 'fa-file-alt' : 'fa-video'
                              } text-gray-400 text-sm`}></i>
                              <h4 className="font-medium text-gray-800 text-sm">
                                {item.content?.title || item.content?.caption || 'Untitled'}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-500 capitalize">
                              {item.contentType}
                              {item.content?.isGated && (
                                <span className="ml-2 text-green-600">
                                  {item.content.priceToken} {item.content.priceAmount}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Open Content Button */}
                        <button
                          onClick={() => handleContentClick(item.contentType, item.contentId)}
                          className="bg-accent text-white px-3 py-1 rounded text-xs font-medium hover:bg-accent/90 transition-colors"
                        >
                          Open {item.contentType === 'article' ? 'Article' : 'Reel'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50">
          {selectedContent && courseProgress?.enrollment ? (
            <div className="p-6">
              <div className="bg-white rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedContent.content?.title || selectedContent.content?.caption || 'Untitled'}
                  </h2>
                  
                  {!isContentCompleted(selectedContent.contentId) && (
                    <button
                      onClick={handleContentComplete}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>

                <div className="text-center py-12">
                  <i className={`fas ${
                    selectedContent.contentType === 'article' ? 'fa-file-alt' : 'fa-video'
                  } text-4xl text-gray-400 mb-4`}></i>
                  <p className="text-gray-600 mb-4">
                    Click to view this {selectedContent.contentType}
                  </p>
                  <button
                    onClick={() => handleContentClick(selectedContent.contentType, selectedContent.contentId)}
                    className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90"
                  >
                    Open {selectedContent.contentType === 'article' ? 'Article' : 'Reel'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <i className="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  {needsEnrollment ? 'Enroll to Start Learning' : 'Select a lesson to begin'}
                </h3>
                <p className="text-gray-500">
                  {needsEnrollment 
                    ? 'Enroll in this course to access all lessons and track your progress.'
                    : 'Choose a lesson from the sidebar to start learning.'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <CoursePaymentFlow
            courseId={courseId}
            onSuccess={() => {
              setShowPaywall(false);
              // Refresh course progress
              window.location.reload();
            }}
            onFundWallet={() => {
              setShowPaywall(false);
              onNavigate?.('wallet-management');
            }}
            onClose={() => setShowPaywall(false)}
          />
        </div>
      )}
    </div>
  );
}