import { useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { UnifiedContentCard } from "./UnifiedContentCard";

interface LearnScreenProps {
  onNavigate?: (screen: string, data?: any) => void;
}

export function LearnScreen({ onNavigate }: LearnScreenProps) {
  const [viewMode, setViewMode] = useState<'all' | 'my-courses' | 'enrolled'>('all');
  
  // Get course-related content based on view mode
  const courseContent = useQuery(api.courses.getCourseRelatedContent, { 
    limit: 50,
    viewMode 
  });

  // Combine articles and reels into unified content
  const content = courseContent ? [
    ...courseContent.articles.map(article => ({ ...article, contentType: "article" as const })),
    ...courseContent.reels.map(reel => ({ ...reel, contentType: "reel" as const }))
  ].sort((a, b) => b.createdAt - a.createdAt) : undefined;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header with Create Buttons */}
      <div className="bg-white py-3 px-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-bold text-gray-800">Learn</h1>
        </div>
        
        {/* Creation Buttons */}
        <div className="flex space-x-4 overflow-x-auto">
          {/* Create Article */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-article')}
              className="w-16 h-16 rounded-full bg-accent text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-pen text-lg"></i>
            </button>
            <span className="text-xs">Article</span>
          </div>
          
          {/* Create Reel */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('write-reel')}
              className="w-16 h-16 rounded-full bg-purple-500 text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-video text-lg"></i>
            </button>
            <span className="text-xs">Reel</span>
          </div>
          
          {/* Create Course */}
          <div className="flex flex-col items-center">
            <button 
              onClick={() => onNavigate?.('create-course')}
              className="w-16 h-16 rounded-full bg-blue-600 text-white border-2 border-white flex items-center justify-center mb-1"
            >
              <i className="fas fa-graduation-cap text-lg"></i>
            </button>
            <span className="text-xs">Course</span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setViewMode('all')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              viewMode === 'all'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Content
          </button>
          <button
            onClick={() => setViewMode('my-courses')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              viewMode === 'my-courses'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Content
          </button>
          <button
            onClick={() => setViewMode('enrolled')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              viewMode === 'enrolled'
                ? 'text-accent border-b-2 border-accent bg-accent/5'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Enrolled
          </button>
        </div>
      </div>

      {/* Content Feed */}
      <div className="mb-4">
        {courseContent === undefined ? (
          // Loading state
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : content && content.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <i className="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-lg font-bold text-gray-600 mb-2">
              {viewMode === 'all' 
                ? 'No course content available'
                : viewMode === 'my-courses'
                ? 'No course content created yet'
                : 'No enrolled course content'
              }
            </h3>
            <p className="text-gray-500 text-center mb-4">
              {viewMode === 'all' 
                ? 'Be the first to create course content and share your knowledge!'
                : viewMode === 'my-courses'
                ? 'Create your first article or reel for a course to start teaching others.'
                : 'Enroll in courses to access their content and start learning.'
              }
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => onNavigate?.('write-article')}
                className="bg-accent text-white px-6 py-3 rounded-lg font-medium"
              >
                Create Article
              </button>
              <button 
                onClick={() => onNavigate?.('write-reel')}
                className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create Reel
              </button>
              <button 
                onClick={() => onNavigate?.('create-course')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Create Course
              </button>
            </div>
          </div>
        ) : (
          // Content list
          content?.map((item: any) => (
            <UnifiedContentCard 
              key={item._id} 
              content={item} 
              onNavigate={onNavigate}
            />
          ))
        )}
      </div>
    </div>
  );
}