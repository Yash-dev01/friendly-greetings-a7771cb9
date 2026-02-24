import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';

import { Archive, Award, Building, Microscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { archiveService, Archive as ArchiveType } from '../services/archiveService';

export function Archives() {
  const [archives, setArchives] = useState<ArchiveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchArchives();
  }, [categoryFilter]);

  const fetchArchives = async () => {
    try {
      const data = await archiveService.getArchives(categoryFilter ? { category: categoryFilter } : undefined);
      setArchives(data);
    } catch (err) {
      console.error('Failed to fetch archives', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'awards': return Award;
      case 'infrastructure': return Building;
      case 'research': return Microscope;
      default: return Archive;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'awards': return 'bg-yellow-100 text-yellow-700';
      case 'infrastructure': return 'bg-blue-100 text-blue-700';
      case 'research': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="text-center py-10 text-gray-500">Loading archives...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Archives</h1>
          <p className="text-gray-600">Celebrating our institution's achievements and milestones</p>
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          <option value="Awards">Awards</option>
          <option value="Research">Research</option>
          <option value="Infrastructure">Infrastructure</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {archives.map((archive, index) => {
          const Icon = getCategoryIcon(archive.category);
          return (
            <motion.div key={archive._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
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

      {archives.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No archives found</p>
          </div>
        </Card>
      )}
    </div>
  );
}
