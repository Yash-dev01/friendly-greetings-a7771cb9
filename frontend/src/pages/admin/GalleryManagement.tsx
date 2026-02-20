import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Image as ImageIcon, Plus, Edit2, Trash2, Folder } from 'lucide-react';
import { storage } from '../../lib/storage';
import { motion } from 'framer-motion';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  album?: string;
  uploadedBy: string;
  createdAt: Date;
}

export function GalleryManagement() {
  const [items, setItems] = useState<GalleryItem[]>(
    JSON.parse(localStorage.getItem('galleryItems') || '[]')
  );
  const [albums, setAlbums] = useState<string[]>(
    JSON.parse(localStorage.getItem('galleryAlbums') || '["General"]')
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('General');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    mediaUrl: '',
    mediaType: 'photo' as 'photo' | 'video',
  });

  const filteredItems = items.filter(item => item.album === selectedAlbum);

  const saveGallery = (updatedItems: GalleryItem[]) => {
    localStorage.setItem('galleryItems', JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const saveAlbums = (updatedAlbums: string[]) => {
    localStorage.setItem('galleryAlbums', JSON.stringify(updatedAlbums));
    setAlbums(updatedAlbums);
  };

  const handleOpenModal = (item?: GalleryItem) => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
      });
      setEditingId(item.id);
    } else {
      setFormData({
        title: '',
        description: '',
        mediaUrl: '',
        mediaType: 'photo',
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.mediaUrl) {
      alert('Please fill in title and media URL');
      return;
    }

    if (editingId) {
      const updatedItems = items.map(item =>
        item.id === editingId
          ? { ...item, ...formData }
          : item
      );
      saveGallery(updatedItems);
    } else {
      const newItem: GalleryItem = {
        id: Date.now().toString(),
        ...formData,
        album: selectedAlbum,
        uploadedBy: 'admin',
        createdAt: new Date(),
      };
      saveGallery([newItem, ...items]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== id);
      saveGallery(updatedItems);
    }
  };

  const handleCreateAlbum = () => {
    if (!newAlbumName.trim()) {
      alert('Please enter an album name');
      return;
    }

    if (albums.includes(newAlbumName)) {
      alert('Album already exists');
      return;
    }

    const updatedAlbums = [...albums, newAlbumName];
    saveAlbums(updatedAlbums);
    setNewAlbumName('');
    setIsAlbumModalOpen(false);
  };

  const handleDeleteAlbum = (album: string) => {
    if (album === 'General') {
      alert('Cannot delete General album');
      return;
    }

    if (window.confirm('Are you sure? All items in this album will be moved to General.')) {
      const updatedItems = items.map(item =>
        item.album === album ? { ...item, album: 'General' } : item
      );
      saveGallery(updatedItems);

      const updatedAlbums = albums.filter(a => a !== album);
      saveAlbums(updatedAlbums);
      setSelectedAlbum('General');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
          <p className="text-gray-600 mt-1">Manage photos and videos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAlbumModalOpen(true)}>
            <Folder className="w-4 h-4 mr-2" />
            New Album
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {albums.map(album => (
          <div key={album}>
            <Button
              onClick={() => setSelectedAlbum(album)}
              className={selectedAlbum === album ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            >
              {album} ({items.filter(i => i.album === album).length})
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover className="overflow-hidden h-full flex flex-col">
              <div className="relative bg-gray-100 h-40 overflow-hidden">
                {item.mediaType === 'photo' ? (
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                ) : (
                  <video
                    src={item.mediaUrl}
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-200 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(item)}
                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No items in this album</p>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Gallery Item' : 'Add Gallery Item'}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Item title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select
              value={formData.mediaType}
              onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'photo' | 'video' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
            <Input
              value={formData.mediaUrl}
              onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
              placeholder="https://example.com/media.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Item description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {formData.mediaUrl && (
            <div className="rounded-lg overflow-hidden h-32 bg-gray-100">
              {formData.mediaType === 'photo' ? (
                <img
                  src={formData.mediaUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              ) : (
                <video
                  src={formData.mediaUrl}
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {editingId ? 'Update Item' : 'Add Item'}
            </Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isAlbumModalOpen} onClose={() => setIsAlbumModalOpen(false)} title="Create New Album">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Album Name</label>
            <Input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="e.g., 2024 Reunion"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleCreateAlbum} className="flex-1">
              Create Album
            </Button>
            <Button onClick={() => setIsAlbumModalOpen(false)} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}