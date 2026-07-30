'use client';

import Image from 'next/image';

export default function ProfileAvatarUpload({ image, setImage, editMode }) {
  const handleUpload = (e) => {
    if (!editMode) return;

    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImage(preview);
  };

  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-[70px] h-[70px] rounded-full overflow-hidden border">
        <Image src={image} alt="avatar" width={70} height={70} />
      </div>

      <label
        className={`text-sm font-medium ${
          editMode ? 'text-[#2C665E] cursor-pointer' : 'text-gray-400'
        }`}
      >
        Upload Photo
        <input
          type="file"
          className="hidden"
          disabled={!editMode}
          accept="image/*"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
