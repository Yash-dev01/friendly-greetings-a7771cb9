import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Mail, Plus, Edit2, Trash2, Send, Eye } from 'lucide-react';
import { storage } from '../../lib/storage';
import { motion } from 'framer-motion';

interface Newsletter {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  publishedDate: Date;
  isPublished: boolean;
  createdBy: string;
}

export function NewsLetterManagement() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(
    JSON.parse(localStorage.getItem('newsletters') || '[]')
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
  });

  const filteredNewsletters = newsletters.filter(nl => {
    const matchesSearch =
      nl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nl.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterPublished === 'all' ||
      (filterPublished === 'published' && nl.isPublished) ||
      (filterPublished === 'draft' && !nl.isPublished);
    return matchesSearch && matchesFilter;
  });

  const saveNewsletters = (updated: Newsletter[]) => {
    localStorage.setItem('newsletters', JSON.stringify(updated));
    setNewsletters(updated);
  };

  const handleOpenModal = (newsletter?: Newsletter) => {
    if (newsletter) {
      setFormData({
        title: newsletter.title,
        content: newsletter.content,
        imageUrl: newsletter.imageUrl || '',
      });
      setEditingId(newsletter.id);
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
      const updated = newsletters.map(nl =>
        nl.id === editingId ? { ...nl, ...formData } : nl
      );
      saveNewsletters(updated);
    } else {
      const newNewsletter: Newsletter = {
        id: Date.now().toString(),
        ...formData,
        publishedDate: new Date(),
        isPublished: false,
        createdBy: 'admin',
      };
      saveNewsletters([newNewsletter, ...newsletters]);
    }

    handleCloseModal();
  };

  const handlePublish = (id: string) => {
    const updated = newsletters.map(nl =>
      nl.id === id ? { ...nl, isPublished: true, publishedDate: new Date() } : nl
    );
    saveNewsletters(updated);
  };

  const handleUnpublish = (id: string) => {
    const updated = newsletters.map(nl =>
      nl.id === id ? { ...nl, isPublished: false } : nl
    );
    saveNewsletters(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this newsletter?')) {
      const updated = newsletters.filter(nl => nl.id !== id);
      saveNewsletters(updated);
    }
  };

  const handlePreview = (id: string) => {
    setPreviewId(id);
    setIsPreviewOpen(true);
  };

  const previewNewsletter = newsletters.find(nl => nl.id === previewId);

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
          <Input
            placeholder="Search newsletters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </Card>

      <div className="grid gap-4">
        {filteredNewsletters.map((newsletter, index) => (
          <motion.div
            key={newsletter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">{newsletter.title}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        newsletter.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {newsletter.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(newsletter.publishedDate).toLocaleDateString()} •{' '}
                    {newsletter.content.split(' ').length} words
                  </p>
                </div>

                {/* DARK BUTTONS */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handlePreview(newsletter.id)}
                    className="bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenModal(newsletter)}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(newsletter.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {newsletter.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden h-40 bg-gray-100">
                  <img
                    src={newsletter.imageUrl}
                    alt={newsletter.title}
                    className="w-full h-full object-cover"
                    onError={() => {}}
                  />
                </div>
              )}

              <p className="text-gray-700 line-clamp-2 mb-4">{newsletter.content}</p>

              <div className="pt-4 border-t border-gray-200">
                {newsletter.isPublished ? (
                  <Button
                    size="sm"
                    onClick={() => handleUnpublish(newsletter.id)}
                    className="bg-gray-700 text-white hover:bg-gray-800"
                  >
                    Unpublish
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handlePublish(newsletter.id)}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Publish
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredNewsletters.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No newsletters found</p>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Edit Newsletter' : 'Create Newsletter'}
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Newsletter title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your newsletter content here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Image URL (Optional)
            </label>
            <Input
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {formData.imageUrl && (
            <div className="rounded-lg overflow-hidden h-32 bg-gray-100">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => {}}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {editingId ? 'Update Newsletter' : 'Create Newsletter'}
            </Button>
            <Button onClick={handleCloseModal} variant="outline" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Newsletter Preview"
      >
        {previewNewsletter && (
          <div className="max-h-96 overflow-y-auto space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {previewNewsletter.title}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date(previewNewsletter.publishedDate).toLocaleDateString()}
              </p>
            </div>

            {previewNewsletter.imageUrl && (
              <div className="rounded-lg overflow-hidden h-40 bg-gray-100">
                <img
                  src={previewNewsletter.imageUrl}
                  alt={previewNewsletter.title}
                  className="w-full h-full object-cover"
                  onError={() => {}}
                />
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {previewNewsletter.content}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={() => setIsPreviewOpen(false)}
                variant="outline"
                className="w-full"
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}



// import { useState } from 'react';
// import { Card } from '../../components/ui/Card';
// import { Input } from '../../components/ui/Input';
// import { Button } from '../../components/ui/Button';
// import { Modal } from '../../components/ui/Modal';
// import { Mail, Plus, Edit2, Trash2, Send, Eye } from 'lucide-react';
// import { storage } from '../../lib/storage';
// import { motion } from 'framer-motion';

// interface Newsletter {
//   id: string;
//   title: string;
//   content: string;
//   imageUrl?: string;
//   publishedDate: Date;
//   isPublished: boolean;
//   createdBy: string;
// }

// export function NewsLetterManagement() {
//   const [newsletters, setNewsletters] = useState<Newsletter[]>(
//     JSON.parse(localStorage.getItem('newsletters') || '[]')
//   );
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isPreviewOpen, setIsPreviewOpen] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [previewId, setPreviewId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
//   const [formData, setFormData] = useState({
//     title: '',
//     content: '',
//     imageUrl: '',
//   });

//   const filteredNewsletters = newsletters.filter(nl => {
//     const matchesSearch =
//       nl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       nl.content.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesFilter =
//       filterPublished === 'all' ||
//       (filterPublished === 'published' && nl.isPublished) ||
//       (filterPublished === 'draft' && !nl.isPublished);
//     return matchesSearch && matchesFilter;
//   });

//   const saveNewsletters = (updated: Newsletter[]) => {
//     localStorage.setItem('newsletters', JSON.stringify(updated));
//     setNewsletters(updated);
//   };

//   const handleOpenModal = (newsletter?: Newsletter) => {
//     if (newsletter) {
//       setFormData({
//         title: newsletter.title,
//         content: newsletter.content,
//         imageUrl: newsletter.imageUrl || '',
//       });
//       setEditingId(newsletter.id);
//     } else {
//       setFormData({
//         title: '',
//         content: '',
//         imageUrl: '',
//       });
//       setEditingId(null);
//     }
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setEditingId(null);
//   };

//   const handleSubmit = () => {
//     if (!formData.title || !formData.content) {
//       alert('Please fill in title and content');
//       return;
//     }

//     if (editingId) {
//       const updated = newsletters.map(nl =>
//         nl.id === editingId ? { ...nl, ...formData } : nl
//       );
//       saveNewsletters(updated);
//     } else {
//       const newNewsletter: Newsletter = {
//         id: Date.now().toString(),
//         ...formData,
//         publishedDate: new Date(),
//         isPublished: false,
//         createdBy: 'admin',
//       };
//       saveNewsletters([newNewsletter, ...newsletters]);
//     }

//     handleCloseModal();
//   };

//   const handlePublish = (id: string) => {
//     const updated = newsletters.map(nl =>
//       nl.id === id ? { ...nl, isPublished: true, publishedDate: new Date() } : nl
//     );
//     saveNewsletters(updated);
//   };

//   const handleUnpublish = (id: string) => {
//     const updated = newsletters.map(nl =>
//       nl.id === id ? { ...nl, isPublished: false } : nl
//     );
//     saveNewsletters(updated);
//   };

//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this newsletter?')) {
//       const updated = newsletters.filter(nl => nl.id !== id);
//       saveNewsletters(updated);
//     }
//   };

//   const handlePreview = (id: string) => {
//     setPreviewId(id);
//     setIsPreviewOpen(true);
//   };

//   const previewNewsletter = newsletters.find(nl => nl.id === previewId);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
//           <p className="text-gray-600 mt-1">Create and manage newsletters</p>
//         </div>
//         <Button onClick={() => handleOpenModal()}>
//           <Plus className="w-4 h-4 mr-2" />
//           New Newsletter
//         </Button>
//       </div>

//       <Card>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <Input
//             placeholder="Search newsletters..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//           <select
//             value={filterPublished}
//             onChange={(e) => setFilterPublished(e.target.value as any)}
//             className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="all">All</option>
//             <option value="published">Published</option>
//             <option value="draft">Draft</option>
//           </select>
//         </div>
//       </Card>

//       <div className="grid gap-4">
//         {filteredNewsletters.map((newsletter, index) => (
//           <motion.div
//             key={newsletter.id}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.05 }}
//           >
//             <Card hover>
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <h3 className="text-xl font-bold text-gray-900">{newsletter.title}</h3>
//                     <span
//                       className={`px-3 py-1 text-xs font-semibold rounded-full ${
//                         newsletter.isPublished
//                           ? 'bg-green-100 text-green-700'
//                           : 'bg-yellow-100 text-yellow-700'
//                       }`}
//                     >
//                       {newsletter.isPublished ? 'Published' : 'Draft'}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-500 mt-1">
//                     {new Date(newsletter.publishedDate).toLocaleDateString()} •{' '}
//                     {newsletter.content.split(' ').length} words
//                   </p>
//                 </div>
//                 <div className="flex gap-2">
//                   <Button
//                     size="sm"
//                     onClick={() => handlePreview(newsletter.id)}
//                     className="bg-indigo-200 text-indigo-700 hover:bg-indigo-300"
//                   >
//                     <Eye className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={() => handleOpenModal(newsletter)}
//                     className="bg-blue-200 text-blue-700 hover:bg-blue-300"
//                   >
//                     <Edit2 className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     size="sm"
//                     onClick={() => handleDelete(newsletter.id)}
//                     className="bg-red-200 text-red-700 hover:bg-red-300"
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>

//               {newsletter.imageUrl && (
//                 <div className="mb-4 rounded-lg overflow-hidden h-40 bg-gray-100">
//                   <img
//                     src={newsletter.imageUrl}
//                     alt={newsletter.title}
//                     className="w-full h-full object-cover"
//                     onError={() => {}}
//                   />
//                 </div>
//               )}

//               <p className="text-gray-700 line-clamp-2 mb-4">{newsletter.content}</p>

//               <div className="pt-4 border-t border-gray-200">
//                 {newsletter.isPublished ? (
//                   <Button
//                     size="sm"
//                     onClick={() => handleUnpublish(newsletter.id)}
//                     className="bg-gray-300 text-gray-800 hover:bg-gray-400"
//                   >
//                     Unpublish
//                   </Button>
//                 ) : (
//                   <Button
//                     size="sm"
//                     onClick={() => handlePublish(newsletter.id)}
//                     className="bg-green-300 text-green-800 hover:bg-green-400"
//                   >
//                     <Send className="w-3 h-3 mr-1" />
//                     Publish
//                   </Button>
//                 )}
//               </div>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {filteredNewsletters.length === 0 && (
//         <Card>
//           <div className="text-center py-12">
//             <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-500">No newsletters found</p>
//           </div>
//         </Card>
//       )}

//       <Modal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         title={editingId ? 'Edit Newsletter' : 'Create Newsletter'}
//       >
//         <div className="space-y-4 max-h-96 overflow-y-auto">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
//             <Input
//               value={formData.title}
//               onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//               placeholder="Newsletter title"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
//             <textarea
//               value={formData.content}
//               onChange={(e) => setFormData({ ...formData, content: e.target.value })}
//               placeholder="Write your newsletter content here..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
//               rows={8}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Featured Image URL (Optional)
//             </label>
//             <Input
//               value={formData.imageUrl || ''}
//               onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
//               placeholder="https://example.com/image.jpg"
//             />
//           </div>

//           {formData.imageUrl && (
//             <div className="rounded-lg overflow-hidden h-32 bg-gray-100">
//               <img
//                 src={formData.imageUrl}
//                 alt="Preview"
//                 className="w-full h-full object-cover"
//                 onError={() => {}}
//               />
//             </div>
//           )}

//           <div className="flex gap-3 pt-4">
//             <Button onClick={handleSubmit} className="flex-1">
//               {editingId ? 'Update Newsletter' : 'Create Newsletter'}
//             </Button>
//             <Button onClick={handleCloseModal} variant="outline" className="flex-1">
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         isOpen={isPreviewOpen}
//         onClose={() => setIsPreviewOpen(false)}
//         title="Newsletter Preview"
//       >
//         {previewNewsletter && (
//           <div className="max-h-96 overflow-y-auto space-y-4">
//             <div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                 {previewNewsletter.title}
//               </h2>
//               <p className="text-sm text-gray-500">
//                 {new Date(previewNewsletter.publishedDate).toLocaleDateString()}
//               </p>
//             </div>

//             {previewNewsletter.imageUrl && (
//               <div className="rounded-lg overflow-hidden h-40 bg-gray-100">
//                 <img
//                   src={previewNewsletter.imageUrl}
//                   alt={previewNewsletter.title}
//                   className="w-full h-full object-cover"
//                   onError={() => {}}
//                 />
//               </div>
//             )}

//             <div className="prose prose-sm max-w-none">
//               <p className="text-gray-700 whitespace-pre-wrap">
//                 {previewNewsletter.content}
//               </p>
//             </div>

//             <div className="pt-4 border-t border-gray-200">
//               <Button
//                 onClick={() => setIsPreviewOpen(false)}
//                 variant="outline"
//                 className="w-full"
//               >
//                 Close Preview
//               </Button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }