import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { SUPPORTED_CURRENCIES } from "../utils/currencyConfig";

interface EditCourseProps {
  courseId: Id<"courses">;
  onBack?: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function EditCourse({ courseId, onBack, onNavigate }: EditCourseProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [currentCoverImageId, setCurrentCoverImageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const course = useQuery(api.courses.getCourse, { courseId });
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const updateCourse = useMutation(api.courses.updateCourse);
  const publishCourse = useMutation(api.courses.publishCourse);

  // Get current cover image URL
  const currentCoverImageUrl = useQuery(
    api.files.getFileUrl,
    currentCoverImageId ? { storageId: currentCoverImageId } : "skip"
  );

  const categories = [
    "Technology",
    "Health & Wellness", 
    "Business",
    "Creative Arts",
    "Education",
    "Lifestyle",
    "Science",
    "Sports & Fitness",
    "Personal Development",
    "Other"
  ];

  // Initialize form with course data
  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description);
      setCategory(course.category);
      setTags(course.tags.join(', '));
      setPriceCurrency(course.priceCurrency);
      setCurrentCoverImageId(course.coverImage || null);
    }
  }, [course]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverImagePreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert("Please enter a course title");
      return;
    }
    
    if (!description.trim()) {
      alert("Please enter a course description");
      return;
    }
    
    if (!category) {
      alert("Please select a category");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let coverImageId: string | undefined = currentCoverImageId || undefined;

      // Upload new cover image if selected
      if (coverImage) {
        try {
          const uploadUrl = await generateUploadUrl();
          const result = await fetch(uploadUrl, {
            method: "POST",
            headers: { "Content-Type": coverImage.type },
            body: coverImage,
          });
          
          if (result.ok) {
            const { storageId } = await result.json();
            coverImageId = storageId;
          }
        } catch (error) {
          console.error("Failed to upload image:", error);
          // Continue with existing image
        }
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      await updateCourse({
        courseId,
        title: title.trim(),
        description: description.trim(),
        category,
        tags: tagsArray,
        priceCurrency,
        coverImage: coverImageId,
      });

      alert("Course updated successfully!");
      onNavigate?.('course-content-manager', { courseId });
      
    } catch (error) {
      console.error("Failed to update course:", error);
      alert(`Failed to update course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!course) return;

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

  if (!course) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-accent border-t-transparent rounded-full mr-3"></div>
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="fas fa-arrow-left text-gray-600"></i>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Edit Course</h1>
              <p className="text-sm text-gray-600">
                {course.isPublished ? 'Published Course' : 'Draft Course'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onNavigate?.('course-content-manager', { courseId })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <i className="fas fa-cog"></i>
              <span>Manage Content</span>
            </button>
            {!course.isPublished && (
              <button
                onClick={handlePublishCourse}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <i className="fas fa-rocket"></i>
                <span>Publish</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging course title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="javascript, web development, beginner"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Currency
              </label>
              <select
                value={priceCurrency}
                onChange={(e) => setPriceCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                {Object.values(SUPPORTED_CURRENCIES).map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.flag} {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Course price: {course.totalPrice === 0 ? 'Free' : `${course.priceCurrency} ${course.totalPrice}`}
              </p>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                {coverImagePreview || currentCoverImageUrl ? (
                  <div className="relative">
                    <img
                      src={coverImagePreview || currentCoverImageUrl || ''}
                      alt="Cover preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImage(null);
                        setCoverImagePreview(null);
                        if (!coverImagePreview) {
                          setCurrentCoverImageId(null);
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <i className="fas fa-times text-sm"></i>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <i className="fas fa-image text-4xl text-gray-400 mb-3"></i>
                    <p className="text-gray-600 mb-3">Add a cover image to make your course more appealing</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Choose Image
                    </button>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Course Stats */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Content Items</h4>
                  <p className="text-2xl font-bold text-blue-600">{course.content.length}</p>
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Status</h4>
                  <p className="text-lg font-medium text-blue-600">
                    {course.isPublished ? 'Published' : 'Draft'}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
              >
                {isSubmitting && (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                )}
                <span>{isSubmitting ? 'Updating...' : 'Update Course'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}