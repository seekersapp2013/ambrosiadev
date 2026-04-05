import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CourseIndicatorProps {
  contentType: "article" | "reel";
  contentId: Id<"articles"> | Id<"reels">;
  onNavigate?: (screen: string, data?: any) => void;
}

export function CourseIndicator({ contentType, contentId, onNavigate }: CourseIndicatorProps) {
  const coursesInfo = useQuery(api.courses.getCoursesForContent, {
    contentType,
    contentId,
  });

  if (!coursesInfo || coursesInfo.length === 0) {
    return null;
  }

  // Show the first published course (since content can only be in one course now)
  const courseInfo = coursesInfo.find(course => course.isPublished) || coursesInfo[0];

  if (!courseInfo) {
    return null;
  }

  return (
    <div 
      className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 shadow-lg z-10"
      title={`Part of course: ${courseInfo.courseTitle}`}
    >
      <i className="fas fa-graduation-cap text-xs"></i>
      <span className="font-medium">
        {courseInfo.position}/{courseInfo.totalContent}
      </span>
    </div>
  );
}