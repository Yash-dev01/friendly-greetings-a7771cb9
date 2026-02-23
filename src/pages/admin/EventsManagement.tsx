import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types';
import { motion } from 'framer-motion';
import { eventService } from '../../services/eventService';

export function EventsManagement() {
  const { } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: ''
  });

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventService.getEvents();
      const eventsArray = Array.isArray(response) ? response : (response as any).data; // handle API object
      setEvents(eventsArray || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filter upcoming and past events safely
  const upcomingEvents = Array.isArray(events)
    ? events.filter(e => new Date(e.eventDate) > new Date())
    : [];
  const pastEvents = Array.isArray(events)
    ? events.filter(e => new Date(e.eventDate) <= new Date())
    : [];

  // Handle create/update form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, formData);
      } else {
        await eventService.createEvent(formData);
      }
      setFormData({ title: '', description: '', eventDate: '', location: '' });
      setEditingEvent(null);
      setIsModalOpen(false);
      fetchEvents(); // refresh events
    } catch (err: any) {
      alert(err.message || 'Failed to save event');
    }
  };

  // Edit event
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
      location: event.location
    });
    setIsModalOpen(true);
  };

  // Delete event
  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(eventId);
      fetchEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  // Open modal for new event
  const openNewEventModal = () => {
    setEditingEvent(null);
    setFormData({ title: '', description: '', eventDate: '', location: '' });
    setIsModalOpen(true);
  };

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
          <p className="text-gray-600 mt-1">Create and manage institutional events</p>
        </div>
        <Button onClick={openNewEventModal} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{events.length}</p>
            <p className="text-sm text-gray-600">Total Events</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Calendar className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
            <p className="text-sm text-gray-600">Upcoming Events</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-gray-900">
              {events.reduce((sum, e) => sum + ((e as any).currentAttendees || e.attendeesCount || 0), 0)}
            </p>
            <p className="text-sm text-gray-600">Total Attendees</p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 gap-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            </Card>
          ) : (
            upcomingEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card hover>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-700 mb-4">{event.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.eventDate).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{(event as any).currentAttendees || event.attendeesCount || 0} attendees</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        className="flex items-center space-x-1"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Past Events</h2>
          <div className="grid grid-cols-1 gap-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{(event as any).currentAttendees || event.attendeesCount || 0} attended</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? 'Edit Event' : 'Create New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
            />
          </div>

          <Input
            label="Date & Time"
            type="datetime-local"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            required
          />

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingEvent(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingEvent ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}




// import { useState } from 'react';
// import { Card } from '../../components/ui/Card';
// import { Button } from '../../components/ui/Button';
// import { Input } from '../../components/ui/Input';
// import { Modal } from '../../components/ui/Modal';
// import { Calendar, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react';
// import { storage } from '../../lib/storage';
// import { useAuth } from '../../context/AuthContext';
// import type { Event } from '../../types';
// import { motion } from 'framer-motion';

// export function EventsManagement() {
//   const { user } = useAuth();
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingEvent, setEditingEvent] = useState<Event | null>(null);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     eventDate: '',
//     location: ''
//   });

