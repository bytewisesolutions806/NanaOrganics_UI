'use client';

import { DEFAULT_IMAGE } from '@/lib/defaultImage';

export default function ProfileAvatarUpload({ image, editMode, uploading, onFileSelected }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-[70px] h-[70px] rounded-full overflow-hidden border border-[#CFE3DF] bg-white">
        {/* The asset URL may point directly at an environment-specific S3/CDN host. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || DEFAULT_IMAGE}
          alt="Profile photo"
          className="h-full w-full object-cover"
        />
      </div>

      <label
        className={`text-sm font-medium ${
          editMode && !uploading
            ? 'text-[#2C665E] cursor-pointer'
            : 'text-gray-400 cursor-not-allowed'
        }`}
      >
        {uploading ? 'Uploading photo…' : 'Upload Photo'}
        <input
          type="file"
          className="hidden"
          disabled={!editMode || uploading}
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelected(file);
            event.target.value = '';
          }}
        />
      </label>
    </div>
  );
}
