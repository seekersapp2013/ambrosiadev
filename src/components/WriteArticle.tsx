import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Editor } from '@tinymce/tinymce-react';
import { PaymentConfig } from './UnifiedPayment';
import { Id } from "../../convex/_generated/dataModel";

interface WriteArticleProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

export function WriteArticle({ onBack, onNavigate }: WriteArticleProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [priceAmount, setPriceAmount] = useState(1);
  const [priceCurrency, setPriceCurrency] = useState("USD");
  const [isSensitive, setIsSensitive] = useState(false);
  const [isPublic, setIsPublic] = useState(true); // New field for content visibility
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<Id<"courses"> | "">("");
  const [addToCourse, setAddToCourse] = useState(false);

  const createArticle = useMutation(api.articles.createArticle);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const addContentToCourse = useMutation(api.courses.addContentToCourse);
  const myProfile = useQuery(api.profiles.getMyProfile);
  const walletBalance = useQuery(api.wallets.getWalletBalance.getWalletBalance);
  const myCourses = useQuery(api.courses.listCourses, { 
    authorId: myProfile?.userId,
    limit: 50 
  });

  // Set default currency to user's primary currency
  useState(() => {
    if (walletBalance?.primaryCurrency && priceCurrency === "USD") {
      setPriceCurrency(walletBalance.primaryCurrency);
    }
  });

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
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      let coverImageId: string | undefined;

      // Upload cover image if selected
      if (coverImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": coverImage.type },
          body: coverImage,
        });
        const { storageId } = await result.json();
        coverImageId = storageId;
      }

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      // TinyMCE already provides HTML content, just validate it
      const contentHtml = content.trim();

      // Validate contentHtml before submission
      if (!contentHtml || contentHtml.trim().length === 0 || contentHtml === '<p></p>') {
        alert("Article content cannot be empty. Please add some content before publishing.");
        setIsSubmitting(false);
        return;
      }

      console.log("WriteArticle - Creating article with contentHtml:", {
        title: title.trim(),
        contentLength: contentHtml.length,
        contentPreview: contentHtml.substring(0, 200) + '...',
        hasValidHTML: contentHtml.includes('<p>')
      });

      const articleId = await createArticle({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        contentHtml: contentHtml,
        coverImage: coverImageId,
        tags: tagsArray,
        isGated,
        priceToken: isGated ? priceCurrency : undefined,
        priceAmount: isGated ? priceAmount : undefined,
        isSensitive,
        isPublic, // Add the new field
      });

      // Add to course if selected
      if (addToCourse && selectedCourseId) {
        try {
          // Get course to determine next order
          const course = await fetch(`/api/courses/${selectedCourseId}`).catch(() => null);
          const nextOrder = course ? (course as any).content?.length + 1 : 1;
          
          await addContentToCourse({
            courseId: selectedCourseId as Id<"courses">,
            contentType: "article",
            contentId: articleId,
            order: nextOrder,
            isRequired: true,
          });
        } catch (error) {
          console.error("Failed to add article to course:", error);
          // Don't fail the whole operation, just show a warning
          alert("Article created successfully, but failed to add to course. You can add it manually later.");
        }
      }

      // Navigate back to stream
      onNavigate?.('stream-screen');
    } catch (error) {
      console.error("Failed to create article:", error);
      alert("Failed to create article. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Write Article</h1>
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold placeholder-gray-400 border-none outline-none"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {title.length}/100 characters
          </p>
        </div>

        {/* Subtitle */}
        <div>
          <input
            type="text"
            placeholder="Subtitle (optional)..."
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full text-lg text-gray-600 placeholder-gray-400 border-none outline-none"
            maxLength={200}
          />
        </div>

        {/* Content */}
        <div>
          <Editor
            apiKey='fgn8wuks4i2eogtmxfl9qp3sfqieyocuyymxxketywgwnfiz'
            value={content}
            onEditorChange={(content) => setContent(content)}
            init={{
              height: 400,
              menubar: false,
              plugins: [
                'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount', 'fullscreen', 'textcolor', 'colorpicker', 'code', 'insertdatetime', 'nonbreaking', 'pagebreak', 'preview', 'print', 'save', 'directionality', 'help'
              ],
              toolbar: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | link image media table | hr blockquote codesample | removeformat | fullscreen',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              placeholder: 'Write your article...',
            }}
          />
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cover Image (optional)
          </label>

          {!coverImagePreview ? (
            <div
              onClick={() => document.getElementById('cover-image-input')?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
            >
              <i className="fas fa-image text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 mb-2">Click to select a cover image</p>
              <p className="text-sm text-gray-500">JPG, PNG, GIF up to 10MB</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="w-full max-h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setCoverImage(null);
                  setCoverImagePreview(null);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <input
            id="cover-image-input"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>

        {/* Tags */}
        <div>
          <input
            type="text"
            placeholder="Tags (comma separated)..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full text-sm text-gray-600 placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: health, wellness, fitness
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          {/* Content Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  checked={isPublic}
                  onChange={() => setIsPublic(true)}
                  className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Public</span>
                  <p className="text-xs text-gray-500">Shows in stream and available for courses</p>
                </div>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="visibility"
                  checked={!isPublic}
                  onChange={() => setIsPublic(false)}
                  className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Course-only</span>
                  <p className="text-xs text-gray-500">Only available for courses, never shows in stream</p>
                </div>
              </label>
            </div>
          </div>

          {/* Sensitive Content */}
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={isSensitive}
              onChange={(e) => setIsSensitive(e.target.checked)}
              className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
            />
            <span className="text-sm text-gray-700">
              Mark as sensitive content
            </span>
          </label>

          {/* Payment Section */}
          <PaymentConfig
            isGated={isGated}
            setIsGated={setIsGated}
            priceAmount={priceAmount}
            setPriceAmount={setPriceAmount}
            priceCurrency={priceCurrency}
            setPriceCurrency={setPriceCurrency}
            contentType="article"
          />

          {/* Course Integration */}
          {myCourses && myCourses.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={addToCourse}
                  onChange={(e) => setAddToCourse(e.target.checked)}
                  className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent"
                />
                <span className="text-sm text-gray-700">
                  Add to course
                </span>
              </label>

              {addToCourse && (
                <div className="ml-7">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value as Id<"courses"> | "")}
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 bg-white"
                  >
                    <option value="">Select a course</option>
                    {myCourses.filter(course => !course.isPublished).map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only unpublished courses are shown
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3 pt-6">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="flex-1 bg-accent text-white py-3 px-4 rounded-lg font-medium hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>
    </div>
  );
}