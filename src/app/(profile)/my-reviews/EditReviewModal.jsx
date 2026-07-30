'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import useReviewsStore from '@/store/useReviewsStore';
import RatingStars from '@/components/StarRating';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function EditReviewModal() {
  const {
    editModal,
    selectedReview,
    closeEditModal,
    updateReview,
    actionLoading,
    actionError,
  } = useReviewsStore();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (selectedReview) {
      setRating(selectedReview.rating || 0);
      setTitle(selectedReview.title || '');
      setContent(selectedReview.content || '');
      setImages(
        Array.isArray(selectedReview.images) ? [...selectedReview.images] : []
      );
      setImageError('');
    }
  }, [selectedReview]);

  if (!editModal) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setImageError('');
    if (!file.type.startsWith('image/')) {
      setImageError('Please choose an image file.');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setImageError('Image must be under 2.5 MB.');
      return;
    }
    if (images.length >= 4) {
      setImageError('You can add up to 4 images.');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (typeof dataUrl === 'string' && dataUrl.startsWith('data:image/')) {
        setImages((prev) => [...prev, dataUrl].slice(0, 4));
      }
    } catch {
      setImageError('Could not read that image.');
    }
  };

  const removeImageAt = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImageError('');
  };

  const handleSave = async () => {
    if (!selectedReview?.id || !selectedReview?.product_id) return;
    if (!content.trim()) return;
    await updateReview(selectedReview.id, selectedReview.product_id, {
      rating,
      title: title.trim() || null,
      content: content.trim(),
      images,
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
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-[#CFE3DF] rounded-lg p-2 text-sm mb-4"
          placeholder="Short summary"
        />

        <label className="text-sm text-gray-600 block mb-1">Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border border-[#CFE3DF] rounded-lg p-3 text-sm"
          rows={4}
        />

        <div className="mt-6">
          <label className="text-sm text-gray-600 block mb-2">Photos</label>

          {images.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {images.map((src, index) => (
                <div
                  key={`${index}-${src.slice(0, 24)}`}
                  className="relative w-[60px] h-[60px] rounded-md overflow-hidden border border-[#CFE3DF] shrink-0"
                >
                  <Image
                    src={src}
                    alt=""
                    width={60}
                    height={60}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImageAt(index)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-5 hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="w-[60px] h-[60px] border border-[#CFE3DF] rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <Camera size={20} className="text-[#2C665E]" />
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageUpload}
              disabled={images.length >= 4 || actionLoading}
            />
          </label>

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
