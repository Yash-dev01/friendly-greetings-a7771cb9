import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Image as ImageIcon, Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { galleryService, GalleryItem } from '../../services/galleryService';
import { authService } from '../../services/authService';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'photo' as 'photo' | 'video',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      const data = await galleryService.getItems();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch gallery items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setFormData({ title: item.title, description: item.description || '', mediaUrl: item.mediaUrl, mediaType: item.mediaType });
      setEditingId(item._id);
    } else {
      setFormData({ title: '', description: '', mediaUrl: '', mediaType: 'photo' });
      setEditingId(null);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const isVideo = file.type.startsWith('video/');
    setFormData((prev) => ({ ...prev, mediaType: isVideo ? 'video' : 'photo' }));

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleSubmit = async () => {
    if (!formData.title) { alert('Title is required'); return; }
    if (!selectedFile && !formData.mediaUrl && !editingId) { alert('Please upload a file or provide a URL'); return; }

    setUploading(true);
    try {
      if (editingId) {
        await galleryService.updateItem(editingId, formData);
      } else if (selectedFile) {
        // Upload via FormData
        const fd = new FormData();
        fd.append('media', selectedFile);
        fd.append('title', formData.title);
        fd.append('description', formData.description);
        fd.append('mediaType', formData.mediaType);

        const token = authService.getToken();
        const res = await fetch(`${API_BASE}/api/gallery`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Upload failed');
        }
      } else {
        await galleryService.createItem(formData);
      }
      handleCloseModal();
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to save gallery item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await galleryService.deleteItem(id);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    }
  };

  const getMediaSrc = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-1">Manage photos and videos</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div key={item._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
            <Card className="overflow-hidden h-full flex flex-col">
              <div className="relative bg-gray-100 h-40 overflow-hidden">
                {item.mediaType === 'photo' ? (
                  <img src={getMediaSrc(item.mediaUrl)} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <video src={getMediaSrc(item.mediaUrl)} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                {item.description && <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>}
                <div className="mt-auto pt-3 border-t border-gray-200 flex gap-2">
                  <Button size="sm" onClick={() => handleOpenModal(item)} className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100">
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(item._id)} className="flex-1 bg-red-50 text-red-600 hover:bg-red-100">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No gallery items yet</p>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}>
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Item title" />
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                />
                {previewUrl ? (
                  <div className="relative">
                    {formData.mediaType === 'photo' ? (
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    ) : (
                      <video src={previewUrl} className="max-h-40 mx-auto rounded-lg" controls />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-gray-600 mt-2">{selectedFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drag & drop files here or <span className="text-blue-600 font-medium">Browse</span></p>
                    <p className="text-xs text-gray-400 mt-1">Supports images and videos up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          )}

          {!editingId && !selectedFile && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Or paste a URL</label>
              <Input value={formData.mediaUrl} onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="https://example.com/media.jpg" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select value={formData.mediaType} onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'photo' | 'video' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Item description..." className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none" rows={3} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1" disabled={uploading}>
              {uploading ? 'Uploading...' : editingId ? 'Update Item' : 'Add Item'}
            </Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
