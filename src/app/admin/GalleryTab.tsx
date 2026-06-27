'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Search, Trash2, Edit2, Save, X, ChevronLeft, ChevronRight, Loader2, Image as ImageIcon, Tag, Grid, List } from 'lucide-react';

interface GalleryImage {
  _id: string;
  url: string;
  description: string;
  referenceText: string;
  tags: string[];
  category: string;
  uploadedBy: {
    name: string;
    email: string;
  };
  width: number;
  height: number;
  size: number;
  createdAt: string;
}

interface GalleryTabProps {
  headers: any;
  API_URL: string;
}

const CATEGORIES = ['general', 'regular', 'thali', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert'];

export function GalleryTab({ headers, API_URL }: GalleryTabProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GalleryImage>>({});
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    description: '',
    referenceText: '',
    tags: '',
    category: 'general'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch gallery images
  const fetchGallery = async (pageNum = 1) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        search: search || '',
        category: categoryFilter || ''
      });

      const res = await fetch(
        `${API_URL}/images/admin/gallery/all?${query}`,
        { headers }
      );
      const data = await res.json();

      if (data.success) {
        setImages(data.images);
        setTotalPages(data.pagination.pages);
        setTotalImages(data.pagination.total);
        setPage(pageNum);
      }
    } catch (err) {
      console.error('Failed to fetch gallery:', err);
      alert('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGallery(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter]);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Upload image
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image');
      return;
    }

    if (!uploadData.referenceText.trim()) {
      alert('Please add reference text for the image');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('description', uploadData.description);
      formData.append('referenceText', uploadData.referenceText);
      formData.append('tags', uploadData.tags);
      formData.append('category', uploadData.category);

      const res = await fetch(`${API_URL}/images/upload-with-metadata`, {
        method: 'POST',
        headers: { Authorization: headers.Authorization },
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        alert('Image uploaded successfully');
        setShowUploadForm(false);
        setSelectedFile(null);
        setPreview('');
        setUploadData({ description: '', referenceText: '', tags: '', category: 'general' });
        fetchGallery(1);
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

  // Update image metadata
  const handleUpdate = async (imageId: string) => {
    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/${imageId}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editData.description,
          referenceText: editData.referenceText,
          tags: editData.tags,
          category: editData.category
        })
      });

      const data = await res.json();

      if (data.success) {
        alert('Image updated successfully');
        setEditingId(null);
        fetchGallery(page);
      } else {
        alert(data.error || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update image');
    }
  };

  // Delete single image
  const handleDelete = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/${imageId}`, {
        method: 'DELETE',
        headers
      });

      const data = await res.json();

      if (data.success) {
        alert('Image deleted successfully');
        fetchGallery(page);
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete image');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) {
      alert('Please select images to delete');
      return;
    }

    if (!confirm(`Delete ${selectedIds.size} selected images?`)) return;

    try {
      const res = await fetch(`${API_URL}/images/admin/gallery/bulk-delete`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedIds) })
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        setSelectedIds(new Set());
        fetchGallery(1);
      } else {
        alert(data.error || 'Bulk delete failed');
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete images');
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === images.length && images.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map(img => img._id)));
    }
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image._id);
    setEditData({
      description: image.description,
      referenceText: image.referenceText,
      tags: image.tags,
      category: image.category
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Image Gallery
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage menu images with reference text for easy search
            </p>
          </div>
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-4">Upload New Image</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Image File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {preview && (
                  <img src={preview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reference Text * (used for kitchen search)
                  </label>
                  <textarea
                    placeholder="e.g., chapati, dal, bhindi sabji, rice, butter"
                    value={uploadData.referenceText}
                    onChange={(e) => setUploadData({ ...uploadData, referenceText: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Comma-separated items shown in this image. When a kitchen searches "bhindi sabji chapati", this image will appear if it contains these items.
                  </p>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Additional details about the image"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., spicy, vegetarian, popular"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by reference text, description, or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selection Info */}
        {selectedIds.size > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-orange-700">
              {selectedIds.size} image(s) selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          Total: <span className="font-semibold">{totalImages}</span> images
        </div>
      </div>

      {/* Gallery Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No images found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {images.map(img => (
            <div
              key={img._id}
              className={`border rounded-lg overflow-hidden transition ${
                selectedIds.has(img._id) ? 'ring-2 ring-blue-500' : 'border-slate-200'
              }`}
            >
              <div className="relative bg-slate-100 aspect-video overflow-hidden group">
                <img src={img.url} alt={img.referenceText} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={() => toggleSelect(img._id)}
                    className="p-2 bg-white rounded-full hover:bg-blue-100 transition"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(img._id)}
                      onChange={() => toggleSelect(img._id)}
                      className="w-4 h-4"
                    />
                  </button>
                </div>
              </div>

              {editingId === img._id ? (
                <div className="p-3 space-y-2">
                  <textarea
                    value={editData.referenceText || ''}
                    onChange={(e) => setEditData({ ...editData, referenceText: e.target.value })}
                    placeholder="e.g., chapati, dal, bhindi sabji"
                    rows={2}
                    className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <input
                    type="text"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Description"
                    className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <select
                    value={editData.category || ''}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="w-full text-xs px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleUpdate(img._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      <Save className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <p className="font-semibold text-slate-900 text-sm truncate">
                    {img.referenceText || 'No reference text'}
                  </p>
                  <p className="text-xs text-slate-600 truncate">{img.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                      {img.category}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-1">
                    <button
                      onClick={() => startEdit(img)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        // List view
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              checked={selectedIds.size === images.length && images.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4"
            />
            <span className="font-semibold text-slate-900 flex-1">Reference Text</span>
            <span className="font-semibold text-slate-900 w-32">Category</span>
            <span className="font-semibold text-slate-900 w-32">Actions</span>
          </div>

          {images.map(img => (
            <div
              key={img._id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition ${
                selectedIds.has(img._id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.has(img._id)}
                onChange={() => toggleSelect(img._id)}
                className="w-4 h-4"
              />
              <img src={img.url} alt={img.referenceText} className="w-12 h-12 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">
                  {img.referenceText || 'No reference text'}
                </p>
                <p className="text-xs text-slate-600 truncate">{img.description}</p>
              </div>
              <span className="w-32 text-sm text-slate-600">{img.category}</span>
              <div className="w-32 flex gap-1">
                <button
                  onClick={() => startEdit(img)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(img._id)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => fetchGallery(page - 1)}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => fetchGallery(page + 1)}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
