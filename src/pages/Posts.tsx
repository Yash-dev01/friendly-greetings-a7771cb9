import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MessageSquare, Plus, Edit2, Trash2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { motion } from 'framer-motion';

interface PostForm {
  title: string;
  content: string;
  imageUrl?: string;
}

export function Posts() {
  const [posts, setPosts] = useState(storage.getPosts());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<PostForm>({
    title: '',
    content: '',
    imageUrl: '',
  });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (post?: any) => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl,
      });
      setEditingId(post.id);
    } else {
      setFormData({
        title: '',
        content: '',
        imageUrl: '',
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
    if (!formData.title || !formData.content) {
      alert('Please fill in title and content');
      return;
    }

    if (editingId) {
      const updatedPosts = posts.map(post =>
        post.id === editingId
          ? { ...post, ...formData }
          : post
      );
      setPosts(updatedPosts);
      storage.setPosts(updatedPosts);
    } else {
      const newPost = {
        id: Date.now().toString(),
        userId: 'admin',
        title: formData.title,
        content: formData.content,
        imageUrl: formData.imageUrl,
        likesCount: 0,
        createdAt: new Date().toISOString(),
      };
      const updatedPosts = [newPost, ...posts] as any;
      setPosts(updatedPosts);
      storage.setPosts(updatedPosts);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      const updatedPosts = posts.filter(post => post.id !== id);
      setPosts(updatedPosts);
      storage.setPosts(updatedPosts);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
          <p className="text-gray-600 mt-1">Manage community posts</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <Card>
        <div className="relative">
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString()} • {(post as any).comments?.length || 0} comments • {(post as any).likes?.length || post.likesCount || 0} likes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(post)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-48 bg-gray-100">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-gray-700 line-clamp-3">{post.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No posts found</p>
          </div>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingId ? 'Edit Post' : 'Create New Post'}>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your post content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
            <Input
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2 rounded-lg overflow-hidden h-32 bg-gray-100">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {editingId ? 'Update Post' : 'Create Post'}
            </Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}