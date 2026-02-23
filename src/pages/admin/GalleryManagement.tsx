import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Image as ImageIcon, Plus, Edit2, Trash2 } from 'lucide-react';
import { galleryService, GalleryItem } from '../../services/galleryService';
import { motion } from 'framer-motion';

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.mediaUrl) { alert('Please fill in title and media URL'); return; }
    try {
      if (editingId) {
        await galleryService.updateItem(editingId, formData);
      } else {
        await galleryService.createItem(formData);
      }
      handleCloseModal();
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'Failed to save gallery item');
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
                  <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" onError={() => {}} />
                ) : (
                  <video src={item.mediaUrl} className="w-full h-full object-cover" />
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
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Item title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media Type</label>
            <select value={formData.mediaType} onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'photo' | 'video' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="photo">Photo</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Media URL</label>
            <Input value={formData.mediaUrl} onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })} placeholder="https://example.com/media.jpg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Item description..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">{editingId ? 'Update Item' : 'Add Item'}</Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
