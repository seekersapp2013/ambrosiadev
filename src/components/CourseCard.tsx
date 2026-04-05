import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConfig";

interface CourseCardProps {
  course: {
    _id: Id<"courses">;
    title: string;
    description: string;
    coverImage?: string;
    category: string;
    tags: string[];
    totalPrice: number;
    priceCurrency: string;
    authorId?: Id<"users">; // Add authorId to check ownership
    author: {
      id?: Id<"users">;
      name?: string;
      username?: string;
      avatar?: string;
    };
    contentCount?: number;
    enrollmentCount?: number;
    createdAt: number;
    // For enrolled courses
    enrollment?: any;
    progress?: any;
  };
  onNavigate?: (screen: string, data?: any) => void;
  showProgress?: boolean;
  showDeleteButton?: boolean; // New prop to control delete button visibility
}

export function CourseCard({ course, onNavigate, showProgress = false, showDeleteButton = false }: CourseCardProps) {
  // Get current user profile to check ownership
  const myProfile = useQuery(api.profiles.getMyProfile);
  const deleteCourse = useMutation(api.courses.deleteCourse);
  
  // Get cover image URL
  const coverImageUrl = useQuery(
    api.files.getFileUrl,
    course.coverImage ? { storageId: course.coverImage } : "skip"
  );

  // Get author avatar URL
  const authorAvatarUrl = useQuery(
    api.files.getFileUrl,
    course.author.avatar ? { storageId: course.author.avatar } : "skip"
  );

  // Format price
  const currencyInfo = SUPPORTED_CURRENCIES[course.priceCurrency];
  const formattedPrice = `${currencyInfo?.flag || ''} ${currencyInfo?.symbol || course.priceCurrency} ${course.totalPrice}`;

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleClick = () => {
    onNavigate?.('course-viewer', { courseId: course._id });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when deleting
    
    if (confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone and will remove all course content, enrollments, and progress data.`)) {
      try {
        await deleteCourse({ courseId: course._id });
        alert('Course deleted successfully!');
        // The course list will automatically update due to reactive queries
        // No navigation needed - just let Convex handle the data refresh
      } catch (error) {
        console.error('Failed to delete course:', error);
        alert('Failed to delete course. Please try again.');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when editing
    onNavigate?.('edit-course', { courseId: course._id });
  };

  // Check if current user owns this course
  const isOwner = myProfile?.userId === course.authorId || myProfile?.userId === course.author.id;

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Cover Image */}
      <div className="aspect-video bg-gray-100 relative">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="fas fa-graduation-cap text-3xl text-gray-400"></i>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {course.category}
        </div>

        {/* Price Badge */}
        <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded font-medium">
          {course.totalPrice === 0 ? 'Free' : formattedPrice}
        </div>

        {/* Delete Button - Only show for course owners */}
        {showDeleteButton && isOwner && (
          <button
            onClick={handleDelete}
            className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors shadow-lg"
            title="Delete Course"
          >
            <i className="fas fa-trash text-xs"></i>
          </button>
        )}

        {/* Edit Button - Only show for course owners */}
        {showDeleteButton && isOwner && (
          <button
            onClick={handleEdit}
            className="absolute bottom-2 right-12 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors shadow-lg"
            title="Edit Course"
          >
            <i className="fas fa-edit text-xs"></i>
          </button>
        )}

        {/* Owner Badge */}
        {showDeleteButton && isOwner && (
          <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            <i className="fas fa-user-crown mr-1"></i>
            Owner
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
            {authorAvatarUrl ? (
              <img
                src={authorAvatarUrl}
                alt={course.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="fas fa-user text-xs text-gray-400"></i>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-600">
            {course.author.name || course.author.username || 'Unknown Author'}
          </span>
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <i className="fas fa-play-circle"></i>
              <span>{course.contentCount || 0} lessons</span>
            </span>
            {course.enrollmentCount !== undefined && (
              <span className="flex items-center space-x-1">
                <i className="fas fa-users"></i>
                <span>{course.enrollmentCount} students</span>
              </span>
            )}
            <span>{formatDate(course.createdAt)}</span>
          </div>
        </div>

        {/* Progress Bar for Enrolled Courses */}
        {showProgress && course.progress && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span>{course.progress.progressPercentage || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${course.progress.progressPercentage || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {course.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {course.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
            {course.tags.length > 3 && (
              <span className="text-gray-400 text-xs">
                +{course.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}