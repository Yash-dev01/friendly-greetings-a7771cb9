import { Card } from '../components/ui/Card';
import { Archive, Award, Building, Microscope } from 'lucide-react';
import { storage } from '../lib/storage';
import { motion } from 'framer-motion';

export function Archives() {
  const archives = storage.getArchives();

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'awards':
        return Award;
      case 'infrastructure':
        return Building;
      case 'research':
        return Microscope;
      default:
        return Archive;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'awards':
        return 'bg-yellow-100 text-yellow-700';
      case 'infrastructure':
        return 'bg-blue-100 text-blue-700';
      case 'research':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Archives</h1>
        <p className="text-gray-600">Celebrating our institution's achievements and milestones</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {archives.map((archive, index) => {
          const Icon = getCategoryIcon(archive.category);
          return (
            <motion.div
              key={archive.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover>
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getCategoryColor(archive.category)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{archive.title}</h3>
                      <span className="text-2xl font-bold text-blue-600">{archive.year}</span>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getCategoryColor(archive.category)}`}>
                      {archive.category}
                    </span>
                    <p className="text-gray-700">{archive.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
