import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface CircleCreationFormProps {
  onSuccess?: (circleId: string) => void;
  onCancel?: () => void;
}

export function CircleCreationForm({ onSuccess, onCancel }: CircleCreationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    accessType: 'FREE' as 'FREE' | 'PAID',
    price: '',
    priceCurrency: 'USD',
    maxMembers: '',
    tags: '',
    postingPermission: 'EVERYONE' as 'EVERYONE' | 'ADMINS_ONLY',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCircle = useMutation(api.circles.createCircle);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Circle name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.accessType === 'PAID' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError('Price must be greater than 0 for paid circles');
      return;
    }

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const result = await createCircle({
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        accessType: formData.accessType,
        price: formData.accessType === 'PAID' ? parseFloat(formData.price) : undefined,
        priceCurrency: formData.accessType === 'PAID' ? formData.priceCurrency : undefined,
        maxMembers: formData.maxMembers ? parseInt(formData.maxMembers) : undefined,
        tags: tags.length > 0 ? tags : undefined,
        postingPermission: formData.postingPermission,
      });

      onSuccess?.(result.circleId);
    } catch (err: any) {
      setError(err.message || 'Failed to create circle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Circle</h2>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Circle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circle Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Mental Health Support Group"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what your circle is about..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
          </div>

          {/* Circle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Circle Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'PUBLIC' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === 'PUBLIC'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-globe text-lg mr-2"></i>
                  <span className="font-semibold">Public</span>
                </div>
                <p className="text-xs text-gray-600">Anyone can find and join</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'PRIVATE' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === 'PRIVATE'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-lock text-lg mr-2"></i>
                  <span className="font-semibold">Private</span>
                </div>
                <p className="text-xs text-gray-600">Invite-only access</p>
              </button>
            </div>
          </div>

          {/* Access Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, accessType: 'FREE' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.accessType === 'FREE'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-gift text-lg mr-2"></i>
                  <span className="font-semibold">Free</span>
                </div>
                <p className="text-xs text-gray-600">No payment required</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, accessType: 'PAID' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.accessType === 'PAID'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-dollar-sign text-lg mr-2"></i>
                  <span className="font-semibold">Paid</span>
                </div>
                <p className="text-xs text-gray-600">Requires payment to join</p>
              </button>
            </div>
          </div>

          {/* Price (if paid) */}
          {formData.accessType === 'PAID' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.priceCurrency}
                  onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="USD">USD ($)</option>
                  <option value="NGN">NGN (₦)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          )}

          {/* Posting Permission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Who Can Post?
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, postingPermission: 'EVERYONE' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.postingPermission === 'EVERYONE'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-users text-lg mr-2"></i>
                  <span className="font-semibold">Everyone</span>
                </div>
                <p className="text-xs text-gray-600">All members can post</p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, postingPermission: 'ADMINS_ONLY' })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.postingPermission === 'ADMINS_ONLY'
                    ? 'border-accent bg-accent/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <i className="fas fa-shield-alt text-lg mr-2"></i>
                  <span className="font-semibold">Admins Only</span>
                </div>
                <p className="text-xs text-gray-600">Only admins can post</p>
              </button>
            </div>
          </div>

          {/* Max Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Members (Optional)
            </label>
            <input
              type="number"
              value={formData.maxMembers}
              onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              placeholder="Leave empty for unlimited"
              min="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (Optional)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., mental health, support, wellness (comma-separated)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating...
                </span>
              ) : (
                'Create Circle'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
