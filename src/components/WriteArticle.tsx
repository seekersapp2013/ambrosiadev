import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Editor } from '@tinymce/tinymce-react';
import { PaymentConfig } from './UnifiedPayment';

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
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const createArticle = useMutation(api.articles.createArticle);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const myProfile = useQuery(api.profiles.getMyProfile);

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

      await createArticle({
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        contentHtml: contentHtml,
        coverImage: coverImageId,
        tags: tagsArray,
        isGated,
        priceToken: isGated ? "USD" : undefined,
        priceAmount: isGated ? priceAmount : undefined,
        sellerAddress: isGated ? myProfile?.walletAddress : undefined,
        isSensitive,
      });

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
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <button onClick={onBack} className="text-gray-600">
          <i className="fas fa-times text-xl"></i>
        </button>
        <h1 className="text-lg font-semibold">New Article</h1>
        <button
          onClick={handleSubmit}
          disabled={!title.trim() || !content.trim() || isSubmitting}
          className={`px-4 py-2 rounded-lg font-medium ${title.trim() && content.trim() && !isSubmitting
            ? 'bg-accent text-white'
            : 'bg-gray-200 text-gray-400'
            }`}
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Title */}
        <div>
          <input
            type="text"
            placeholder="Article title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold placeholder-gray-400 border-none outline-none resize-none"
            maxLength={100}
          />
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
            contentType="article"
          />
        </div>
      </form>
    </div>
  );
}