'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import useReviewsStore from '@/store/useReviewsStore';
import RatingStars from '@/components/StarRating';

export default function EditReviewModal() {
  const {
    editModal,
    selectedReview,
    closeEditModal,
    updateReview,
    actionLoading,
    actionError,
  } = useReviewsStore();

  if (!editModal || !selectedReview) return null;

  return (
    <EditReviewForm
      key={selectedReview.id}
      selectedReview={selectedReview}
      closeEditModal={closeEditModal}
      updateReview={updateReview}
      actionLoading={actionLoading}
      actionError={actionError}
    />
  );
}

function EditReviewForm({
  selectedReview,
  closeEditModal,
  updateReview,
  actionLoading,
  actionError,
}) {
  const [rating, setRating] = useState(selectedReview.rating || 0);
  const [title, setTitle] = useState(selectedReview.title || '');
  const [content, setContent] = useState(selectedReview.content || '');
  const [existingImages, setExistingImages] = useState(
    Array.isArray(selectedReview.image_assets) ? selectedReview.image_assets : [],
  );
  const legacyImages = Array.isArray(selectedReview.legacy_image_urls)
    ? selectedReview.legacy_image_urls
    : [];
  const [newImages, setNewImages] = useState([]);
  const [imageError, setImageError] = useState('');
  const previewUrls = useRef(new Set());

  const clearNewPreviews = () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  };

  useEffect(() => () => clearNewPreviews(), []);

  const imageCount = existingImages.length + legacyImages.length + newImages.length;

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setImageError('');
    if (files.some((file) => !file.type.startsWith('image/'))) {
      setImageError('Please choose image files only.');
      return;
    }
    if (files.some((file) => file.size > 2.5 * 1024 * 1024)) {
      setImageError('Each image must be 2.5 MB or smaller.');
      return;
    }
    if (imageCount + files.length > 4) {
      setImageError('You can add up to 4 images.');
      return;
    }
    const additions = files.map((file) => {
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      return { file, preview };
    });
    setNewImages((current) => [...current, ...additions]);
  };

  const removeExistingImage = (id) => {
    setExistingImages((current) => current.filter((image) => image.id !== id));
    setImageError('');
  };

  const removeNewImage = (preview) => {
    URL.revokeObjectURL(preview);
    previewUrls.current.delete(preview);
    setNewImages((current) => current.filter((image) => image.preview !== preview));
    setImageError('');
  };

  const handleSave = async () => {
    if (!selectedReview?.id || !selectedReview?.product_id || !content.trim()) return;
    await updateReview(selectedReview.id, selectedReview.product_id, {
      rating,
      title: title.trim() || null,
      content: content.trim(),
      retained_image_ids: existingImages.map((image) => image.id),
      image_files: newImages.map((image) => image.file),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div
        className="bg-white rounded-xl w-full p-6 shadow-xl max-w-[650px] max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-labelledby="edit-review-title"
      >
        <h3 id="edit-review-title" className="text-lg font-semibold mb-4">
          Edit review
        </h3>

        {actionError ? (
          <p className="text-sm text-red-600 mb-3" role="alert">
            {actionError}
          </p>
        ) : null}

        <div className="mb-4">
          <p className="text-sm mb-2">Rating</p>
          <RatingStars rating={rating} setRating={setRating} editable />
        </div>

        <label className="text-sm text-gray-600 block mb-1">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border border-[#CFE3DF] rounded-lg p-2 text-sm mb-4"
          placeholder="Short summary"
        />

        <label className="text-sm text-gray-600 block mb-1">Review</label>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="w-full border border-[#CFE3DF] rounded-lg p-3 text-sm"
          rows={4}
        />

        <div className="mt-6">
          <label className="text-sm text-gray-600 block mb-2">
            Photos <span className="text-gray-400">({imageCount}/4)</span>
          </label>

          {imageCount > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingImages.map((image) => (
                <PhotoPreview key={image.id} src={image.url} onRemove={() => removeExistingImage(image.id)} />
              ))}
              {legacyImages.map((src, index) => (
                <PhotoPreview key={`legacy-${index}`} src={src} />
              ))}
              {newImages.map(({ file, preview }) => (
                <PhotoPreview
                  key={preview}
                  src={preview}
                  alt={file.name}
                  onRemove={() => removeNewImage(preview)}
                />
              ))}
            </div>
          ) : null}

          {imageCount < 4 ? (
            <label className="w-[60px] h-[60px] border border-dashed border-[#8CBAB3] rounded-xl flex items-center justify-center cursor-pointer hover:bg-[#F1F8F7]">
              <Camera size={20} className="text-[#2C665E]" />
              <input
                type="file"
                hidden
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                disabled={actionLoading}
              />
            </label>
          ) : null}

          {imageError ? (
            <p className="text-sm text-red-600 mt-2" role="alert">
              {imageError}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={closeEditModal}
            className="text-gray-500 px-3 py-2"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={actionLoading || !content.trim()}
            className="bg-[#2C665E] text-white px-5 py-2 rounded-lg disabled:opacity-50"
          >
            {actionLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoPreview({ src, alt = '', onRemove }) {
  return (
    <div className="relative w-[60px] h-[60px] rounded-md overflow-hidden border border-[#CFE3DF] shrink-0">
      <Image src={src} alt={alt} fill sizes="60px" className="object-cover" unoptimized />
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 flex w-5 h-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label={alt ? `Remove ${alt}` : 'Remove image'}
        >
          <X size={12} />
        </button>
      ) : null}
    </div>
  );
}
