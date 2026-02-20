import { Card } from '../components/ui/Card';
import { Newspaper, Calendar } from 'lucide-react';
import { storage } from '../lib/storage';
import { motion } from 'framer-motion';

export function Newsletters() {
  const newsletters = storage.getNewsletters();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Newsletters</h1>
        <p className="text-gray-600">Stay updated with our latest news and announcements</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {newsletters.map((newsletter, index) => (
          <motion.div
            key={newsletter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Newspaper className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{newsletter.title}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(newsletter.publishedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-3">{newsletter.content}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
