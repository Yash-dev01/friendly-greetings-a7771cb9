import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Plus, Edit2, Trash2, Upload, X } from 'lucide-react';
import { postService, Post } from '../services/postService';
import { motion } from 'framer-motion';

interface PostForm {
  title: string;
  content: string;
}

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<PostForm>({
    title: '',
    content: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ||
    'http://localhost:5000';

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
  };

  const fetchPosts = async () => {
    try {
      const data = await postService.getAll();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (post?: Post) => {
    if (post) {
      setFormData({ title: post.title, content: post.content });
      setPreview(post.imageUrl ? getImageUrl(post.imageUrl) : null);
      setEditingId(post._id);
    } else {
      setFormData({ title: '', content: '' });
      setPreview(null);
      setEditingId(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setPreview(null);
    setImageFile(null);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert('Please fill title and content');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      if (imageFile) formDataToSend.append('image', imageFile);

      if (editingId) {
        await postService.update(editingId, formDataToSend);
      } else {
        await postService.create(formDataToSend);
      }

      handleCloseModal();
      fetchPosts();
    } catch (err: any) {
      alert(err.message || 'Failed to save post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this post?')) return;
    await postService.delete(id);
    fetchPosts();
  };

  const handleFileSelect = (file: File) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  if (loading)
    return <div className="text-center py-10 text-gray-500">Loading posts...</div>;

  return (
    <div className="space-y-6">

      {/* HEADER */}
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
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>

      {/* POSTS GRID */}
      <div className="grid gap-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <div className="flex justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleOpenModal(post)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(post._id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {post.imageUrl && (
                <img
                  src={getImageUrl(post.imageUrl)}
                  className="rounded-lg mb-4 max-h-60 object-cover w-full"
                />
              )}

              <p className="text-gray-700">{post.content}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Post' : 'Create Post'}
      >
        <div className="space-y-4">

          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <textarea
            value={formData.content}
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
            placeholder="Write content..."
            className="w-full border px-3 py-2 rounded-lg"
            rows={5}
          />

          {/* IMAGE UPLOAD */}
          {preview ? (
            <div className="relative">
              <img src={preview} className="rounded-lg max-h-60" />
              <button
                className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full"
                onClick={() => {
                  setPreview(null);
                  setImageFile(null);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          <Button onClick={handleSubmit}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}