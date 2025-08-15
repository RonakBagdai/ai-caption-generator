import { useRef, useState } from 'react';

export default function ImageUpload({ onFileSelect }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleChange(e) {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    }
  }

  return (
    <div className="space-y-4">
      {preview && <img src={preview} alt="preview" className="max-h-64 rounded shadow" />}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="block w-full text-sm text-gray-700"
        />
      </div>
    </div>
  );
}
