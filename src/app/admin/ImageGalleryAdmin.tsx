'use client';
import React from 'react';
import { Upload, Trash2, Edit2, Search, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { ERP } from './admin-ui';

interface ImageData {
  _id: string;
  url: string;
  description: string;
  referenceText: string;
  tags: string[];
  category: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface UploadForm {
  description: string;
  referenceText: string;
  category: string;
}

export function ImageGalleryAdmin({ API_URL, headers }: any) {
  const [images, setImages] = React.useState<ImageData[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [uploadForm, setUploadForm] = React.useState<UploadForm>({
    description: '',
    referenceText: '',
    category: 'general',
  });
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState<UploadForm>({
    description: '',
    referenceText: '',
    category: 'general',
  });

  const categories = ['general', 'Regular', 'Thali', 'Breakfast', 'Lunch', 'Dinner'];

  const fetchImages = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search,
        category: category,
      });
      
      const res = await fetch(`${API_URL}/images/admin/gallery/all?${params}`, {
        headers
      });
      
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error('Fetch images error:', err);
      alert('Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [API_URL, headers, page, search, category]);

  React.useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleUpload = async () => {
    if (!uploadFile) {
      alert('Please select an image');
      return;
    }

    if (!uploadForm.description.trim()) {
      alert('Please enter a description');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('description', uploadForm.description);
      formData.append('referenceText', uploadForm.referenceText);
      formData.append('category', uploadForm.category);

      const res = await fetch(`${API_URL}/images/upload-with-metadata`, {
        method: 'POST',
        headers: { Authorization: headers.Authorization },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImages([data.image, ...images]);
        setShowUploadModal(false);
        setUploadForm({ description: '', referenceText: '', category: 'general' });
        setUploadFile(null);
        alert('Image uploaded successfully');
      } else {
        alert(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (imageId: string) => {
    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/${imageId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        setImages(images.map(img => img._id === imageId ? data.image : img));
        setEditingId(null);
        alert('Image updated successfully');
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update image');
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/${imageId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await res.json();
      if (data.success) {
        setImages(images.filter(img => img._id !== imageId));
        alert('Image deleted successfully');
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete image');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected images?`)) return;

    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/bulk-delete`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedIds) }),
      });

      const data = await res.json();
      if (data.success) {
        setImages(images.filter(img => !selectedIds.has(img._id)));
        setSelectedIds(new Set());
        alert(`${data.deleted} images deleted successfully`);
      } else {
        alert(data.error || 'Bulk delete failed');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete images');
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === images.length && images.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map(img => img._id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Upload Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Image Gallery Management</h2>
          <p className="text-sm text-slate-500 mt-1">Upload and manage images with descriptions for kitchen owners</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className={`${ERP.btn} ${ERP.btnPrimary} flex items-center gap-2`}
        >
          <Upload className="w-4 h-4" /> Upload Image
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex-1 min-w-[250px] flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by description, tags, or reference..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        <select
          value={category}
          onChange={e => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {selectedIds.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className={`${ERP.btn} ${ERP.btnDanger} flex items-center gap-2`}
          >
            <Trash2 className="w-4 h-4" /> Delete {selectedIds.size}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500">Total Images</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{images.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500">Selected</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">{selectedIds.size}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500">Category</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{category || 'All'}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-slate-500">Page</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{page} / {totalPages}</p>
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-semibold">No images found</p>
          <p className="text-sm text-slate-400 mt-1">Upload your first image to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map(image => (
            <div key={image._id} className={`bg-white border-2 rounded-lg overflow-hidden transition-all ${
              selectedIds.has(image._id) ? 'border-orange-500 ring-2 ring-orange-200' : 'border-slate-200 hover:border-slate-300'
            }`}>
              {/* Image */}
              <div className="relative aspect-square bg-slate-100 overflow-hidden group cursor-pointer">
                <img 
                  src={image.url} 
                  alt={image.description}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onClick={() => toggleSelect(image._id)}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
                
                {/* Checkbox */}
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(image._id)}
                    onChange={() => toggleSelect(image._id)}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Content */}
              {editingId === image._id ? (
                <div className="p-4 space-y-3 bg-blue-50">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      placeholder="e.g., Butter Chicken with Rice"
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reference Text (for search)</label>
                    <textarea
                      value={editForm.referenceText}
                      onChange={e => setEditForm({ ...editForm, referenceText: e.target.value })}
                      placeholder="e.g., chapati, dal, bhindi sabji"
                      rows={2}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm resize-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Comma-separated items that match this image</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleUpdate(image._id)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-3 py-2 bg-slate-300 text-slate-700 rounded text-sm font-bold flex items-center justify-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900 truncate">{image.description}</p>
                    <p className="text-xs text-slate-500">Upload by: {image.uploadedBy.name}</p>
                  </div>

                  {image.referenceText && (
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs font-semibold text-blue-900 mb-1">🔍 Search Reference:</p>
                      <p className="text-xs text-blue-800 leading-relaxed">{image.referenceText}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="inline-block bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {image.category}
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingId(image._id);
                        setEditForm({
                          description: image.description,
                          referenceText: image.referenceText,
                          category: image.category,
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-sm font-bold flex items-center justify-center gap-1 hover:bg-blue-100"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(image._id)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded text-sm font-bold flex items-center justify-center gap-1 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-4 border-t border-slate-200">
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Upload Image to Gallery</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Select Image</label>
                <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  uploadFile ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-slate-400'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setUploadFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="image-input"
                  />
                  <label htmlFor="image-input" className="cursor-pointer block">
                    {uploadFile ? (
                      <div>
                        <ImageIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-semibold text-green-900">{uploadFile.name}</p>
                        <p className="text-sm text-green-700 mt-1">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-semibold text-slate-900">Drop image here or click to select</p>
                        <p className="text-sm text-slate-500 mt-1">PNG, JPG, WebP (max 50MB)</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Description *</label>
                <input
                  type="text"
                  placeholder="e.g., Butter Chicken with Rice"
                  value={uploadForm.description}
                  onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-slate-500 mt-1">Name of the dish in this image</p>
              </div>

              {/* Reference Text */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Search Reference Text *</label>
                <textarea
                  placeholder="e.g., chapati, dal, bhindi sabji, rice, curry"
                  value={uploadForm.referenceText}
                  onChange={e => setUploadForm({ ...uploadForm, referenceText: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Comma-separated keywords that kitchens will search for. When a kitchen searches "bhindi sabji chapati", 
                  this image will appear because it contains those keywords.
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Category</label>
                <select
                  value={uploadForm.category}
                  onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadForm.description.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 ${
                    uploading || !uploadFile || !uploadForm.description.trim()
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" /> Upload Image
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
