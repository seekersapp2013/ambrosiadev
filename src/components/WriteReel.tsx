import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PaymentConfig } from './UnifiedPayment';

interface WriteReelProps {
  onBack?: () => void;
  onNavigate?: (screen: string) => void;
}

export function WriteReel({ onBack, onNavigate }: WriteReelProps) {
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isGated, setIsGated] = useState(false);
  const [priceAmount, setPriceAmount] = useState(1);
  const [isSensitive, setIsSensitive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createReel = useMutation(api.reels.createReel);
  const myProfile = useQuery(api.profiles.getMyProfile);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      alert("Please select a video file");
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload video file
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": videoFile.type },
        body: videoFile,
      });
      const { storageId } = await result.json();

      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      await createReel({
        video: storageId,
        caption: caption.trim() || undefined,
        tags: tagsArray,
        isGated,
        priceToken: isGated ? "USD" : undefined,
        priceAmount: isGated ? priceAmount : undefined,
        sellerAddress: isGated && myProfile?.walletAddress ? myProfile.walletAddress : undefined,
        isSensitive,
      });

      // Navigate back to reels
      onNavigate?.('reels-screen');
    } catch (error) {
      console.error("Failed to create reel:", error);
      alert("Failed to create reel. Please try again.");
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
        <h1 className="text-lg font-semibold">New Reel</h1>
        <button
          onClick={handleSubmit}
          disabled={!videoFile || isSubmitting}
          className={`px-4 py-2 rounded-lg font-medium ${
            videoFile && !isSubmitting
              ? 'bg-accent text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          {isSubmitting ? 'Uploading...' : 'Share'}
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Video Upload */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Video
          </label>
          
          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
            >
              <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600 mb-2">Click to select a video</p>
              <p className="text-sm text-gray-500">MP4, MOV, AVI up to 100MB</p>
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full max-h-64 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Caption */}
        <div>
          <textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full h-24 text-base placeholder-gray-400 border border-gray-200 rounded-lg px-3 py-2 resize-none"
            rows={3}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {caption.length}/500 characters
          </p>
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
            Example: fitness, workout, health
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
            contentType="reel"
          />
        </div>
      </form>
    </div>
  );
}