import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Mail, Plus, Edit2, Trash2, Send, Eye } from 'lucide-react';
import { newsletterService, Newsletter } from '../../services/newsletterService';
import { motion } from 'framer-motion';

export function NewsLetterManagement() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [formData, setFormData] = useState({ title: '', content: '', imageUrl: '' });

  const fetchNewsletters = async () => {
    try {
      const data = await newsletterService.getAll();
      setNewsletters(data);
    } catch (err) {
      console.error('Failed to fetch newsletters', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNewsletters(); }, []);

  const filteredNewsletters = newsletters.filter(nl => {
    const matchesSearch = nl.title.toLowerCase().includes(searchQuery.toLowerCase()) || nl.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterPublished === 'all' || (filterPublished === 'published' && nl.isPublished) || (filterPublished === 'draft' && !nl.isPublished);
    return matchesSearch && matchesFilter;
  });

  const handleOpenModal = (newsletter?: Newsletter) => {
    if (newsletter) {
      setFormData({ title: newsletter.title, content: newsletter.content, imageUrl: newsletter.imageUrl || '' });
      setEditingId(newsletter._id);
    } else {
      setFormData({ title: '', content: '', imageUrl: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingId(null); };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) { alert('Please fill in title and content'); return; }
    try {
      if (editingId) {
        await newsletterService.update(editingId, formData);
      } else {
        await newsletterService.create(formData);
      }
      handleCloseModal();
      fetchNewsletters();
    } catch (err: any) {
      alert(err.message || 'Failed to save newsletter');
    }
  };

  const handlePublish = async (id: string) => {
    try { await newsletterService.publish(id); fetchNewsletters(); } catch (err: any) { alert(err.message); }
  };

  const handleUnpublish = async (id: string) => {
    try { await newsletterService.unpublish(id); fetchNewsletters(); } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) return;
    try { await newsletterService.delete(id); fetchNewsletters(); } catch (err: any) { alert(err.message); }
  };

  const previewNewsletter = newsletters.find(nl => nl._id === previewId);

  if (loading) return <div className="text-center py-10 text-gray-500">Loading newsletters...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
          <p className="text-gray-600 mt-1">Create and manage newsletters</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Newsletter
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Search newsletters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <select value={filterPublished} onChange={(e) => setFilterPublished(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredNewsletters.map((newsletter, index) => (
          <motion.div key={newsletter._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{newsletter.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${newsletter.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {newsletter.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{new Date(newsletter.publishedDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setPreviewId(newsletter._id); setIsPreviewOpen(true); }} className="bg-indigo-600 text-white hover:bg-indigo-700"><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={() => handleOpenModal(newsletter)} className="bg-blue-600 text-white hover:bg-blue-700"><Edit2 className="w-4 h-4" /></Button>
                  <Button size="sm" onClick={() => handleDelete(newsletter._id)} className="bg-red-600 text-white hover:bg-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <p className="text-gray-700 line-clamp-2 mb-4">{newsletter.content}</p>
              <div className="pt-4 border-t border-gray-200">
                {newsletter.isPublished ? (
                  <Button size="sm" onClick={() => handleUnpublish(newsletter._id)} className="bg-gray-700 text-white hover:bg-gray-800">Unpublish</Button>
                ) : (
                  <Button size="sm" onClick={() => handlePublish(newsletter._id)} className="bg-green-600 text-white hover:bg-green-700">
                    <Send className="w-3 h-3 mr-1" />Publish
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNewsletters.length === 0 && (
        <Card><div className="text-center py-12"><Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No newsletters found</p></div></Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Newsletter' : 'Create Newsletter'}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Newsletter title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Write your newsletter content here..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={8} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL (Optional)</label>
            <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">{editingId ? 'Update Newsletter' : 'Create Newsletter'}</Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Newsletter Preview">
        {previewNewsletter && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{previewNewsletter.title}</h2>
            <p className="text-sm text-gray-500">{new Date(previewNewsletter.publishedDate).toLocaleDateString()}</p>
            {previewNewsletter.imageUrl && (
              <div className="rounded-lg overflow-hidden h-40 bg-gray-100">
                <img src={previewNewsletter.imageUrl} alt={previewNewsletter.title} className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{previewNewsletter.content}</p>
            <Button onClick={() => setIsPreviewOpen(false)} variant="outline" className="w-full">Close Preview</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
