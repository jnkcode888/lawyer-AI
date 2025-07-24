import React, { useState, useEffect } from 'react';
import { CalendarIcon, ClockIcon, PlusIcon, EditIcon, Trash2Icon, XIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const CourtSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ title: '', event_date: '', event_time: '', location: '', type: 'court', description: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [selectedDate]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    const start = new Date(selectedDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('event_date', start.toISOString().slice(0, 10))
      .lte('event_date', end.toISOString().slice(0, 10));
    if (error) {
      setError('Failed to fetch events.');
      setEvents([]);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    for (let i = -3; i <= 10; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };
  const days = generateCalendarDays();

  // CRUD Handlers
  const openAddModal = (date?: Date) => {
    setForm({ title: '', event_date: date ? date.toISOString().slice(0, 10) : '', event_time: '', location: '', type: 'court', description: '' });
    setModalMode('add');
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (event: any) => {
    setForm({ ...event });
    setModalMode('edit');
    setEditId(event.id);
    setShowModal(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification('');
    if (modalMode === 'add') {
      const { error } = await supabase.from('events').insert([{ ...form }]);
      if (error) {
        setNotification('Failed to add event.');
      } else {
        setNotification('Event added successfully!');
        setShowModal(false);
        fetchEvents();
      }
    } else if (modalMode === 'edit' && editId) {
      const { error } = await supabase.from('events').update({ ...form }).eq('id', editId);
      if (error) {
        setNotification('Failed to update event.');
      } else {
        setNotification('Event updated successfully!');
        setShowModal(false);
        fetchEvents();
      }
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setNotification('');
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      setNotification('Failed to delete event.');
    } else {
      setNotification('Event deleted successfully!');
      setShowDeleteId(null);
      fetchEvents();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Court Schedule</h1>
        <p className="text-gray-600 mt-2">Manage your hearings, deadlines, and appointments</p>
      </header>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 overflow-x-auto">
        <div className="flex space-x-2 min-w-max">
          {days.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={index}
                className={`flex flex-col items-center p-2 rounded-lg min-w-[60px] ${isSelected ? 'bg-navy-700 text-white' : isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs font-medium">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold my-1">{date.getDate()}</span>
                {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
              </button>
            );
        })}
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        <button className="flex items-center text-sm font-medium text-navy-700 hover:text-navy-800" onClick={() => openAddModal(selectedDate)}>
          <PlusIcon size={16} className="mr-1" />
          Add Event
        </button>
      </div>
      <div className="space-y-4">
        {notification && <div className="text-green-600 mb-2">{notification}</div>}
        {loading && <div className="text-gray-500">Loading events...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && events.length === 0 && <div className="text-gray-500">No events for this date.</div>}
        {events.map(event => (
          <div key={event.id} className={`bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between`}>
            <div>
              <h3 className="font-medium text-gray-800">{event.title}</h3>
              <div className="flex items-center text-gray-600 text-sm mb-2"><ClockIcon size={14} className="mr-1" />{event.event_time}</div>
              <div className="flex items-center text-gray-600 text-sm mb-2"><CalendarIcon size={14} className="mr-1" />{event.location}</div>
              <div className="text-xs text-gray-500 mb-2">{event.description}</div>
            </div>
            <span className="flex gap-1">
              <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(event)} title="Edit"><EditIcon size={16} /></button>
              <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(event.id)} title="Delete"><Trash2Icon size={16} /></button>
            </span>
          </div>
        ))}
      </div>
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}><XIcon size={20} /></button>
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Event' : 'Edit Event'}</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Title</label>
                <input name="title" value={form.title} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Date</label>
                <input name="event_date" type="date" value={form.event_date} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" required />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Time</label>
                <input name="event_time" value={form.event_time} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Location</label>
                <input name="location" value={form.location} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2">
                  <option value="court">Court</option>
                  <option value="client">Client</option>
                  <option value="deadline">Deadline</option>
                  <option value="internal">Internal</option>
                </select>
            </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} className="w-full border border-gray-300 rounded p-2" />
                    </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-navy-700 text-white rounded hover:bg-navy-800" disabled={loading}>{modalMode === 'add' ? 'Add' : 'Update'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete confirmation modal */}
      {showDeleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">Delete Event?</h3>
            <p className="mb-4">Are you sure you want to delete this event?</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={() => setShowDeleteId(null)}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(showDeleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
      </div>
  );
};