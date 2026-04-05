import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CourseContentManagerProps {
  courseId: Id<"courses">;
  onBack?: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function CourseContentManager({ courseId, onBack, onNavigate }: CourseContentManagerProps) {
  const [showAddContent, setShowAddContent] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<'article' | 'reel'>('article');
  
  const course = useQuery(api.courses.getCourse, { courseId });
  const availableContent = useQuery(api.courses.getAvailableContentForCourse, { 
    courseId,
  });
  
  // Debug logging
  console.log('CourseContentManager - courseId:', courseId);
  console.log('CourseContentManager - course:', course);
  console.log('CourseContentManager - availableContent:', availableContent);
  
  const addContentToCourse = useMutation(api.courses.addContentToCourse);
  const removeContentFromCourse = useMutation(api.courses.removeContentFromCourse);
  const reorderCourseContent = useMutation(api.courses.reorderCourseContent);
  const publishCourse = useMutation(api.courses.publishCourse);
  const deleteCourse = useMutation(api.courses.deleteCourse);

  if (!course) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  const handleAddContent = async (contentId: Id<"articles"> | Id<"reels">) => {
    try {
      const nextOrder = course.content.length + 1;
      await addContentToCourse({
        courseId,
        contentType: selectedContentType,
        contentId,
        order: nextOrder,
        isRequired: true,
      });
      setShowAddContent(false);
    } catch (error) {
      console.error("Failed to add content:", error);
      alert("Failed to add content. Please try again.");
    }
  };

  const handleRemoveContent = async (contentType: string, contentId: Id<"articles"> | Id<"reels">) => {
    if (confirm("Are you sure you want to remove this content from the course?")) {
      try {
        await removeContentFromCourse({
          courseId,
          contentType,
          contentId,
        });
      } catch (error) {
        console.error("Failed to remove content:", error);
        alert("Failed to remove content. Please try again.");
      }
    }
  };

  const handleMoveContent = async (contentType: string, contentId: Id<"articles"> | Id<"reels">, direction: 'up' | 'down') => {
    const sortedContent = [...course.content].sort((a, b) => a.order - b.order);
    const currentIndex = sortedContent.findIndex(item => 
      item.contentType === contentType && item.contentId === contentId
    );
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= sortedContent.length) return;

    try {
      // Swap the items
      const temp = sortedContent[currentIndex];
      sortedContent[currentIndex] = sortedContent[newIndex];
      sortedContent[newIndex] = temp;

      // Create update array with new orders
      const contentUpdates = sortedContent.map((item, index) => ({
        contentType: item.contentType,
        contentId: item.contentId,
        newOrder: index + 1,
      }));

      await reorderCourseContent({
        courseId,
        contentUpdates,
      });
    } catch (error) {
      console.error("Failed to move content:", error);
      alert("Failed to move content. Please try again.");
    }
  };

  const handleDeleteCourse = async () => {
    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone and will remove all course content, enrollments, and progress data.`)) {
      try {
        await deleteCourse({ courseId });
        alert('Course deleted successfully!');
        // Navigate back to Learn screen - but stay on Learn tab
        onNavigate?.('ArticleScreen');
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handlePublishCourse = async () => {
    if (course.content.length === 0) {
      alert("Please add at least one piece of content before publishing.");
      return;
    }

    if (confirm("Are you sure you want to publish this course? It will be visible to all users.")) {
      try {
        await publishCourse({ courseId });
        alert("Course published successfully!");
        onNavigate?.('course-viewer', { courseId });
      } catch (error) {
        console.error("Failed to publish course:", error);
        alert("Failed to publish course. Please try again.");
      }
    }
  };

  const availableArticles = availableContent?.articles || [];
  const availableReels = availableContent?.reels || [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate?.('ArticleScreen')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <i className="fas fa-arrow-left text-gray-600"></i>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
            <p className="text-gray-600">Manage course content</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => onNavigate?.('edit-course', { courseId })}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <i className="fas fa-edit"></i>
            <span>Edit Course</span>
          </button>
          <button
            onClick={handleDeleteCourse}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <i className="fas fa-trash"></i>
            <span>Delete Course</span>
          </button>
          {!course.isPublished && (
            <button
              onClick={handlePublishCourse}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <i className="fas fa-rocket"></i>
              <span>Publish Course</span>
            </button>
          )}
          {course.isPublished && (
            <span className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
              <i className="fas fa-check-circle mr-1"></i>
              Published
            </span>
          )}
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Total Content</h3>
            <p className="text-2xl font-bold text-accent">{course.content.length}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Total Price</h3>
            <p className="text-2xl font-bold text-green-600">
              {course.totalPrice === 0 ? 'Free' : `${course.priceCurrency} ${course.totalPrice}`}
            </p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Category</h3>
            <p className="text-lg text-gray-600">{course.category}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-800 mb-1">Status</h3>
            <div className="flex items-center space-x-2">
              {course.isPublished ? (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  <i className="fas fa-check-circle mr-1"></i>
                  Published
                </span>
              ) : (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <i className="fas fa-edit mr-1"></i>
                  Draft
                </span>
              )}
            </div>
          </div>
        </div>
        
        {course.isPublished && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
              <div>
                <p className="text-sm text-blue-700">
                  <strong>Published Course:</strong> This course is live and visible to all users. 
                  You can still add or remove content, but major changes may affect enrolled students.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Course Content</h2>
          <button
            onClick={() => setShowAddContent(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Content</span>
          </button>
        </div>

        {course.content.length === 0 ? (
          <div className="p-8 text-center">
            <i className="fas fa-plus-circle text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-600 mb-2">No content added yet</h3>
            <p className="text-gray-500 mb-4">
              Add articles and reels to build your course curriculum.
            </p>
            <button
              onClick={() => setShowAddContent(true)}
              className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90"
            >
              Add Your First Content
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {course.content
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
                <div key={`${item.contentType}-${item.contentId}`} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${item.contentType === 'article' ? 'fa-file-alt' : 'fa-video'} text-gray-400`}></i>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {item.content?.title || item.content?.caption || 'Untitled'}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {item.contentType} • {item.isRequired ? 'Required' : 'Optional'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Move Up Button */}
                    {index > 0 && (
                      <button
                        onClick={() => handleMoveContent(item.contentType, item.contentId, 'up')}
                        className="text-gray-400 hover:text-gray-600 p-2"
                        title="Move Up"
                      >
                        <i className="fas fa-chevron-up"></i>
                      </button>
                    )}
                    {/* Move Down Button */}
                    {index < course.content.length - 1 && (
                      <button
                        onClick={() => handleMoveContent(item.contentType, item.contentId, 'down')}
                        className="text-gray-400 hover:text-gray-600 p-2"
                        title="Move Down"
                      >
                        <i className="fas fa-chevron-down"></i>
                      </button>
                    )}
                    {item.content?.isGated && (
                      <span className="text-sm text-green-600 font-medium">
                        {item.content.priceToken} {item.content.priceAmount}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveContent(item.contentType, item.contentId)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove from Course"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Add Content to Course</h3>
              <button
                onClick={() => setShowAddContent(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Content Type Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSelectedContentType('article')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  selectedContentType === 'article'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Articles ({availableArticles.length})
              </button>
              <button
                onClick={() => setSelectedContentType('reel')}
                className={`flex-1 py-3 px-4 text-center font-medium ${
                  selectedContentType === 'reel'
                    ? 'text-accent border-b-2 border-accent bg-accent/5'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reels ({availableReels.length})
              </button>
            </div>

            {/* Content List */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {selectedContentType === 'article' ? (
                availableArticles.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-file-alt text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-500 mb-4">No available articles</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowAddContent(false);
                          onNavigate?.('write-article');
                        }}
                        className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-accent/90"
                      >
                        Create New Article
                      </button>
                      <p className="text-xs text-gray-500">
                        Create a new article and it will be available to add to your course
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700">Want to create new content?</p>
                        <button
                          onClick={() => {
                            setShowAddContent(false);
                            onNavigate?.('write-article');
                          }}
                          className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700"
                        >
                          New Article
                        </button>
                      </div>
                    </div>
                    {availableArticles.map((article) => (
                      <div
                        key={article._id}
                        onClick={() => handleAddContent(article._id)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <h4 className="font-medium text-gray-800">{article.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-2">{article.subtitle}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                          {article.isGated && (
                            <span className="text-xs text-green-600 font-medium">
                              {article.priceToken} {article.priceAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                availableReels.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-video text-3xl text-gray-400 mb-2"></i>
                    <p className="text-gray-500 mb-4">No available reels</p>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setShowAddContent(false);
                          onNavigate?.('write-reel');
                        }}
                        className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-accent/90"
                      >
                        Create New Reel
                      </button>
                      <p className="text-xs text-gray-500">
                        Create a new reel and it will be available to add to your course
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700">Want to create new content?</p>
                        <button
                          onClick={() => {
                            setShowAddContent(false);
                            onNavigate?.('write-reel');
                          }}
                          className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700"
                        >
                          New Reel
                        </button>
                      </div>
                    </div>
                    {availableReels.map((reel) => (
                      <div
                        key={reel._id}
                        onClick={() => handleAddContent(reel._id)}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <h4 className="font-medium text-gray-800">
                          {reel.caption || 'Untitled Reel'}
                        </h4>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(reel.createdAt).toLocaleDateString()}
                          </span>
                          {reel.isGated && (
                            <span className="text-xs text-green-600 font-medium">
                              {reel.priceToken} {reel.priceAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}