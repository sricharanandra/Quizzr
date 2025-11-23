import { useState, useRef } from "react";
import axios from "axios";
import { API_ENDPOINTS, UPLOAD_URL } from "../config/api";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

function ImageUpload({
  onImageUpload,
  currentImage,
  className = "",
  placeholder = "Upload Image",
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Helper function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    if (imageUrl.startsWith("/uploads/")) {
      return `${UPLOAD_URL}${imageUrl}`;
    }
    return `${UPLOAD_URL}/${imageUrl}`;
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    setImageError(false);
    setImageLoading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // Fixed: Use fetch instead of axios and correct endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'https://forms.sreus.tech/api';
      const response = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      onImageUpload(data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
      setImageError(true);
    } finally {
      setUploading(false);
      setImageLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const removeImage = async () => {
    if (currentImage) {
      try {
        let filename;
        if (currentImage.includes("/uploads/")) {
          filename = currentImage.split("/uploads/")[1];
        } else if (
          currentImage.includes(
            UPLOAD_URL.replace("http://", "").replace("https://", "")
          )
        ) {
          filename = currentImage.split("/").pop();
        } else {
          filename = currentImage;
        }
        await axios.delete(`${API_ENDPOINTS.IMAGES}/${filename}`);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    setImageError(false);
    setImageLoading(false);
    onImageUpload("");
  };

  const displayUrl = getImageUrl(currentImage);

  return (
    <div className={`relative ${className}`}>
      {currentImage && !imageError ? (
        <div className="relative group">
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={displayUrl}
            alt="Uploaded"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 bg-white"
            style={{
              minHeight: "192px",
              maxHeight: "192px",
              display: "block",
            }}
            onLoadStart={() => {
              setImageLoading(true);
            }}
            onLoad={() => {
              setImageError(false);
              setImageLoading(false);
            }}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
            <button
              onClick={removeImage}
              className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
              title="Remove Image"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : currentImage && imageError ? (
        // Error state - show retry option
        <div className="w-full h-48 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center">
          <div className="text-red-600 text-center mb-4">
            <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Image failed to load</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setImageError(false);
                setImageLoading(true);
                // Force image reload
                const img = new Image();
                img.onload = () => {
                  setImageError(false);
                  setImageLoading(false);
                };
                img.onerror = () => {
                  setImageError(true);
                  setImageLoading(false);
                };
                img.src = displayUrl;
              }}
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition"
            >
              Retry
            </button>
            <button
              onClick={removeImage}
              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all ${
            dragActive ? "border-purple-400 bg-purple-50" : ""
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <>
              <PhotoIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2 font-medium">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 text-center px-4">
                Click to browse or drag and drop
                <br />
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleFileUpload(e.target.files[0])
            }
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
