import { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Heart, MessageCircle, Share2, Briefcase, Calendar, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { feedService, FeedItem } from '../services/feedService';

export function Feed() {
  const [feedType, setFeedType] = useState<'all' | 'posts' | 'jobs' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeed = async () => {
      setLoading(true);
      try {
        const data = await feedService.getFeed(feedType);
        setFeedItems(data);
      } catch (err) {
        console.error('Failed to load feed', err);
      } finally {
        setLoading(false);
      }
    };
    loadFeed();
  }, [feedType]);

  const filteredItems = feedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleLike = (id: string) => {
    const newLiked = new Set(likedItems);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedItems(newLiked);
  };

  const filterButtons = [
    { id: 'all', label: 'All', icon: null },
    { id: 'posts', label: 'Posts', icon: null },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <aside className="lg:col-span-1 order-2 lg:order-1">
        <Card className="sticky top-20">
          <div className="space-y-4">
            <div>
              <img
                src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Profile cover"
                className="w-full h-24 object-cover rounded-lg mb-3"
              />
              <div className="text-center">
                <div className="w-16 h-16 mx-auto -mt-8 mb-2">
                  <img
                    src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                  />
                </div>
                <h3 className="font-bold text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 mt-1">Add a photo and bio to stand out</p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Profile viewers</span>
                <span className="font-bold text-gray-900">42</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Post impressions</span>
                <span className="font-bold text-gray-900">128</span>
              </div>
            </div>
          </div>
        </Card>
      </aside>

      <main className="lg:col-span-2 order-1 lg:order-2 space-y-6">
        <Card className="sticky top-20 z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Your profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <Input placeholder="Start a post..." className="flex-1 rounded-full" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterButtons.map(btn => {
                const Icon = btn.icon;
                return (
                  <Button
                    key={btn.id}
                    onClick={() => setFeedType(btn.id as any)}
                    className={`whitespace-nowrap ${
                      feedType === btn.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4 mr-1" />}
                    {btn.label}
                  </Button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search in feed..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <Card>
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading feed...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <div className="pb-4 border-b border-gray-200">
                    <div className="flex items-start space-x-3">
                      {item.user?.avatarUrl ? (
                        <img
                          src={item.user.avatarUrl}
                          alt={item.user.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400" />
                      )}

                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">
                          {item.user?.fullName || 'IdeaBind'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.user?.position && `${item.user.position} • `}
                          <span>{item.user?.company || 'IdeaBind Admin'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.type === 'post' ? 'bg-blue-100 text-blue-700' :
                        item.type === 'job' ? 'bg-green-100 text-green-700' :
                        item.type === 'event' ? 'bg-purple-100 text-purple-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="py-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>

                    {item.type === 'job' && (
                      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                        <span>{item.company}</span>
                        <span>•</span>
                        <span>{item.location}</span>
                        {item.salaryRange && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">{item.salaryRange}</span>
                          </>
                        )}
                      </div>
                    )}

                    {item.type === 'event' && item.location && (
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{item.location}</span>
                      </div>
                    )}

                    <p className="text-gray-700 line-clamp-3">{item.content}</p>
                  </div>

                  {item.imageUrl && (
                    <div className="my-4 rounded-lg overflow-hidden bg-gray-100 h-48">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={() => {}}
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200 flex justify-around text-gray-600">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleLike(item._id)}
                      className={`flex-1 flex items-center justify-center space-x-2 ${
                        likedItems.has(item._id) ? 'text-blue-600' : ''
                      }`}
                    >
                      <Heart
                        className="w-4 h-4"
                        fill={likedItems.has(item._id) ? 'currentColor' : 'none'}
                      />
                      <span className="text-sm">
                        {(item.likeCount || 0) + (likedItems.has(item._id) ? 1 : 0)}
                      </span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center space-x-2">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">{item.commentCount || 0}</span>
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 flex items-center justify-center space-x-2">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}

            {filteredItems.length === 0 && (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No content to show</p>
                  <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
