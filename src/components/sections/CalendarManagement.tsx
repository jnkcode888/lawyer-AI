import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, ClockIcon, MapPinIcon, UsersIcon, CheckCircleIcon, FolderIcon, GavelIcon, CalendarIcon, EditIcon, Trash2Icon, XIcon } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export const CalendarManagement = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [form, setForm] = useState<any>({ title: '', event_date: '', event_time: '', location: '', type: 'court', description: '' });
  const [editId, setEditId] = useState<string | null>(null);
  const [notification, setNotification] = useState('');
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line
  }, [currentMonth]);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
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

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  // Get day of week for first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({
        day: null,
        isCurrentMonth: false
      });
    }
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.event_date);
        return (
          eventDate.getDate() === date.getDate() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getFullYear() === date.getFullYear()
        );
      });
      days.push({
        day: i,
        isCurrentMonth: true,
        isToday: new Date().toDateString() === date.toDateString(),
        date: date,
        events: dayEvents
      });
    }
    return days;
  };
  const calendarDays = generateCalendarDays();
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  // Get today's events
  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.event_date);
    return eventDate.toDateString() === new Date().toDateString();
  });
  // Get upcoming events (next 7 days)
  const upcomingEvents = events.filter(event => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const eventDate = new Date(event.event_date);
    return eventDate > today && eventDate <= nextWeek;
  });
  // Get event type style
  const getEventTypeStyle = (type: string) => {
    switch (type) {
      case 'court':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'client':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deadline':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'internal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  // Get event type icon
  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'court':
        return <GavelIcon size={14} className="mr-1" />;
      case 'client':
        return <UsersIcon size={14} className="mr-1" />;
      case 'deadline':
        return <ClockIcon size={14} className="mr-1" />;
      case 'internal':
        return <FolderIcon size={14} className="mr-1" />;
      default:
        return <CalendarIcon size={14} className="mr-1" />;
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Calendar Management</h1>
        <p className="text-gray-600 mt-2">Manage your court dates, client meetings, and case deadlines</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calendar Column */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <h2 className="text-xl font-medium text-gray-800">
                  {currentMonth.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
                </h2>
              </div>
              <div className="flex items-center">
                <button onClick={prevMonth} className="p-1 rounded-md hover:bg-gray-100">
                  <ChevronLeftIcon size={20} className="text-gray-600" />
                </button>
                <button onClick={nextMonth} className="p-1 rounded-md hover:bg-gray-100 ml-1">
                  <ChevronRightIcon size={20} className="text-gray-600" />
                </button>
                <button className="ml-4 flex items-center text-sm text-navy-700 font-medium hover:text-navy-800" onClick={() => openAddModal()}>
                  <PlusIcon size={16} className="mr-1" />
                  Add Event
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="text-center text-gray-500 text-sm font-medium">
                  {day}
                </div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => <div key={index} className={`min-h-[80px] border rounded-md p-1 ${!day.isCurrentMonth ? 'bg-gray-50 border-gray-100' : day.isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200 hover:border-gray-300'}`}>
                  {day.day && <>
                      <div className="text-right mb-1">
                        <span className={`text-sm ${day.isToday ? 'font-bold text-blue-600' : 'text-gray-700'}`}>{day.day}</span>
                      </div>
                      <div className="space-y-1">
                        {day.events.map((event: any) => <div key={event.id} className={`text-xs truncate px-1 py-0.5 rounded border ${getEventTypeStyle(event.type)} flex items-center justify-between`} title={event.title}>
                            <span>{event.title}</span>
                            <span className="flex gap-1">
                              <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(event)} title="Edit"><EditIcon size={12} /></button>
                              <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(event.id)} title="Delete"><Trash2Icon size={12} /></button>
                            </span>
                          </div>)}
                      </div>
                      <button className="mt-2 w-full text-xs text-navy-700 hover:text-navy-800" onClick={() => openAddModal(day.date)}>+ Add</button>
                    </>}
                </div>)}
            </div>
            {notification && <div className="text-green-600 mt-4">{notification}</div>}
            {loading && <div className="text-gray-500 mt-4">Loading events...</div>}
            {error && <div className="text-red-600 mt-4">{error}</div>}
          </div>
        </div>
        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Today's Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Today's Events</h3>
            {todayEvents.length > 0 ? <div className="space-y-3">
                {todayEvents.map(event => <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-1 flex items-center justify-between">
                    <div>
                    <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1"><ClockIcon size={14} className="mr-1" />{event.event_time}</div>
                      <div className="flex items-center text-sm text-gray-600 mt-1"><MapPinIcon size={14} className="mr-1" />{event.location}</div>
                    </div>
                    <span className="flex gap-1">
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(event)} title="Edit"><EditIcon size={14} /></button>
                      <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(event.id)} title="Delete"><Trash2Icon size={14} /></button>
                    </span>
                  </div>)}
              </div> : <p className="text-gray-500 text-sm">No events scheduled for today</p>}
          </div>
          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Events</h3>
            {upcomingEvents.length > 0 ? <div className="space-y-3">
                {upcomingEvents.map(event => <div key={event.id} className="flex items-start justify-between">
                    <div className="bg-gray-100 rounded-md p-2 mr-3 flex-shrink-0 text-center w-10">
                      <div className="text-xs text-gray-500">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-lg font-bold text-gray-800">{new Date(event.event_date).getDate()}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{event.title}</h4>
                      <div className="flex items-center text-xs text-gray-600 mt-1"><div className="flex items-center">{getEventTypeIcon(event.type)}<span className="capitalize">{event.type}</span></div></div>
                    </div>
                    <span className="flex gap-1">
                      <button className="text-blue-600 hover:text-blue-800" onClick={() => openEditModal(event)} title="Edit"><EditIcon size={14} /></button>
                      <button className="text-red-600 hover:text-red-800" onClick={() => setShowDeleteId(event.id)} title="Delete"><Trash2Icon size={14} /></button>
                    </span>
                  </div>)}
              </div> : <p className="text-gray-500 text-sm">No upcoming events in the next 7 days</p>}
          </div>
          {/* Event Types Legend */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Event Types</h3>
            <div className="space-y-2">
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span><span className="text-sm text-gray-700">Court Appearances</span></div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span><span className="text-sm text-gray-700">Client Meetings</span></div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span><span className="text-sm text-gray-700">Filing Deadlines</span></div>
              <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span><span className="text-sm text-gray-700">Internal Meetings</span></div>
            </div>
          </div>
        </div>
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