//   const events = storage.getEvents();
//   const upcomingEvents = events.filter(e => new Date(e.eventDate) > new Date());
//   const pastEvents = events.filter(e => new Date(e.eventDate) <= new Date());

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (editingEvent) {
//       const updatedEvents = events.map(evt =>
//         evt.id === editingEvent.id
//           ? { ...evt, ...formData }
//           : evt
//       );
//       storage.setEvents(updatedEvents);
//     } else {
//       const newEvent: Event = {
//         id: Date.now().toString(),
//         ...formData,
//         createdBy: user?.id || '',
//         attendeesCount: 0,
//         createdAt: new Date().toISOString()
//       };
//       storage.addEvent(newEvent);
//     }

//     setFormData({ title: '', description: '', eventDate: '', location: '' });
//     setEditingEvent(null);
//     setIsModalOpen(false);
//   };

//   const handleEdit = (event: Event) => {
//     setEditingEvent(event);
//     setFormData({
//       title: event.title,
//       description: event.description,
//       eventDate: new Date(event.eventDate).toISOString().slice(0, 16),
//       location: event.location
//     });
//     setIsModalOpen(true);
//   };

//   const handleDelete = (eventId: string) => {
//     if (confirm('Are you sure you want to delete this event?')) {
//       const updatedEvents = events.filter(e => e.id !== eventId);
//       storage.setEvents(updatedEvents);
//     }
//   };

//   const openNewEventModal = () => {
//     setEditingEvent(null);
//     setFormData({ title: '', description: '', eventDate: '', location: '' });
//     setIsModalOpen(true);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
//           <p className="text-gray-600 mt-1">Create and manage institutional events</p>
//         </div>
//         <Button onClick={openNewEventModal} className="flex items-center space-x-2">
//           <Plus className="w-4 h-4" />
//           <span>Create Event</span>
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card>
//           <div className="text-center">
//             <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
//             <p className="text-3xl font-bold text-gray-900">{events.length}</p>
//             <p className="text-sm text-gray-600">Total Events</p>
//           </div>
//         </Card>
//         <Card>
//           <div className="text-center">
//             <Calendar className="w-12 h-12 text-green-600 mx-auto mb-2" />
//             <p className="text-3xl font-bold text-gray-900">{upcomingEvents.length}</p>
//             <p className="text-sm text-gray-600">Upcoming Events</p>
//           </div>
//         </Card>
//         <Card>
//           <div className="text-center">
//             <Users className="w-12 h-12 text-purple-600 mx-auto mb-2" />
//             <p className="text-3xl font-bold text-gray-900">
//               {events.reduce((sum, e) => sum + e.attendeesCount, 0)}
//             </p>
//             <p className="text-sm text-gray-600">Total Attendees</p>
//           </div>
//         </Card>
//       </div>

//       <div>
//         <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
//         <div className="grid grid-cols-1 gap-4">
//           {upcomingEvents.length === 0 ? (
//             <Card>
//               <p className="text-gray-500 text-center py-8">No upcoming events</p>
//             </Card>
//           ) : (
//             upcomingEvents.map((event, index) => (
//               <motion.div
//                 key={event.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//               >
//                 <Card hover>
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
//                       <p className="text-gray-700 mb-4">{event.description}</p>
//                       <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                         <div className="flex items-center space-x-2">
//                           <Calendar className="w-4 h-4" />
//                           <span>
//                             {new Date(event.eventDate).toLocaleDateString('en-US', {
//                               weekday: 'short',
//                               year: 'numeric',
//                               month: 'short',
//                               day: 'numeric',
//                               hour: '2-digit',
//                               minute: '2-digit'
//                             })}
//                           </span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <MapPin className="w-4 h-4" />
//                           <span>{event.location}</span>
//                         </div>
//                         <div className="flex items-center space-x-2">
//                           <Users className="w-4 h-4" />
//                           <span>{event.attendeesCount} attendees</span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center space-x-2 ml-4">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => handleEdit(event)}
//                         className="flex items-center space-x-1"
//                       >
//                         <Edit className="w-4 h-4" />
//                         <span>Edit</span>
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDelete(event.id)}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
//                 </Card>
//               </motion.div>
//             ))
//           )}
//         </div>
//       </div>

//       {pastEvents.length > 0 && (
//         <div>
//           <h2 className="text-xl font-bold text-gray-900 mb-4">Past Events</h2>
//           <div className="grid grid-cols-1 gap-4">
//             {pastEvents.map((event) => (
//               <Card key={event.id} className="opacity-75">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
//                     <div className="flex flex-wrap gap-4 text-sm text-gray-600">
//                       <div className="flex items-center space-x-2">
//                         <Calendar className="w-4 h-4" />
//                         <span>{new Date(event.eventDate).toLocaleDateString()}</span>
//                       </div>
//                       <div className="flex items-center space-x-2">
//                         <Users className="w-4 h-4" />
//                         <span>{event.attendeesCount} attended</span>
//                       </div>
//                     </div>
//                   </div>
//                   <Button
//                     variant="danger"
//                     size="sm"
//                     onClick={() => handleDelete(event.id)}
//                   >
//                     <Trash2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}

//       <Modal
//         isOpen={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingEvent(null);
//         }}
//         title={editingEvent ? 'Edit Event' : 'Create New Event'}
//       >
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <Input
//             label="Event Title"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             required
//             placeholder="Annual Alumni Reunion 2025"
//           />

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               required
//               placeholder="Event description..."
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
//             />
//           </div>

//           <Input
//             label="Date & Time"
//             type="datetime-local"
//             value={formData.eventDate}
//             onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
//             required
//           />

//           <Input
//             label="Location"
//             value={formData.location}
//             onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//             required
//             placeholder="Main Campus Auditorium"
//           />

//           <div className="flex justify-end space-x-3 pt-4">
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 setIsModalOpen(false);
//                 setEditingEvent(null);
//               }}
//             >
//               Cancel
//             </Button>
//             <Button type="submit">
//               {editingEvent ? 'Update Event' : 'Create Event'}
//             </Button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }
