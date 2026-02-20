import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Image as ImageIcon, Video, X } from 'lucide-react';
import { storage } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

export function Gallery() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const galleryItems = storage.getGalleryItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gallery</h1>
        <p className="text-gray-600">Memories and moments from our community</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card hover className="cursor-pointer overflow-hidden p-0">
              <div onClick={() => setSelectedItem(item.id)}>
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  {item.mediaType === 'video' && (
                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                      <Video className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedItem(null)}
            >
              <button
                className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-lg"
                onClick={() => setSelectedItem(null)}
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={galleryItems.find(i => i.id === selectedItem)?.mediaUrl}
                alt="Full size"
                className="max-w-full max-h-full rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
