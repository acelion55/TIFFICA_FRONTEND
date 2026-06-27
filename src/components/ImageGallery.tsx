'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Upload, X, Trash2, ChevronDown } from 'lucide-react';

interface Image {
  _id: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  uploadedBy: any;
  createdAt: string;
}

interface ImageGalleryProps {
  onSelectImage: (imageUrl: string) => void;
  kitchenId?: string;
  token: string;
  API_URL: string;
  onClose?: () => void;
  initialSearchQuery?: string;
}

export default function ImageGallery({
  onSelectImage,
  kitchenId,
  token,
  API_URL,
  onClose,
  initialSearchQuery = ''
}: ImageGalleryProps) {
  const [images, setImages] = useState<Image[]>([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    description: '',
    tags: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  // Search images
  useEffect(() => {
    const searchImages = async () => {
      if (!searchQuery.trim() && !category) {
        fetchImages(1);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append('q', searchQuery);
        if (category) params.append('category', category);
        if (kitchenId) params.append('cloudKitchenId', kitchenId);
        params.append('limit', '50');

        const res = await fetch(`${API_URL}/images/search?${params}`, { headers });
        const data = await res.json();

        if (data.success) {
          setImages(data.images);
          setHasMore(data.pagination.pages > 1);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setLoading(false);
    };

    const timer = setTimeout(searchImages, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, category]);

  // Fetch images
  const fetchImages = async (pageNum: number = 1) => {
    setLoading(true);
    try {
      let res;
      if (kitchenId) {
        res = await fetch(`${API_URL}/images/kitchen/${kitchenId}?limit=50`, { headers });
      } else {
        res = await fetch(`${API_URL}/images/search?limit=50&page=${pageNum}`, { headers });
      }

      const data = await res.json();
      if (data.success) {
        setImages(pageNum === 1 ? data.images : [...images, ...data.images]);
        setHasMore(data.pagination?.pages > pageNum);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
    setLoading(false);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Upload image
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', uploadData.description);
      formData.append('tags', uploadData.tags);
      formData.append('category', uploadData.category);
      if (kitchenId) {
        formData.append('cloudKitchenId', kitchenId);
      }

      const res = await fetch(`${API_URL}/images/upload-with-metadata`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setImages([data.image, ...images]);
        setShowUploadForm(false);
        setSelectedFile(null);
        setPreview('');
        setUploadData({ description: '', tags: '', category: 'general' });
        // Auto-select the newly uploaded image in the menu form
        onSelectImage(data.image.url);
        onClose?.();
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    }
    setUploading(false);
  };

  // Delete image
  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return;

    try {
      const res = await fetch(`${API_URL}/images/${imageId}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();
      if (data.success) {
        setImages(images.filter(img => img._id !== imageId));
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[1.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">Image Gallery</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Upload Button */}
        <div className="border-b border-slate-200 p-4 bg-slate-50">
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="w-full py-3 bg-orange-500 text-white rounded-full font-bold uppercase text-sm tracking-wide hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload New Image
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="border-b border-slate-200 p-6 bg-slate-50 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* File Input */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Select Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full border-2 border-dashed border-slate-300 rounded-lg p-3 text-sm cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g., Butter Chicken"
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">General</option>
                  <option value="regular">Regular</option>
                  <option value="thali">Thali</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g., spicy, homemade, vegan"
                value={uploadData.tags}
                onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Preview & Upload */}
            <div className="flex gap-4 items-end">
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover border-2 border-slate-300"
                />
              )}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="px-6 py-3 bg-green-500 text-white rounded-full font-bold uppercase text-xs tracking-wide hover:bg-green-600 disabled:opacity-50 transition"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  setPreview('');
                }}
                className="px-6 py-3 bg-slate-300 text-slate-700 rounded-full font-bold uppercase text-xs tracking-wide hover:bg-slate-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="border-b border-slate-200 p-4 bg-white space-y-3">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search images by description or tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="regular">Regular</option>
              <option value="thali">Thali</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading && images.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-slate-500">Loading images...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-slate-500">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image._id}
                  className="group relative rounded-lg overflow-hidden border-2 border-slate-200 hover:border-orange-500 transition cursor-pointer"
                >
                  <img
                    src={image.url}
                    alt={image.description}
                    className="w-full h-40 object-cover group-hover:scale-110 transition duration-300"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        onSelectImage(image.url);
                        onClose?.();
                      }}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-bold hover:bg-green-600 transition"
                    >
                      Select
                    </button>
                  </div>

                  {/* Info on hover */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-white text-xs opacity-0 group-hover:opacity-100 transition">
                    <p className="font-bold line-clamp-1">{image.description}</p>
                    {image.tags.length > 0 && (
                      <p className="text-slate-300 text-[10px] line-clamp-1">
                        {image.tags.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchImages(page + 1)}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-300 transition"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
